import React from 'react';

const AdminHeader = ({ title, description, action }) => {
  return (
    <div className="admin-content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexShrink: 0 }}>
      <div>
        <h2 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '600', color: 'var(--admin-heading)' }}>{title}</h2>
        {description && <p style={{ margin: 0, color: 'var(--admin-text-muted)', fontSize: '14px' }}>{description}</p>}
      </div>
      {action && (
        <div className="admin-header-action">
          {action}
        </div>
      )}
    </div>
  );
};

export default AdminHeader;
