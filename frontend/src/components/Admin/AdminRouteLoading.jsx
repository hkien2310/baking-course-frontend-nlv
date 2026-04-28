import React from 'react';
import AdminLoadingBlock from './AdminLoadingBlock';

const AdminRouteLoading = () => {
  return (
    <div className="admin-layout d-flex" style={{ minHeight: '100vh' }}>
      <div className="admin-sidebar" style={{ width: '280px', flexShrink: 0 }}>
        <div className="admin-logo-section">
          <div className="shimmer" style={{ width: '44px', height: '44px', borderRadius: '14px', margin: '0 auto 16px' }}></div>
          <div className="shimmer" style={{ width: '150px', height: '18px', borderRadius: '999px', margin: '0 auto 10px' }}></div>
          <div className="shimmer" style={{ width: '180px', height: '12px', borderRadius: '999px', margin: '0 auto' }}></div>
        </div>
        <ul className="admin-menu">
          {Array.from({ length: 8 }).map((_, index) => (
            <li key={index}>
              <span className="shimmer" style={{ display: 'block', width: '100%', height: '20px', borderRadius: '10px' }}></span>
            </li>
          ))}
        </ul>
      </div>
      <div className="admin-content" style={{ flexGrow: 1 }}>
        <div className="admin-page-shell">
          <div className="admin-content-header">
            <div>
              <div className="shimmer" style={{ width: '220px', height: '28px', borderRadius: '999px', marginBottom: '12px' }}></div>
              <div className="shimmer" style={{ width: '360px', maxWidth: '80%', height: '14px', borderRadius: '999px' }}></div>
            </div>
          </div>
          <AdminLoadingBlock rows={6} />
        </div>
      </div>
    </div>
  );
};

export default AdminRouteLoading;
