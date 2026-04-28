import React from 'react';
import AdminLoadingBlock from './AdminLoadingBlock';

const AdminOverviewLoading = () => {
  return (
    <div className="admin-page-shell">
      <div className="admin-content-header">
        <div className="admin-loading-heading-shell shimmer" style={{ width: '260px', height: '24px', marginBottom: '12px' }}></div>
        <div className="admin-loading-heading-shell shimmer" style={{ width: '360px', maxWidth: '75%', height: '14px' }}></div>
      </div>

      <div className="admin-loading-grid" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="admin-loading-stat-card shimmer">
            <div className="admin-loading-stat-value shimmer"></div>
            <div className="admin-loading-stat-label shimmer"></div>
          </div>
        ))}
      </div>

      <AdminLoadingBlock rows={3} />
    </div>
  );
};

export default AdminOverviewLoading;
