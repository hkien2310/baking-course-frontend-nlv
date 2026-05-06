import React from 'react';

const AdminButton = ({ 
  label, 
  icon, 
  variant = 'primary', // primary (maincolor), secondary, danger, warning, success, info, dark
  outline = false,
  onClick, 
  type = 'button', 
  className = '', 
  disabled = false,
  loading = false,
  loadingLabel,
  size = 'md', // sm, md, lg
  style = {},
  ...rest
}) => {
  const getVariantClass = () => {
    return outline ? `admin-btn-outline-${variant}` : `admin-btn-${variant}`;
  };

  const getSizeClass = () => {
    if (size === 'sm') return 'admin-btn-sm';
    if (size === 'lg') return 'admin-btn-lg';
    return 'admin-btn-md';
  };

  return (
    <button
      type={type}
      className={`admin-btn ${getVariantClass()} ${getSizeClass()} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      style={style}
      {...rest}
    >
      {loading ? <i className="fa fa-spinner fa-spin"></i> : icon ? <i className={`fa fa-${icon}`}></i> : null}
      {(label || loadingLabel) && <span>{loading ? (loadingLabel || label) : label}</span>}
    </button>
  );
};

export default AdminButton;
