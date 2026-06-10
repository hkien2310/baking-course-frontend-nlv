import React from 'react';

/**
 * AdminModal — scrollable modal với header sticky.
 * CSS class .admin-modal đã có padding: 0 và max-height: 90vh.
 * Header và body được chia riêng, body scroll độc lập.
 */
const AdminModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal" style={{ display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>

        {/* Header — dùng CSS class, không override padding */}
        <div className="admin-modal-header" style={{ flexShrink: 0 }}>
          <h4>{title}</h4>
          <button
            type="button"
            className="admin-modal-close-icon-only"
            onClick={onClose}
            title="Đóng"
          >
            <i className="fa fa-times"></i>
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="admin-modal-body" style={{ overflowY: 'auto', flex: 1 }}>
          {children}
        </div>

      </div>
    </div>
  );
};

export default AdminModal;
