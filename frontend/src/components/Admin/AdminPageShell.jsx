import React from 'react';
import AdminLoadingBlock from './AdminLoadingBlock';

const AdminPageShell = ({ title, subtitle, loading = false, loadingRows = 5, children, actions }) => {
  if (loading) {
    return (
      <div className="admin-page-shell">
        <div className="admin-content-header">
          <div className="admin-loading-heading-shell shimmer" style={{ width: '260px', height: '24px', marginBottom: '12px' }}></div>
          <div className="admin-loading-heading-shell shimmer" style={{ width: '360px', maxWidth: '75%', height: '14px' }}></div>
        </div>
        <AdminLoadingBlock rows={loadingRows} />
      </div>
    );
  }

  return (
    <div className="admin-page-shell">
      {(title || subtitle || actions) && (
        <div className="admin-content-header">
          <div>
            {title && <h2>{title}</h2>}
            {subtitle && <p style={{ color: '#88929e' }}>{subtitle}</p>}
          </div>
          {actions ? <div>{actions}</div> : null}
        </div>
      )}
      {children}
    </div>
  );
};

export default AdminPageShell;
