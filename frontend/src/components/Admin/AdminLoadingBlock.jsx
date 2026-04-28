import React from 'react';

const AdminLoadingBlock = ({ compact = false, rows = 5, className = '' }) => {
  return (
    <div className={`admin-loading-block ${compact ? 'compact' : ''} ${className}`.trim()}>
      <div className="admin-loading-block-header" aria-hidden="true">
        <div className="admin-loading-heading-shell shimmer"></div>
        <div className="admin-inline-spinner" aria-hidden="true"></div>
      </div>

      <div className="admin-loading-table-shell" aria-hidden="true">
        <div className="admin-loading-table-head shimmer"></div>
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="admin-loading-table-row shimmer"></div>
        ))}
      </div>
    </div>
  );
};

export default AdminLoadingBlock;
