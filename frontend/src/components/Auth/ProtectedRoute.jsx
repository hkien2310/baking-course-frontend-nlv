import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getMe } from '../../services/api';
import PageLoading from '../Shared/PageLoading';
import AdminRouteLoading from '../Admin/AdminRouteLoading';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    getMe()
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Auth check failed", err);
        setUser(null);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return requireAdmin ? <AdminRouteLoading /> : <PageLoading compact />;
  }

  if (!user) {
    // Redirect to login but remember where user was trying to go
    const currentPath = location.pathname + location.search;
    return <Navigate to={`/auth?redirect=${encodeURIComponent(currentPath)}`} replace />;
  }

  if (requireAdmin && user.role !== 'ADMIN' && user.role !== 'EDITOR') {
    return <Navigate to="/my-account" replace />;
  }

  // Pass authenticated user to child component to avoid duplicate getMe() calls
  const content = React.isValidElement(children) ? React.cloneElement(children, { user }) : children;

  if (requireAdmin) {
    return (
      <>
        <div className="d-flex d-lg-none flex-column align-items-center justify-content-center text-center p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', width: '100vw' }}>
          <i className="fa fa-desktop fa-4x mb-3" style={{ color: '#c19a5b' }}></i>
          <h4 className="font-weight-bold" style={{ color: '#333' }}>Không hỗ trợ Mobile</h4>
          <p style={{ color: '#666', lineHeight: 1.6, maxWidth: '400px' }}>
            Hệ thống quản trị (Admin Dashboard) chứa nhiều dữ liệu phức tạp. Vui lòng đăng nhập bằng <strong>máy tính</strong> để quản lý nội dung chính xác và tốt nhất.
          </p>
          <a href="/" className="btn btn-maincolor mt-3">Quay về trang chủ</a>
        </div>
        <div className="d-none d-lg-block" style={{ width: '100%', height: '100%' }}>
          {content}
        </div>
      </>
    );
  }

  return content;
};

export default ProtectedRoute;
