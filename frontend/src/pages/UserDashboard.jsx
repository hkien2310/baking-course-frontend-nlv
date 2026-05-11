import React, { useEffect, useState } from 'react';
import './UserDashboard.css';
import PageTitle from '../components/Shared/PageTitle';
import { getMe, getLoyaltyConfig } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { formatPrice, getOrderStatusBadge } from '../utils/formatters';
import { ROUTES } from '../constants/routes';
import { useTranslation } from '../i18n/LanguageContext';
import { imageUrl } from '../utils/imageUrl';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [loyaltyConfig, setLoyaltyConfig] = useState(null);
  const [activeTab, setActiveTab] = useState('courses');
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

  if (!user) return (
    <div className="text-center" style={{ padding: '150px 0' }}>
      <div className="spinner-border" role="status"></div>
    </div>
  );

  // Compute stats
  const confirmedOrders = user.orders?.filter(o => o.status === 'CONFIRMED') || [];
  const totalSpent = user.totalSpent || 0; // Use DB field as source of truth for loyalty
  const initials = user.fullName?.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || '?';
  const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long' }) : '';

  const tabs = [
    { key: 'courses', icon: 'fa-graduation-cap', label: t('userDash.tabs.courses') },
    { key: 'orders', icon: 'fa-shopping-bag', label: t('userDash.tabs.orders') },
    { key: 'loyalty', icon: 'fa-gift', label: 'Ưu đãi' },
  ];

  const imgSrc = (src) => imageUrl(src, `${import.meta.env.BASE_URL}images/gallery/09.jpg`);

  return (
    <>
      <PageTitle 
        title={t('userDash.title')}
        breadcrumbs={[{ label: t('header.home') || 'Trang chủ', link: '/' }, { label: t('userDash.breadcrumb') }]}
      />
      <section className="ls s-py-60 s-py-lg-100">
        <div className="container">

          {/* ─── Profile Header Card ─── */}
          <div className="ud-profile-card">
            <div className="ud-profile-bg"></div>
            <div className="ud-profile-body">
              <div className="ud-avatar">{initials}</div>
              <div className="ud-info">
                <h3 className="ud-name">
                  {user.fullName}
                  {user.memberTier && user.memberTier !== 'NONE' && (
                    <span className="ud-tier-badge" style={{ 
                      marginLeft: 12, 
                      fontSize: 12, 
                      padding: '4px 12px', 
                      borderRadius: 20, 
                      backgroundColor: loyaltyConfig?.tiers?.find(t => t.name === user.memberTier)?.color || '#c19a5b',
                      color: '#fff',
                      verticalAlign: 'middle',
                      boxShadow: `0 2px 8px ${loyaltyConfig?.tiers?.find(t => t.name === user.memberTier)?.color || '#c19a5b'}4d`,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      <i className="fa fa-star mr-1"></i>{user.memberTier}
                    </span>
                  )}
                </h3>
                <p className="ud-email"><i className="fa fa-envelope-o mr-2"></i>{user.email}</p>
                <div className="ud-meta">
                  {memberSince && (
                    <span className="ud-member-since">
                      <i className="fa fa-calendar-o mr-1"></i>{t('userDash.memberSince', { date: memberSince })}
                    </span>
                  )}
                </div>
              </div>
              <div className="ud-actions">
                <button onClick={handleLogout} className="btn btn-outline-maincolor btn-sm">
                  <i className="fa fa-sign-out mr-1"></i>{t('userDash.logout')}
                </button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="ud-stats">
              <div className="ud-stat">
                <div className="ud-stat-num">{confirmedOrders.length}</div>
                <div className="ud-stat-label">{t('userDash.stats.coursesPurchased')}</div>
              </div>
              <div className="ud-stat">
                <div className="ud-stat-num">{user.orders?.length || 0}</div>
                <div className="ud-stat-label">{t('userDash.stats.totalOrders')}</div>
              </div>
              <div className="ud-stat">
                <div className="ud-stat-num">{formatPrice(totalSpent, false)}</div>
                <div className="ud-stat-label">Tổng chi tiêu</div>
              </div>
              <div className="ud-stat">
                <div className="ud-stat-num">{user.enrollments?.length || 0}</div>
                <div className="ud-stat-label">Khóa học của tôi</div>
              </div>
              <div className="ud-stat">
                <div className="ud-stat-num" style={{ fontSize: 15, fontWeight: 700, color: 'var(--colorMain)' }}>{user.memberTier && user.memberTier !== 'NONE' ? user.memberTier : 'Thành viên'}</div>
                <div className="ud-stat-label">Hạng thành viên</div>
              </div>
              <div className="ud-stat">
                <div className="ud-stat-num">{(user.points || 0).toLocaleString()}</div>
                <div className="ud-stat-label">Điểm tích lũy</div>
              </div>
            </div>
          </div>

          {/* ─── Tab Navigation ─── */}
          <div className="ud-tabs">
            {tabs.map(t_tab => (
              <button
                key={t_tab.key}
                className={`ud-tab ${activeTab === t_tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(t_tab.key)}
              >
                <i className={`fa ${t_tab.icon} mr-2`}></i>{t_tab.label}
              </button>
            ))}
          </div>

          {/* ─── Tab: My Courses ─── */}
          {activeTab === 'courses' && (
            <div className="ud-tab-content">
              {confirmedOrders.length === 0 ? (
                <div className="ud-empty">
                  <div className="ud-empty-icon">📚</div>
                  <h4>{t('userDash.courses.empty')}</h4>
                  <p className="text-muted">{t('userDash.courses.emptyDesc')}</p>
                  <Link to={ROUTES.PROGRAM} className="btn btn-maincolor mt-3">
                    <i className="fa fa-search mr-1"></i> {t('userDash.courses.explore')}
                  </Link>
                </div>
              ) : (
                <div className="row">
                  {confirmedOrders.map(order => (
                    <div className="col-md-6 col-lg-4 mb-4" key={order.id}>
                      <div className="ud-course-card">
                        <div className="ud-course-thumb">
                          {order.program?.thumbnail ? (
                            <img 
                              src={imgSrc(order.program.thumbnail)}
                              alt={order.program?.title}
                            />
                          ) : (
                            <div className="ud-course-thumb-placeholder">
                              <i className="fa fa-birthday-cake"></i>
                            </div>
                          )}
                          <div className="ud-course-badge">
                            <i className="fa fa-check-circle mr-1"></i>{t('userDash.courses.purchased')}
                          </div>
                        </div>
                        <div className="ud-course-body">
                          <h5 className="ud-course-title">{order.program?.title || 'Course'}</h5>
                          <div className="ud-course-meta">
                            <span><i className="fa fa-money mr-1"></i>{formatPrice(order.amount)}</span>
                            <span><i className="fa fa-calendar mr-1"></i>{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                          {order.paymentMethod && (
                            <span className={`ud-method-badge ${order.paymentMethod === 'VNPAY' ? 'vnpay' : 'manual'}`}>
                              {order.paymentMethod === 'VNPAY' ? t('userDash.courses.vnpay') : t('userDash.courses.bankTransfer')}
                            </span>
                          )}
                          <Link to={ROUTES.PROGRAM_DETAIL(order.program?.slug)} className="btn btn-maincolor btn-sm btn-block mt-3">
                            <i className="fa fa-play-circle mr-1"></i> {t('userDash.courses.studyNow')}
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── Tab: Orders ─── */}
          {activeTab === 'orders' && (
            <div className="ud-tab-content">
              {(!user.orders || user.orders.length === 0) ? (
                <div className="ud-empty">
                  <div className="ud-empty-icon">🛒</div>
                  <h4>{t('userDash.orders.empty')}</h4>
                  <p className="text-muted">{t('userDash.orders.emptyDesc')}</p>
                  <Link to={ROUTES.PROGRAM} className="btn btn-maincolor mt-3">
                    <i className="fa fa-search mr-1"></i> {t('userDash.orders.viewCourses')}
                  </Link>
                </div>
              ) : (
                <div className="ud-orders-list">
                  {user.orders.map(order => {
                    const badge = getOrderStatusBadge(order.status);
                    return (
                      <div className="ud-order-row" key={order.id}>
                        <div className="ud-order-thumb">
                          {order.program?.thumbnail ? (
                            <img 
                              src={imgSrc(order.program.thumbnail)}
                              alt={order.program?.title}
                            />
                          ) : (
                            <div className="ud-order-thumb-ph"><i className="fa fa-birthday-cake"></i></div>
                          )}
                        </div>
                        <div className="ud-order-info">
                          <h6 className="ud-order-title">
                            <Link to={ROUTES.PROGRAM_DETAIL(order.program?.slug)} className="color-main">
                              {order.program?.title || 'Unknown'}
                            </Link>
                          </h6>
                          <div className="ud-order-code">
                            <code>{order.orderCode}</code>
                            <span className="ud-order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="ud-order-amount">{formatPrice(order.amount)}</div>
                        <div className="ud-order-status">
                          <span className={`badge ${badge.className}`}>{badge.label}</span>
                          {order.paymentMethod && (
                            <small className="ud-order-method">
                              {order.paymentMethod === 'VNPAY' ? 'VNPay' : 'Bank'}
                            </small>
                          )}
                        </div>
                        <div className="ud-order-action">
                          {order.status === 'CONFIRMED' ? (
                            <Link to={ROUTES.PROGRAM_DETAIL(order.program?.slug)} className="btn btn-sm btn-outline-maincolor">
                              <i className="fa fa-play-circle"></i>
                            </Link>
                          ) : (order.status === 'PENDING' || order.status === 'REJECTED') ? (
                            <Link to={ROUTES.CHECKOUT(order.program?.slug)} className="btn btn-sm btn-warning">
                              <i className="fa fa-arrow-right"></i>
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Loyalty ── */}
          {activeTab === 'loyalty' && (() => {
            const tiers = loyaltyConfig?.tiers || [];
            const currentTier = tiers.find(t => t.name === user.memberTier);
            const sortedTiers = [...tiers].sort((a, b) => a.minSpent - b.minSpent);
            const nextTier = sortedTiers.find(t => t.minSpent > (user.totalSpent || 0));
            const spentVsNext = nextTier ? Math.min((user.totalSpent || 0) / nextTier.minSpent * 100, 100) : 100;
            const redeemRate = loyaltyConfig?.points?.redeemRate || 1;
            return (
              <div className="ud-tab-content">
                <div className="ud-loyalty-card" style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #f0f1f5', marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>Hạng thành viên hiện tại</div>
                      <h4 style={{ margin: 0, color: 'var(--colorMain)', fontWeight: 700 }}>{user.memberTier && user.memberTier !== 'NONE' ? user.memberTier : 'Thành viên'}</h4>
                      {currentTier && <div style={{ fontSize: 13, marginTop: 4, color: '#525f7f' }}>Ưu đãi: Giảm {currentTier.discountPercent}% mỗi lần mua</div>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, color: '#888' }}>Tổng chi tiêu</div>
                      <div style={{ fontWeight: 700, fontSize: 18 }}>{formatPrice(user.totalSpent || 0, false)}</div>
                    </div>
                  </div>
                  {nextTier && (
                    <div style={{ marginTop: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#888', marginBottom: 6 }}>
                        <span>Tiến trình lên hạng <strong>{nextTier.name}</strong></span>
                        <span>Cần thêm {formatPrice(nextTier.minSpent - (user.totalSpent || 0), false)}</span>
                      </div>
                      <div className="progress" style={{ height: 8, borderRadius: 8 }}>
                        <div className="progress-bar" style={{ width: `${spentVsNext}%`, background: 'var(--colorMain)', borderRadius: 8 }} />
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #f0f1f5' }}>
                  <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>Điểm tích lũy</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--colorMain)' }}>{(user.points || 0).toLocaleString()} điểm</div>
                  <div style={{ fontSize: 14, color: '#525f7f', marginTop: 4 }}>Tương đương {formatPrice((user.points || 0) * redeemRate, false)} khi thanh toán</div>
                  {loyaltyConfig?.points && loyaltyConfig.points.earnPer > 0 && (
                    <div style={{ fontSize: 12, color: '#aaa', marginTop: 12, padding: '8px 12px', background: '#f8f9fa', borderRadius: 8 }}>
                      Cứ mỗi {formatPrice(loyaltyConfig.points.earnPer, false)} chi tiêu → Nhận thêm {loyaltyConfig.points.earnRate.toLocaleString()} điểm
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

        </div>
      </section>
    </>
  );
};

export default UserDashboard;
