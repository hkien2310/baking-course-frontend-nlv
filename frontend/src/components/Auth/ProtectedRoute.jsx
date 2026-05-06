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

  if (requireAdmin && user.role !== 'ADMIN') {
    return <Navigate to="/my-account" replace />;
  }

  // Pass authenticated user to child component to avoid duplicate getMe() calls
  if (React.isValidElement(children)) {
    return React.cloneElement(children, { user });
  }

  return children;
};

export default ProtectedRoute;
