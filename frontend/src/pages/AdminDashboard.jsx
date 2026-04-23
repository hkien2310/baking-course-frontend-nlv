import React, { useEffect, useState } from 'react';
import AdminPrograms from '../components/Admin/AdminPrograms';
import AdminContacts from '../components/Admin/AdminContacts';
import AdminPosts from '../components/Admin/AdminPosts';
import AdminSliders from '../components/Admin/AdminSliders';
import AdminEnrollments from '../components/Admin/AdminEnrollments';
import AdminTestimonials from '../components/Admin/AdminTestimonials';
// [TEMPORARILY HIDDEN] import AdminChiefs from '../components/Admin/AdminChiefs';
import AdminOrders from '../components/Admin/AdminOrders';
import { getMe, getPrograms, getPosts, getEnrollments, getContacts, getTestimonials, getChiefs, getAllOrders } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState(window.location.hash.replace('#', '') || 'overview');
  const [stats, setStats] = useState({ programs: 0, posts: 0, enrollments: 0, contacts: 0, sliders: 0, testimonials: 0, orders: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('admin-mode');
    
    getMe().then(setUser).catch(() => navigate(ROUTES.AUTH));

    // Fetch real stats
    Promise.all([
      getPrograms().catch(() => []),
      getPosts().catch(() => []),
      getEnrollments().catch(() => []),
      getContacts().catch(() => []),
      getTestimonials().catch(() => []),
      getChiefs().catch(() => []),
      getAllOrders().catch(() => [])
    ]).then(([programsRes, posts, enrollments, contacts, testimonials, chiefsRes, ordersRes]) => {
      // programsRes is an object { data, totalPages... } because we used page in controller
      const programs = programsRes?.data || programsRes || [];
      const featured = programs.filter(p => p.isFeatured).length;
      setStats({
        programs: programs.length,
        posts: posts?.data?.length || posts.length || 0,
        enrollments: enrollments.length || 0,
        contacts: contacts.length || 0,
        sliders: featured || 0,
        testimonials: testimonials?.length || 0,
        chiefs: Array.isArray(chiefsRes) ? chiefsRes.length : (chiefsRes?.data?.length || 0),
        orders: ordersRes?.length || 0
      });
    });
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) setActiveTab(hash);
    };
    window.addEventListener('hashchange', handleHash);
    
    return () => { 
      document.body.classList.remove('admin-mode'); 
      window.removeEventListener('hashchange', handleHash);
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate(ROUTES.AUTH);
  };

  if (!user) return null;

  const pendingEnrollments = stats.enrollments;

  const renderContent = () => {
    switch (activeTab) {
      case 'programs':
        return <AdminPrograms />;

      case 'posts':
        return <AdminPosts />;
      case 'sliders':
        return <AdminSliders />;
      case 'testimonials':
        return <AdminTestimonials />;
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
      case 'overview':
      default:
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
              <div className="col-md-4 mb-4">
                <div className="admin-stat-card" onClick={() => setActiveTab('sliders')} style={{ cursor: 'pointer' }}>
                  <h3>{stats.sliders}</h3>
                  <p>Sliders trang chủ</p>
                </div>
              </div>
              <div className="col-md-4 mb-4">
                <div className="admin-stat-card" onClick={() => setActiveTab('testimonials')} style={{ cursor: 'pointer' }}>
                  <h3>{stats.testimonials}</h3>
                  <p>Đánh giá (Testimonials)</p>
                </div>
              </div>
              {/* [TEMPORARILY HIDDEN] Ẩn stat card Giảng viên
              <div className="col-md-4 mb-4">
                <div className="admin-stat-card" onClick={() => setActiveTab('chiefs')} style={{ cursor: 'pointer' }}>
                  <h3>{stats.chiefs}</h3>
                  <p>Giảng viên</p>
                </div>
              </div>
              */}
              <div className="col-md-4 mb-4">
                <div className="admin-stat-card" onClick={() => setActiveTab('orders')} style={{ cursor: 'pointer' }}>
                  <h3>{stats.orders}</h3>
                  <p>Đơn hàng</p>
                </div>
              </div>
            </div>
            
            <div className="admin-paper mt-3">
              <div className="admin-paper-header">
                <h4>Thông tin hệ thống</h4>
              </div>
              <p style={{color: '#6c757d', lineHeight: '1.6'}}>
                Chọn chức năng từ thanh công cụ bên trái để quản lý nội dung. Các thay đổi sẽ được cập nhật trực tiếp trên trang chủ.
              </p>
            </div>
          </>
        );
    }
  };

  return (
    <div className="admin-layout d-flex">
      {/* Fixed Sidebar */}
      <div className="admin-sidebar" style={{ width: '280px', flexShrink: 0 }}>
        <div className="admin-logo-section">
          <i className="fa fa-cutlery"></i>
          <h5>Trang Quản Trị</h5>
          <p>{user.email}</p>
        </div>
        
        <ul className="admin-menu">
          <li className={activeTab === 'overview' ? 'active' : ''}>
            <a href="#overview" onClick={(e) => { e.preventDefault(); setActiveTab('overview'); }}>
              <i className="fa fa-th-large"></i> Tổng quan
            </a>
          </li>
          {/* <li className={activeTab === 'enrollments' ? 'active' : ''}>
            <a href="#enrollments" onClick={(e) => { e.preventDefault(); setActiveTab('enrollments'); }}>
              <i className="fa fa-graduation-cap"></i> Ghi danh
            </a>
          </li> */}
          <li className={activeTab === 'orders' ? 'active' : ''}>
            <a href="#orders" onClick={(e) => { e.preventDefault(); setActiveTab('orders'); }}>
              <i className="fa fa-credit-card"></i> Đơn hàng
            </a>
          </li>
          <li className={activeTab === 'contacts' ? 'active' : ''}>
            <a href="#contacts" onClick={(e) => { e.preventDefault(); setActiveTab('contacts'); }}>
              <i className="fa fa-envelope"></i> Tin nhắn liên hệ
            </a>
          </li>
          <li className={activeTab === 'programs' ? 'active' : ''}>
            <a href="#programs" onClick={(e) => { e.preventDefault(); setActiveTab('programs'); }}>
              <i className="fa fa-book"></i> Khóa học
            </a>
          </li>
          <li className={activeTab === 'posts' ? 'active' : ''}>
            <a href="#posts" onClick={(e) => { e.preventDefault(); setActiveTab('posts'); }}>
              <i className="fa fa-pencil"></i> Bài viết & Cẩm nang
            </a>
          </li>


          <li className={activeTab === 'sliders' ? 'active' : ''}>
            <a href="#sliders" onClick={(e) => { e.preventDefault(); setActiveTab('sliders'); }}>
              <i className="fa fa-image"></i> Sliders trang chủ
            </a>
          </li>
          <li className={activeTab === 'testimonials' ? 'active' : ''}>
            <a href="#testimonials" onClick={(e) => { e.preventDefault(); setActiveTab('testimonials'); }}>
              <i className="fa fa-quote-left"></i> Đánh giá
            </a>
          </li>
          {/* [TEMPORARILY HIDDEN] Ẩn tab sidebar Giảng viên
          <li className={activeTab === 'chiefs' ? 'active' : ''}>
            <a href="#chiefs" onClick={(e) => { e.preventDefault(); setActiveTab('chiefs'); }}>
              <i className="fa fa-user-circle"></i> Giảng viên
            </a>
          </li>
          */}
        </ul>
        
        <button className="admin-logout-btn mt-auto" onClick={handleLogout}>
          <i className="fa fa-sign-out" style={{marginRight: '8px'}}></i> Đăng xuất an toàn
        </button>
      </div>

      {/* Main Dynamic Content */}
      <div className="admin-content" style={{ flexGrow: 1 }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
