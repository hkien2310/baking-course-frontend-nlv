import React, { useState } from 'react';

// Design styles based on modern UI/UX principles
const VARIANTS = {
  edit: {
    bg: '#f0f9ff',
    color: '#0284c7', // sky-600
    hoverBg: '#0ea5e9', // sky-500
    hoverColor: '#fff',
    icon: 'pencil'
  },
  delete: {
    bg: '#fef2f2',
    color: '#dc2626', // red-600
    hoverBg: '#ef4444', // red-500
    hoverColor: '#fff',
    icon: 'trash'
  },
  view: {
    bg: '#f0fdfa',
    color: '#0d9488', // teal-600
    hoverBg: '#14b8a6', // teal-500
    hoverColor: '#fff',
    icon: 'eye'
  },
  approve: {
    bg: '#f0fdf4',
    color: '#16a34a', // green-600
    hoverBg: '#22c55e', // green-500
    hoverColor: '#fff',
    icon: 'check'
  },
  reject: {
    bg: '#fff7ed',
    color: '#ea580c', // orange-600
    hoverBg: '#f97316', // orange-500
    hoverColor: '#fff',
    icon: 'times'
  },
  hide: {
    bg: '#f8fafc',
    color: '#475569', // slate-600
    hoverBg: '#64748b', // slate-500
    hoverColor: '#fff',
    icon: 'eye-slash'
  }
};

const AdminActionBtn = ({ 
  variant, 
  onClick, 
  title, 
  disabled = false, 
  loading = false,
  icon: customIcon
}) => {
  const config = VARIANTS[variant] || VARIANTS.view;
  const iconName = customIcon || config.icon;

  const [isHovered, setIsHovered] = useState(false);

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: disabled ? '#f1f5f9' : (isHovered ? config.hoverBg : config.bg),
    color: disabled ? '#94a3b8' : (isHovered ? config.hoverColor : config.color),
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: isHovered && !disabled ? 'translateY(-2px)' : 'translateY(0)',
    boxShadow: isHovered && !disabled ? `0 4px 12px ${config.color}33` : 'none',
    margin: '0 4px',
    padding: 0,
    outline: 'none',
  };

  return (
    <button
      type="button"
      className="admin-action-btn"
      style={baseStyle}
      onClick={(e) => {
        if (!disabled && onClick) onClick(e);
      }}
      title={title}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <i className={`fa ${loading ? 'fa-spinner fa-spin' : 'fa-' + iconName}`} style={{ fontSize: '14px' }}></i>
    </button>
  );
};

export default AdminActionBtn;
