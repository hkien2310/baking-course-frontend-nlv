import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminEditorLayout = ({
  title,
  backUrl,
  saving = false,
  saveLabel = 'Lưu',
  formId,
  children
}) => {
  const navigate = useNavigate();

  return (
    <div className="admin-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Navbar */}
      <div className="admin-paper-header" style={{ position: 'sticky', top: 0, zIndex: 100, borderRadius: 0, padding: '15px 30px', backgroundColor: 'var(--admin-paper-bg)', borderBottom: '1px solid var(--admin-border-light)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div className="d-flex align-items-center">
          <button type="button" className="btn btn-dark mr-3" onClick={() => navigate(backUrl)} disabled={saving}>
            <i className="fa fa-arrow-left"></i> Quay lại
          </button>
          <h4 style={{ margin: 0 }}>{title}</h4>
        </div>
        <div>
          <button type="submit" form={formId} className="admin-btn-save" disabled={saving}>
            <i className={`fa ${saving ? 'fa-spinner fa-spin' : 'fa-save'} mr-2`}></i> {saving ? 'Đang lưu...' : saveLabel}
          </button>
        </div>
      </div>

      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>

    </div>
  );
};

export default AdminEditorLayout;
