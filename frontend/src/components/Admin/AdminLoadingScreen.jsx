import React from 'react';

const statPlaceholders = Array.from({ length: 6 });
const menuPlaceholders = Array.from({ length: 8 });

const AdminLoadingScreen = ({ title = 'Đang tải trang quản trị...', subtitle = 'Jarvis đang đồng bộ dữ liệu và dựng giao diện cho Boss.' }) => {
  return (
    <div className="admin-loading-screen">
      <div className="admin-loading-sidebar">
        <div className="admin-loading-logo shimmer"></div>
        <div className="admin-loading-email shimmer"></div>
        <div className="admin-loading-menu">
          {menuPlaceholders.map((_, index) => (
            <div key={index} className="admin-loading-menu-item shimmer"></div>
          ))}
        </div>
      </div>

      <div className="admin-loading-content">
        <div className="admin-loading-hero">
          <div className="admin-loading-badge">Admin Console</div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        <div className="admin-loading-stats-grid">
          {statPlaceholders.map((_, index) => (
            <div key={index} className="admin-loading-stat-card">
              <div className="admin-loading-stat-number shimmer"></div>
              <div className="admin-loading-stat-label shimmer"></div>
            </div>
          ))}
        </div>

        <div className="admin-loading-panel">
          <div className="admin-loading-panel-title shimmer"></div>
          <div className="admin-loading-panel-line shimmer"></div>
          <div className="admin-loading-panel-line shimmer short"></div>
          <div className="admin-loading-panel-line shimmer"></div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoadingScreen;
