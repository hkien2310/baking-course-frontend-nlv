import React from 'react';

const rows = Array.from({ length: 5 });

const AdminLoadingBlock = ({ title = 'Đang tải dữ liệu...', compact = false }) => {
  return (
    <div className={`admin-loading-block ${compact ? 'compact' : ''}`}>
      <div className="admin-loading-block-header">
        <div>
          <div className="admin-loading-block-title">{title}</div>
          <div className="admin-loading-block-subtitle">Vui lòng chờ một chút, dữ liệu đang được đồng bộ.</div>
        </div>
        <div className="admin-inline-spinner" aria-hidden="true"></div>
      </div>

      <div className="admin-loading-table-shell">
        <div className="admin-loading-table-head shimmer"></div>
        {rows.map((_, index) => (
          <div key={index} className="admin-loading-table-row shimmer"></div>
        ))}
      </div>
    </div>
  );
};

export default AdminLoadingBlock;
