import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getMe } from '../../services/api';
import PageLoading from '../Shared/PageLoading';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
    return <PageLoading compact />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requireAdmin && user.role !== 'ADMIN') {
    return <Navigate to="/my-account" replace />;
  }

  return children;
};

export default ProtectedRoute;
