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
    <>
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
          <button 
            type="submit" 
            form={formId} 
            className="btn"
            disabled={saving}
            onMouseEnter={(e) => {
              if (!saving) {
                e.currentTarget.style.backgroundColor = '#2c5a45';
                e.currentTarget.style.borderColor = '#2c5a45';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(63, 120, 94, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!saving) {
                e.currentTarget.style.backgroundColor = '#3f785e';
                e.currentTarget.style.borderColor = '#3f785e';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(63, 120, 94, 0.2)';
              }
            }}
            style={{
              backgroundColor: '#3f785e',
              border: '1px solid #3f785e',
              color: '#ffffff',
              padding: '10px 24px',
              borderRadius: '6px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: saving ? 'none' : '0 4px 6px rgba(63, 120, 94, 0.2)',
              opacity: saving ? 0.7 : 1
            }}
          >
            <i className={`fa ${saving ? 'fa-spinner fa-spin' : 'fa-save'}`} style={{ marginRight: 0 }}></i> {saving ? 'Đang lưu...' : saveLabel}
          </button>
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
