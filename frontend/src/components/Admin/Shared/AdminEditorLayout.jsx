import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminButton from './AdminButton';

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
    <>
      <div className="admin-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <div className="admin-paper-header" style={{ position: 'sticky', top: 0, zIndex: 100, borderRadius: 0, padding: '15px 30px', backgroundColor: 'var(--admin-paper-bg)', borderBottom: '1px solid var(--admin-border-light)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div className="d-flex align-items-center">
          <AdminButton 
            variant="dark" 
            onClick={() => navigate(backUrl)} 
            disabled={saving} 
            icon="arrow-left" 
            label="Quay lại" 
            className="mr-3"
          />
          <h4 style={{ margin: 0 }}>{title}</h4>
        </div>
        <div>
          <AdminButton 
            type="submit" 
            form={formId} 
            className="admin-btn-save"
            disabled={saving}
            loading={saving}
            label={saveLabel}
            loadingLabel="Đang lưu..."
            icon="save"
          />
        </div>
      </div>

      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>

    </div>
    </>
  );
};

export default AdminEditorLayout;
