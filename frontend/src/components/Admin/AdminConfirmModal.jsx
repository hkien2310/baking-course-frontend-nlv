import React from 'react';
import AdminButton from './Shared/AdminButton';

const AdminConfirmModal = ({ isOpen, onClose, onConfirm, title, message, loading = false, confirmLabel = 'Delete', cancelLabel = 'Cancel' }) => {
  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes adminOverlayFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes adminModalPop {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
      <div 
        className="admin-modal-overlay" 
        onClick={onClose}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        animation: 'adminOverlayFade 0.2s ease forwards'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--admin-paper-bg)',
          borderRadius: '12px',
          padding: '32px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          textAlign: 'center',
          animation: 'adminModalPop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
      >
        {/* Warning Icon */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: '#fef2f2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <i className="fa fa-exclamation-triangle" style={{ fontSize: '28px', color: '#ef4444' }}></i>
        </div>

        <h4 style={{ 
          margin: '0 0 8px 0', 
          fontSize: '20px', 
          fontWeight: 700, 
          color: 'var(--admin-heading)' 
        }}>
          {title || 'Confirm Delete'}
        </h4>
        
        <p style={{ 
          margin: '0 0 28px 0', 
          color: 'var(--admin-text-muted)', 
          fontSize: '15px', 
          lineHeight: 1.6 
        }}>
          {message || 'Are you sure you want to delete this item? This action cannot be undone.'}
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <AdminButton 
            variant="secondary" 
            onClick={onClose} 
            disabled={loading} 
            label={cancelLabel} 
            style={{ minWidth: '130px' }}
          />
          <AdminButton 
            variant="danger" 
            onClick={onConfirm}
            disabled={loading}
            loading={loading}
            icon="trash"
            label={confirmLabel}
            loadingLabel="Đang xử lý..."
            style={{ minWidth: '130px' }}
          />
        </div>
      </div>
    </div>
    </>
  );
};

export default AdminConfirmModal;
