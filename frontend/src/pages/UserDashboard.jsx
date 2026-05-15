import React, { useEffect, useState } from 'react';
import { useInitOnLoaded } from '../hooks/useInitOnLoaded';
import './UserDashboard.css';
import PageTitle from '../components/Shared/PageTitle';
import { getMe, getLoyaltyConfig } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { formatPrice, getOrderStatusBadge } from '../utils/formatters';
import { ROUTES } from '../constants/routes';
import { useTranslation } from '../i18n/LanguageContext';
import { imageUrl } from '../utils/imageUrl';
import ChangePasswordModal from '../components/Shared/ChangePasswordModal';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [loyaltyConfig, setLoyaltyConfig] = useState(null);
  const [activeTab, setActiveTab] = useState('courses');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    Promise.all([getMe(), getLoyaltyConfig()])
      .then(([me, config]) => {
        if (me.role === 'ADMIN') { navigate(ROUTES.ADMIN, { replace: true }); return; }
        setUser(me);
        setLoyaltyConfig(config);
      }).catch(() => navigate('/auth'));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/auth');
  };

  const tabs = [
    { key: 'courses', icon: 'fa-graduation-cap', label: t('userDash.tabs.courses') },
    { key: 'orders', icon: 'fa-shopping-bag', label: t('userDash.tabs.orders') },
    { key: 'loyalty', icon: 'fa-gift', label: 'Ưu đãi' },
  ];

  const imgSrc = (src) => imageUrl(src, `${import.meta.env.BASE_URL}images/gallery/09.jpg`);

  useInitOnLoaded(!user);

  if (!user) return (
    <div className="text-center" style={{ padding: '150px 0' }}>
      <div className="spinner-border" role="status" style={{ color: '#6ab78e' }}></div>
    </div>
  );

  const confirmedOrders = user.orders?.filter(o => o.status === 'CONFIRMED') || [];
  const totalSpent = user.totalSpent || 0; 
  const initials = user.fullName?.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || '?';
  const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long' }) : '';

  return (
    <>
      <PageTitle 
        title={t('userDash.title')}
        breadcrumbs={[{ label: t('header.home') || 'Trang chủ', link: '/' }, { label: t('userDash.breadcrumb') }]}
      />
      <section className="ls s-py-60 s-py-lg-100" style={{ backgroundColor: '#fdfaf7' }}>
        <div className="container">

          {/* ─── UNIFIED HEADER BOX (Profile + Stats) ─── */}
          <div className="ud-main-box">
            <div className="ud-profile-section">
              <div className="ud-avatar-box">{initials}</div>
              <div className="ud-user-meta-info">
                <h3 className="ud-name" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                  {user.fullName}
                  {user.memberTier && user.memberTier !== 'NONE' && (
                    <span className="ud-tier-tag-v2">
                      <i className="fa fa-star mr-2"></i>{user.memberTier}
                    </span>
                  )}
                </h3>
                <p className="ud-email-text"><i className="fa fa-envelope-o mr-2"></i>{user.email}</p>
                <div className="ud-since-tag">
                  <i className="fa fa-calendar-o mr-2"></i>{t('userDash.memberSince', { date: memberSince })}
                </div>
              </div>
              <div className="ud-header-actions">
                <button onClick={() => setIsPasswordModalOpen(true)} className="btn btn-outline-dark btn-sm px-4">
                  <i className="fa fa-lock"></i> Đổi mật khẩu
                </button>
                <button onClick={handleLogout} className="btn btn-outline-maincolor btn-sm px-4">
                  <i className="fa fa-sign-out"></i> Đăng xuất
                </button>
              </div>
            </div>

            <div className="ud-stats-bar">
              <div className="ud-stat-item">
                <div className="ud-stat-value">{confirmedOrders.length}</div>
                <div className="ud-stat-title">{t('userDash.stats.coursesPurchased')}</div>
              </div>
              <div className="ud-stat-item">
                <div className="ud-stat-value">{user.orders?.length || 0}</div>
                <div className="ud-stat-title">{t('userDash.stats.totalOrders')}</div>
              </div>
              <div className="ud-stat-item">
                <div className="ud-stat-value">{formatPrice(totalSpent, false)}</div>
                <div className="ud-stat-title">Tổng chi tiêu</div>
              </div>
              <div className="ud-stat-item">
                <div className="ud-stat-value">{user.enrollments?.length || 0}</div>
                <div className="ud-stat-title">Lớp đăng ký</div>
              </div>
              <div className="ud-stat-item">
                <div className="ud-stat-value">{(user.points || 0).toLocaleString()}</div>
                <div className="ud-stat-title">Điểm tích lũy</div>
              </div>
            </div>
          </div>

          {/* ─── TABS NAVIGATION ─── */}
          <nav className="ud-nav-tabs">
            {tabs.map(t_tab => (
              <button
                key={t_tab.key}
                className={`ud-nav-btn ${activeTab === t_tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(t_tab.key)}
              >
                <i className={`fa ${t_tab.icon} mr-2`}></i>{t_tab.label}
              </button>
            ))}
          </nav>

          {/* ─── CONTENT BOX ─── */}
          <div className="ud-content-box shadow-lg">
            {activeTab === 'courses' && (
              <>
                {confirmedOrders.length === 0 ? (
                  <div className="ud-empty border-0">
                    <div className="ud-empty-icon">📚</div>
                    <h4>{t('userDash.noCourses')}</h4>
                    <p>{t('userDash.browseCatalog')}</p>
                    <Link to={ROUTES.PROGRAM} className="btn btn-maincolor mt-4 btn-pill">{t('userDash.viewCourses')}</Link>
                  </div>
                ) : (
                  <div className="ud-course-list-v3">
                    {confirmedOrders.map(order => (
                      <div key={order.id} className="ud-course-item-horizontal">
                        <div className="ud-course-thumb-horizontal">
                          <img src={imgSrc(order.program?.thumbnail)} alt={order.program?.title} />
                        </div>
                        <div className="ud-course-info-horizontal">
                          <h4>{order.program?.title}</h4>
                          <p className="course-short-desc">
                            {order.program?.description || order.program?.shortDescription || "Khám phá bí quyết làm bánh chuyên nghiệp cùng đội ngũ giảng viên hàng đầu tại YUM Saigon."}
                          </p>
                        </div>
                        <div className="ud-course-action-horizontal">
                          <Link to={ROUTES.PROGRAM_DETAIL(order.program?.slug)} className="btn btn-learn-now">
                            <i className="fa fa-play-circle mr-2"></i> Vào học
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'orders' && (
              <>
                {(!user.orders || user.orders.length === 0) ? (
                  <div className="ud-empty border-0">
                    <div className="ud-empty-icon">🛒</div>
                    <h4>Chưa có đơn hàng nào</h4>
                    <Link to={ROUTES.PROGRAM} className="btn btn-maincolor mt-4 btn-pill">Mua khóa học đầu tiên</Link>
                  </div>
                ) : (
                  <div className="ud-order-table-v3">
                    {/* TABLE HEADER */}
                    <div className="ud-order-header-v3">
                      <div className="ud-th-label">Khóa học</div>
                      <div className="ud-th-label th-date">Ngày đặt</div>
                      <div className="ud-th-label text-right" style={{ paddingRight: '20px' }}>Số tiền</div>
                      <div className="ud-th-label text-center">Trạng thái</div>
                      <div className="ud-th-label text-right">Thao tác</div>
                    </div>

                    {/* TABLE ROWS */}
                    {user.orders.map(order => {
                      const statusBadge = getOrderStatusBadge(order.status);
                      const statusClass = order.status.toLowerCase();
                      const orderDate = new Date(order.createdAt).toLocaleDateString('vi-VN');
                      return (
                        <div key={order.id} className="ud-order-row-v3">
                          <div className="ud-order-product-col">
                            <img className="ud-order-thumb-v3" src={imgSrc(order.program?.thumbnail)} alt="" />
                            <div className="ud-order-product-info">
                              <h5>{order.program?.title}</h5>
                              <span>#{order.orderCode}</span>
                            </div>
                          </div>
                          
                          <div className="ud-order-date-col">
                            <span className="ud-mobile-label mr-2 d-none-desktop">Ngày: </span>
                            {orderDate}
                          </div>
                          
                          <div className="ud-order-price-col">
                             <span className="ud-mobile-label mr-2 d-none-desktop">Tiền: </span>
                            <span className="ud-order-price-val">{formatPrice(order.amount, false)}</span>
                          </div>
                          
                          <div className="ud-order-status-col">
                            <span className="ud-mobile-label mr-2 d-none-desktop">T.Thái: </span>
                            <div className={`premium-status-badge-v2 ${statusClass}`}>
                              {statusBadge.label}
                            </div>
                          </div>
                          
                          <div className="ud-order-action-col">
                            {order.status === 'CONFIRMED' ? (
                              <Link to={ROUTES.PROGRAM_DETAIL(order.program?.slug)} className="btn btn-outline-maincolor btn-compact-action">
                                <i className="fa fa-play-circle mr-2"></i> Vào học
                              </Link>
                            ) : (order.status === 'PENDING' || order.status === 'REJECTED') ? (
                              <Link to={ROUTES.CHECKOUT(order.program?.slug)} className="btn btn-warning btn-compact-action">
                                <i className="fa fa-credit-card mr-2"></i> Thanh toán
                              </Link>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {activeTab === 'loyalty' && (() => {
              const tiers = loyaltyConfig?.tiers || [];
              const currentTier = tiers.find(t => t.name === user.memberTier);
              const sortedTiers = [...tiers].sort((a, b) => a.minSpent - b.minSpent);
              const nextTier = sortedTiers.find(t => t.minSpent > (user.totalSpent || 0));
              const spentVsNext = nextTier ? Math.min((user.totalSpent || 0) / nextTier.minSpent * 100, 100) : 100;
              const redeemRate = loyaltyConfig?.points?.redeemRate || 1;
              return (
                <div className="ud-loyalty-container">
                  <div className="row">
                    <div className="col-lg-7">
                      <div className="ud-loyalty-card" style={{ background: '#fff', borderRadius: 24, padding: 35, border: '2px solid #f1f5f9', marginBottom: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>Hạng thành viên</div>
                            <h3 style={{ margin: 0, color: '#6ab78e', fontWeight: 800, fontFamily: 'Playfair Display, serif', fontSize: '2.5rem' }}>{user.memberTier && user.memberTier !== 'NONE' ? user.memberTier : 'Thành viên'}</h3>
                            {currentTier && <div style={{ fontSize: 15, marginTop: 12, color: '#475569', fontWeight: 600 }}>Đặc quyền: Giảm <strong style={{ color: '#6ab78e' }}>{currentTier.discountPercent}%</strong> cho mọi đơn hàng</div>}
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>Chi tiêu</div>
                            <div style={{ fontWeight: 800, fontSize: 26, color: '#1e293b' }}>{formatPrice(user.totalSpent || 0, false)}</div>
                          </div>
                        </div>
                        {nextTier && (
                          <div style={{ marginTop: 35 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#64748b', marginBottom: 12, fontWeight: 600 }}>
                              <span>Tiến tới hạng <strong>{nextTier.name}</strong></span>
                              <span style={{ color: '#6ab78e' }}>Còn {formatPrice(nextTier.minSpent - (user.totalSpent || 0), false)}</span>
                            </div>
                            <div className="progress" style={{ height: 12, borderRadius: 10, backgroundColor: '#f1f5f9', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
                              <div className="progress-bar" style={{ width: `${spentVsNext}%`, background: 'linear-gradient(90deg, #6ab78e, #4f9a71)', borderRadius: 10, transition: 'width 1s ease-in-out' }} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-lg-5">
                      <div style={{ background: '#fff', borderRadius: 24, padding: 35, border: '2px solid #f1f5f9', height: '100%', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>Điểm thưởng</div>
                        <div style={{ fontSize: 54, fontWeight: 800, color: '#6ab78e', fontFamily: 'Playfair Display, serif', lineHeight: 1 }}>{(user.points || 0).toLocaleString()} <span style={{ fontSize: 20, color: '#94a3b8' }}>điểm</span></div>
                        <div style={{ fontSize: 16, color: '#475569', marginTop: 15, fontWeight: 600 }}>
                          Ước tính: <strong style={{ color: '#1e293b' }}>{formatPrice((user.points || 0) * redeemRate, false)}</strong>
                        </div>
                        {loyaltyConfig?.points && loyaltyConfig.points.earnPer > 0 && (
                          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 25, padding: '15px', background: '#f8fafc', borderRadius: 15, border: '1px solid #f1f5f9', fontWeight: 500 }}>
                            <i className="fa fa-info-circle mr-2" style={{ color: '#6ab78e' }}></i>Tích <strong>{loyaltyConfig.points.earnRate.toLocaleString()} điểm</strong> khi chi tiêu {formatPrice(loyaltyConfig.points.earnPer, false)}.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

        </div>
      </section>

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 993px) {
          .d-none-desktop { display: none !important; }
        }
        .ud-tier-tag-v2 {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: #fff;
          padding: 4px 16px;
          border-radius: 50px;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 4px 12px rgba(217, 119, 6, 0.25);
          margin-left: 15px;
          height: 30px;
          vertical-align: middle;
          border: 2px solid #fff;
          font-family: sans-serif;
        }
      `}} />
    </>
  );
};

export default UserDashboard;
