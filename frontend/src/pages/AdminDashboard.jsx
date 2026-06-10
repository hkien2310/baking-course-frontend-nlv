import React, { useEffect, useState } from 'react';
import AdminPrograms from '../components/Admin/AdminPrograms';
import AdminCategories from '../components/Admin/AdminCategories';
import AdminContacts from '../components/Admin/AdminContacts';
import AdminPosts from '../components/Admin/AdminPosts';
import AdminSliders from '../components/Admin/AdminSliders';
import AdminEnrollments from '../components/Admin/AdminEnrollments';
import AdminLoyalty from '../components/Admin/AdminLoyalty';
import AdminBanners from '../components/Admin/AdminBanners';
import AdminAccounts from '../components/Admin/AdminAccounts';

// [TEMPORARILY HIDDEN] import AdminChiefs from '../components/Admin/AdminChiefs';
import AdminOrders from '../components/Admin/AdminOrders';
import AdminStudentWorks from '../components/Admin/AdminStudentWorks';
import AdminSettings from './AdminSettings';
import AdminPassword from '../components/Admin/AdminPassword';
import AdminQnA from '../components/Admin/AdminQnA';
import AdminOverviewLoading from '../components/Admin/AdminOverviewLoading';
import { getDashboardStats, logoutUser } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const AdminDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState(window.location.hash.replace('#', '') || 'overview');
  const [stats, setStats] = useState({ programs: 0, categories: 0, posts: 0, enrollments: 0, contacts: 0, sliders: 0, testimonials: 0, orders: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const navigate = useNavigate();

  // Default: only Nội dung open; sections toggle independently
  const [collapsed, setCollapsed] = useState({ ops: true, system: true });
  const toggleSection = (key) => setCollapsed(p => ({ ...p, [key]: !p[key] }));
  // Check explicit closed FIRST so user can always close any section
  const isSectionOpen = (key, tabs) => {
    if (collapsed[key] === true) return false;   // explicitly closed → always respect
    if (tabs.includes(activeTab)) return true;   // has active child & not closed → open
    return !collapsed[key];                      // false/undefined → open
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    window.history.replaceState(null, '', `#${tab}`);
  };

  useEffect(() => {
    document.body.classList.add('admin-mode');

    getDashboardStats()
      .then((data) => {
        setStats({
          programs: data.programs || 0,
          categories: data.categories || 0,
          posts: data.posts || 0,
          enrollments: data.enrollments || 0,
          contacts: data.contacts || 0,
          sliders: data.sliders || 0,
          testimonials: data.testimonials || 0,
          chiefs: data.chiefs || 0,
          orders: data.orders || 0
        });
      })
      .catch(err => {
        console.error('Failed to load dashboard stats', err);
      })
      .finally(() => setStatsLoading(false));
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) setActiveTab(hash);
    };
    window.addEventListener('hashchange', handleHash);
    
    return () => { 
      document.body.classList.remove('admin-mode'); 
      window.removeEventListener('hashchange', handleHash);
    };
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    navigate(ROUTES.AUTH);
  };

  const isOverviewLoading = activeTab === 'overview' && statsLoading;

  const pendingEnrollments = stats.enrollments;

  const renderContent = () => {
    switch (activeTab) {
      case 'categories':
        return <AdminCategories />;
      case 'programs':
        return <AdminPrograms />;

      case 'posts':
        return <AdminPosts />;
      /* [TEMPORARILY HIDDEN] Ẩn Sliders trang chủ
      case 'sliders':
        return <AdminSliders />;
      */

      /* [TEMPORARILY HIDDEN] Ẩn tab giảng viên
      case 'chiefs':
        return <AdminChiefs />;
      */
      case 'enrollments':
        return <AdminEnrollments />;
      case 'contacts':
        return <AdminContacts />;
      case 'orders':
        return <AdminOrders />;
      case 'studentWorks':
        return <AdminStudentWorks />;
      case 'loyalty':
        return <AdminLoyalty />;
      case 'settings':
        return <AdminSettings />;
      case 'password':
        return <AdminPassword user={user} />;
      case 'banners':
        return <AdminBanners />;
      case 'qna':
        return <AdminQnA />;
      case 'accounts':
        return <AdminAccounts />;
      case 'overview':
      default:
        if (statsLoading) {
          return <AdminOverviewLoading />;
        }

        return (
          <>
            <div className="admin-content-header">
              <h2>Tổng quan hệ thống</h2>
              <p style={{ color: '#88929e', marginTop: '5px' }}>Chào mừng trở lại, {user.fullName}! Dưới đây là tóm tắt hoạt động.</p>
            </div>
            <div className="row">
              <div className="col-md-4 mb-4">
                <div className="admin-stat-card" onClick={() => setActiveTab('programs')} style={{ cursor: 'pointer' }}>
                  <h3>{stats.programs}</h3>
                  <p>Khóa học</p>
                </div>
              </div>
              <div className="col-md-4 mb-4">
                <div className="admin-stat-card" onClick={() => setActiveTab('categories')} style={{ cursor: 'pointer' }}>
                  <h3>{stats.categories}</h3>
                  <p>Danh mục</p>
                </div>
              </div>
              <div className="col-md-4 mb-4">
                <div className="admin-stat-card" onClick={() => setActiveTab('posts')} style={{ cursor: 'pointer' }}>
                  <h3>{stats.posts}</h3>
                  <p>Bài viết</p>
                </div>
              </div>
              {/* <div className="col-md-4 mb-4">
                <div className="admin-stat-card" onClick={() => setActiveTab('enrollments')} style={{ cursor: 'pointer' }}>
                  <h3>{stats.enrollments}</h3>
                  <p>Học viên Ghi danh</p>
                </div>
              </div> */}
              <div className="col-md-4 mb-4">
                <div className="admin-stat-card" onClick={() => setActiveTab('contacts')} style={{ cursor: 'pointer' }}>
                  <h3>{stats.contacts}</h3>
                  <p>Tin nhắn liên hệ</p>
                </div>
              </div>
              {/* [TEMPORARILY HIDDEN] Ẩn stat card Sliders trang chủ
              <div className="col-md-4 mb-4">
                <div className="admin-stat-card" onClick={() => setActiveTab('sliders')} style={{ cursor: 'pointer' }}>
                  <h3>{stats.sliders}</h3>
                  <p>Sliders trang chủ</p>
                </div>
              </div>
              */}
              
              {/* [TEMPORARILY HIDDEN] Ẩn stat card Giảng viên
              <div className="col-md-4 mb-4">
                <div className="admin-stat-card" onClick={() => setActiveTab('chiefs')} style={{ cursor: 'pointer' }}>
                  <h3>{stats.chiefs}</h3>
                  <p>Giảng viên</p>
                </div>
              </div>
              */}
              <div className="col-md-4 mb-4">
                <div className="admin-stat-card" onClick={() => handleTabChange('orders')} style={{ cursor: 'pointer' }}>
                  <h3>{stats.orders}</h3>
                  <p>Đơn hàng</p>
                </div>
              </div>
            </div>
            
            <div className="admin-paper mt-3">
              <div className="admin-paper-header">
                <h4>Thông tin hệ thống</h4>
              </div>
              <p style={{color: '#6c757d', lineHeight: '1.6', padding: '12px 16px'}}>
                Chọn chức năng từ thanh công cụ bên trái để quản lý nội dung. Các thay đổi sẽ được cập nhật trực tiếp trên trang chủ.
              </p>
            </div>
          </>
        );
    }
  };

  return (
    <div className="admin-layout d-flex admin-content-ready">
      {/* Fixed Sidebar */}
      <div className="admin-sidebar" style={{ width: '260px', flexShrink: 0 }}>
        {/* Logo */}
        <div className="admin-logo-section" style={{ marginBottom: '24px' }}>
          <i className="fa fa-cutlery"></i>
          <h5>YUM Saigon</h5>
          <p style={{ fontSize: '11px' }}>{user.email}</p>
        </div>

        <ul className="admin-menu" style={{ gap: 0 }}>

          {/* ── NỘI DUNG (Tổng quan + content) ── */}
          {(() => {
            const key = 'content';
            const tabs = ['overview','categories','programs','posts','banners'];
            const open = isSectionOpen(key, tabs);
            return (
              <>
                <li style={{ listStyle: 'none' }}>
                  <button
                    onClick={() => toggleSection(key)}
                    className="sidebar-section-btn"
                  >
                    <span>Nội dung</span>
                    <i className="fa fa-chevron-down chevron" style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}></i>
                  </button>
                </li>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, overflow: 'hidden', maxHeight: open ? '600px' : '0', transition: 'max-height 0.25s ease' }}>
                  <li className={activeTab === 'overview' ? 'active' : ''}>
                    <a href="#overview" onClick={(e) => { e.preventDefault(); handleTabChange('overview'); }}>
                      <i className="fa fa-th-large"></i> Tổng quan
                    </a>
                  </li>
                  {(user.role === 'ADMIN' || user.permissions?.includes('categories')) && (
                    <li className={activeTab === 'categories' ? 'active' : ''}>
                      <a href="#categories" onClick={(e) => { e.preventDefault(); handleTabChange('categories'); }}>
                        <i className="fa fa-tags"></i> Danh mục
                      </a>
                    </li>
                  )}
                  {(user.role === 'ADMIN' || user.permissions?.includes('programs')) && (
                    <li className={activeTab === 'programs' ? 'active' : ''}>
                      <a href="#programs" onClick={(e) => { e.preventDefault(); handleTabChange('programs'); }}>
                        <i className="fa fa-book"></i> Khóa học
                      </a>
                    </li>
                  )}
                  {(user.role === 'ADMIN' || user.permissions?.includes('posts')) && (
                    <li className={activeTab === 'posts' ? 'active' : ''}>
                      <a href="#posts" onClick={(e) => { e.preventDefault(); handleTabChange('posts'); }}>
                        <i className="fa fa-pencil"></i> Chia sẻ
                      </a>
                    </li>
                  )}
                  {user.role === 'ADMIN' && (
                    <li className={activeTab === 'banners' ? 'active' : ''}>
                      <a href="#banners" onClick={(e) => { e.preventDefault(); handleTabChange('banners'); }}>
                        <i className="fa fa-picture-o"></i> Banner Trang Chủ
                      </a>
                    </li>
                  )}
                </ul>
              </>
            );
          })()}

          {/* ── VẬN HÀNH ── */}
          {(user.role === 'ADMIN' || user.permissions?.some(p => ['orders','contacts','studentWorks','qna'].includes(p))) && (() => {
            const key = 'ops';
            const tabs = ['orders','contacts','studentWorks','qna'];
            const open = isSectionOpen(key, tabs);
            return (
              <>
                <li style={{ listStyle: 'none' }}>
                  <button
                    onClick={() => toggleSection(key)}
                    className="sidebar-section-btn"
                  >
                    <span>Vận hành</span>
                    <i className="fa fa-chevron-down chevron" style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}></i>
                  </button>
                </li>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, overflow: 'hidden', maxHeight: open ? '600px' : '0', transition: 'max-height 0.25s ease' }}>
                  {(user.role === 'ADMIN' || user.permissions?.includes('orders')) && (
                    <li className={activeTab === 'orders' ? 'active' : ''}>
                      <a href="#orders" onClick={(e) => { e.preventDefault(); handleTabChange('orders'); }}>
                        <i className="fa fa-credit-card"></i> Đơn hàng
                      </a>
                    </li>
                  )}
                  {(user.role === 'ADMIN' || user.permissions?.includes('contacts')) && (
                    <li className={activeTab === 'contacts' ? 'active' : ''}>
                      <a href="#contacts" onClick={(e) => { e.preventDefault(); handleTabChange('contacts'); }}>
                        <i className="fa fa-envelope"></i> Tin nhắn
                      </a>
                    </li>
                  )}
                  {(user.role === 'ADMIN' || user.permissions?.includes('studentWorks')) && (
                    <li className={activeTab === 'studentWorks' ? 'active' : ''}>
                      <a href="#studentWorks" onClick={(e) => { e.preventDefault(); handleTabChange('studentWorks'); }}>
                        <i className="fa fa-camera"></i> Sản phẩm HV
                      </a>
                    </li>
                  )}
                  {(user.role === 'ADMIN' || user.permissions?.includes('qna')) && (
                    <li className={activeTab === 'qna' ? 'active' : ''}>
                      <a href="#qna" onClick={(e) => { e.preventDefault(); handleTabChange('qna'); }}>
                        <i className="fa fa-comments"></i> Hỏi Đáp Q&A
                      </a>
                    </li>
                  )}
                </ul>
              </>
            );
          })()}

          {/* ── HỆ THỐNG: loyalty + accounts + settings + password ── */}
          {user.role === 'ADMIN' && (() => {
            const key = 'system';
            const tabs = ['loyalty','accounts','settings','password'];
            const open = isSectionOpen(key, tabs);
            return (
              <>
                <li style={{ listStyle: 'none' }}>
                  <button
                    onClick={() => toggleSection(key)}
                    className="sidebar-section-btn"
                  >
                    <span>Hệ thống</span>
                    <i className="fa fa-chevron-down chevron" style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}></i>
                  </button>
                </li>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, overflow: 'hidden', maxHeight: open ? '600px' : '0', transition: 'max-height 0.25s ease' }}>
                  <li className={activeTab === 'loyalty' ? 'active' : ''}>
                    <a href="#loyalty" onClick={(e) => { e.preventDefault(); handleTabChange('loyalty'); }}>
                      <i className="fa fa-gift"></i> Giảm giá & Điểm
                    </a>
                  </li>
                  <li className={activeTab === 'accounts' ? 'active' : ''}>
                    <a href="#accounts" onClick={(e) => { e.preventDefault(); handleTabChange('accounts'); }}>
                      <i className="fa fa-users"></i> Nhân viên
                    </a>
                  </li>
                  <li className={activeTab === 'settings' ? 'active' : ''}>
                    <a href="#settings" onClick={(e) => { e.preventDefault(); handleTabChange('settings'); }}>
                      <i className="fa fa-cogs"></i> Cấu hình
                    </a>
                  </li>
                  <li className={activeTab === 'password' ? 'active' : ''}>
                    <a href="#password" onClick={(e) => { e.preventDefault(); handleTabChange('password'); }}>
                      <i className="fa fa-user-circle"></i> Tài khoản của tôi
                    </a>
                  </li>
                </ul>
              </>
            );
          })()}

          {/* EDITOR: Tài khoản của tôi (standalone, not in system group) */}
          {user.role === 'EDITOR' && (
            <>
              <li style={{ pointerEvents: 'none' }}>
                <span style={{ display: 'block', margin: '8px 20px', borderTop: '1px solid var(--admin-border-subtle)' }} />
              </li>
              <li className={activeTab === 'password' ? 'active' : ''}>
                <a href="#password" onClick={(e) => { e.preventDefault(); handleTabChange('password'); }}>
                  <i className="fa fa-user-circle"></i> Tài khoản của tôi
                </a>
              </li>
            </>
          )}

        </ul>

        <button className="admin-logout-btn mt-auto" onClick={handleLogout}>
          <i className="fa fa-sign-out" style={{ marginRight: '8px' }}></i> Đăng xuất
        </button>
      </div>

      {/* Main Dynamic Content */}
      <div className="admin-content" style={{ flexGrow: 1 }}>
        {isOverviewLoading ? <AdminOverviewLoading /> : renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
