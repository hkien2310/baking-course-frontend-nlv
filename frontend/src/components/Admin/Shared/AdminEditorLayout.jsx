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
      <style>{`
        .admin-btn-save-super {
          background-color: #3f785e !important;
          border: 1px solid #3f785e !important;
          color: #ffffff !important;
          padding: 10px 24px !important;
          border-radius: 6px !important;
          font-size: 15px !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          transition: all 0.3s ease !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 8px !important;
          box-shadow: 0 4px 6px rgba(63, 120, 94, 0.2) !important;
        }
        .admin-btn-save-super i {
          margin-right: 0 !important;
        }
        .admin-btn-save-super:hover:not(:disabled) {
          background-color: #2c5a45 !important;
          border-color: #2c5a45 !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 12px rgba(63, 120, 94, 0.3) !important;
          color: #ffffff !important;
        }
        .admin-btn-save-super:disabled {
          opacity: 0.7 !important;
          cursor: not-allowed !important;
          box-shadow: none !important;
        }
      `}</style>
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
          <button type="submit" form={formId} className="admin-btn-save-super" disabled={saving}>
            <i className={`fa ${saving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i> {saving ? 'Đang lưu...' : saveLabel}
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
