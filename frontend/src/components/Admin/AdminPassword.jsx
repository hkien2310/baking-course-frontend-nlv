import React, { useState } from 'react';
import AdminButton from './Shared/AdminButton';
import { changePassword, updateMe } from '../../services/api';
import { toast } from 'react-toastify';
import { useTranslation } from '../../i18n/LanguageContext';

const ALL_PERMISSIONS_LABEL = {
  programs:     'Khóa học',
  categories:   'Danh mục',
  posts:        'Bài viết',
  orders:       'Đơn hàng',
  contacts:     'Tin nhắn',
  banners:      'Banner',
  studentWorks: 'Sản phẩm HV',
  loyalty:      'Giảm giá',
  settings:     'Cấu hình',
  qna:          'Q&A',
};

const ROLE_CONFIG = {
  ADMIN:  { label: 'Quản trị viên', icon: 'fa-shield', color: '#d97706', bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', textColor: '#92400e' },
  EDITOR: { label: 'Nhân viên',     icon: 'fa-pencil', color: '#4f9a71', bg: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', textColor: '#065f46' },
  USER:   { label: 'Người dùng',    icon: 'fa-user',   color: '#64748b', bg: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', textColor: '#334155' },
};

const AVATAR_COLORS = ['#4f9a71','#f59e0b','#6366f1','#ef4444','#06b6d4','#8b5cf6','#ec4899','#14b8a6'];
function getAvatarColor(name = '') {
  const code = (name.charCodeAt(0) || 0) + (name.charCodeAt(1) || 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

const PasswordField = ({ label, name, value, onChange, error, hint, show, setShow }) => (
  <div style={{ marginBottom: '20px' }}>
    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
      {label}
    </label>
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        placeholder="••••••••"
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '10px 44px 10px 14px',
          border: `1.5px solid ${error ? '#fca5a5' : '#e2e8f0'}`,
          borderRadius: '10px', fontSize: '14px',
          background: error ? '#fff5f5' : '#f8fafc',
          color: '#334155', outline: 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
        onFocus={e => { e.target.style.borderColor = '#4f9a71'; e.target.style.boxShadow = '0 0 0 3px rgba(79,154,113,0.12)'; e.target.style.background = '#fff'; }}
        onBlur={e => { e.target.style.borderColor = error ? '#fca5a5' : '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = error ? '#fff5f5' : '#f8fafc'; }}
      />
      <button
        type="button"
        onMouseDown={() => setShow(true)} onMouseUp={() => setShow(false)}
        onMouseLeave={() => setShow(false)} onTouchStart={() => setShow(true)} onTouchEnd={() => setShow(false)}
        style={{ position: 'absolute', right: 0, top: 0, width: '44px', height: '44px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <i className={`fa fa-eye${show ? '' : '-slash'}`} style={{ fontSize: '15px' }}></i>
      </button>
    </div>
    {error
      ? <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#ef4444' }}>{error}</p>
      : hint && <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#94a3b8' }}>{hint}</p>
    }
  </div>
);

const AdminPassword = ({ user }) => {
  const { t } = useTranslation();
  const [form, setForm]   = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue]     = useState(user?.fullName || '');
  const [nameLoading, setNameLoading] = useState(false);
  const [displayName, setDisplayName] = useState(user?.fullName || '');

  const handleSaveName = async () => {
    if (!nameValue.trim()) return;
    setNameLoading(true);
    try {
      const updated = await updateMe({ fullName: nameValue.trim() });
      setDisplayName(updated.fullName);
      localStorage.setItem('fullName', updated.fullName);
      toast.success('Đã cập nhật tên thành công!');
      setEditingName(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi khi cập nhật tên.');
    } finally {
      setNameLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(err => ({ ...err, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (form.newPassword.length < 6) newErrors.newPassword = t('form.passwordTooShort');
    if (form.newPassword !== form.confirmNewPassword) newErrors.confirmNewPassword = t('form.passwordMismatch');
    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    setLoading(true);
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success(t('form.passwordChangedSuccess'));
      setForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setErrors({});
    } catch (err) {
      const msg = err.response?.data?.error || 'Lỗi khi đổi mật khẩu';
      toast.error(msg);
      if (msg.includes('hiện tại')) setErrors({ currentPassword: msg });
    } finally {
      setLoading(false);
    }
  };

  const roleConfig = ROLE_CONFIG[user?.role] || ROLE_CONFIG.USER;
  const avatarColor = getAvatarColor(displayName);
  const initial = displayName?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="admin-page-shell">
      <style>{`
        .profile-card { background: var(--admin-paper-bg); border: 1px solid var(--admin-border-subtle); border-radius: 16px; overflow: hidden; }
        .profile-banner { height: 100px; background: linear-gradient(135deg, #4f9a71 0%, #6ab78e 50%, #a7d9bc 100%); position: relative; }
        .profile-banner::after { content: ''; position: absolute; inset: 0; background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.06'%3E%3Ccircle cx='30' cy='30' r='20'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); }
        .profile-avatar { width: 80px; height: 80px; border-radius: 50%; border: 4px solid #fff; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 700; color: #fff; position: absolute; bottom: -40px; left: 32px; box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
        .perm-chip { display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; background: rgba(79,154,113,0.08); color: #4f9a71; border: 1px solid rgba(79,154,113,0.18); }
        .info-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
        .info-row:last-child { border-bottom: none; }
        .info-icon { width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
        .security-card { background: var(--admin-paper-bg); border: 1px solid var(--admin-border-subtle); border-radius: 16px; overflow: hidden; }
        .security-header { padding: 20px 24px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 12px; }
        .security-body { padding: 24px; }
        @media (max-width: 768px) { .profile-grid { flex-direction: column !important; } }
      `}</style>

      {/* Page header */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 700, margin: 0, color: 'var(--admin-heading)' }}>Tài khoản của tôi</h2>
        <p style={{ color: 'var(--admin-text-muted)', margin: '4px 0 0', fontSize: '14px' }}>Thông tin cá nhân và bảo mật tài khoản</p>
      </div>

      <div className="profile-grid" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

        {/* ---- LEFT: Profile card ---- */}
        <div style={{ flex: '0 0 320px' }}>
          <div className="profile-card">

            {/* Banner + Avatar */}
            <div className="profile-banner">
              <div className="profile-avatar" style={{ background: avatarColor }}>{initial}</div>
            </div>

            {/* Name / role */}
            <div style={{ paddingTop: '52px', paddingLeft: '32px', paddingRight: '24px', paddingBottom: '24px' }}>
              {/* Editable name */}
              {editingName ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <input
                    autoFocus
                    value={nameValue}
                    onChange={e => setNameValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                    style={{
                      flex: 1, fontSize: '18px', fontWeight: 700, border: '1.5px solid #4f9a71',
                      borderRadius: '8px', padding: '6px 10px', outline: 'none', color: 'var(--admin-heading)',
                    }}
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={nameLoading}
                    style={{ background: '#4f9a71', border: 'none', borderRadius: '6px', color: '#fff', padding: '6px 10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                  >
                    {nameLoading ? <i className="fa fa-spinner fa-spin"></i> : 'Lưu'}
                  </button>
                  <button
                    onClick={() => { setEditingName(false); setNameValue(displayName); }}
                    style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', color: '#64748b', padding: '6px 10px', cursor: 'pointer', fontSize: '13px' }}
                  >
                    Huỷ
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <div style={{ fontWeight: 700, fontSize: '20px', color: 'var(--admin-heading)' }}>
                    {displayName || '—'}
                  </div>
                  <button
                    onClick={() => { setEditingName(true); setNameValue(displayName); }}
                    title="Sửa tên"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px 6px', borderRadius: '4px', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#4f9a71'}
                    onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                  >
                    <i className="fa fa-pencil" style={{ fontSize: '13px' }}></i>
                  </button>
                </div>
              )}
              <div style={{ fontSize: '13px', color: 'var(--admin-text-muted)', marginBottom: '14px' }}>
                {user?.email || '—'}
              </div>

              {/* Role badge */}
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '5px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
                background: roleConfig.bg, color: roleConfig.textColor,
              }}>
                <i className={`fa ${roleConfig.icon}`} style={{ fontSize: '12px' }}></i>
                {roleConfig.label}
              </span>

              {/* Info rows */}
              <div style={{ marginTop: '24px' }}>
                <div className="info-row">
                  <div className="info-icon" style={{ background: 'rgba(79,154,113,0.1)', color: '#4f9a71' }}>
                    <i className="fa fa-envelope"></i>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Email</div>
                    <div style={{ fontSize: '13px', color: '#334155', fontWeight: 500 }}>{user?.email || '—'}</div>
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-icon" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
                    <i className="fa fa-id-badge"></i>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Vai trò</div>
                    <div style={{ fontSize: '13px', color: '#334155', fontWeight: 500 }}>{user?.role} — {roleConfig.label}</div>
                  </div>
                </div>
              </div>

              {/* Permissions (EDITOR only) */}
              {user?.role === 'EDITOR' && (
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, marginBottom: '10px' }}>
                    Quyền truy cập
                  </div>
                  {user.permissions?.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {user.permissions.map(p => (
                        <span key={p} className="perm-chip">
                          <i className="fa fa-check" style={{ fontSize: '10px' }}></i>
                          {ALL_PERMISSIONS_LABEL[p] || p}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '13px' }}>
                      <i className="fa fa-exclamation-circle"></i> Chưa được phân quyền
                    </div>
                  )}
                </div>
              )}

              {user?.role === 'ADMIN' && (
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, marginBottom: '10px' }}>
                    Quyền truy cập
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#d97706', fontWeight: 500 }}>
                    <i className="fa fa-shield"></i> Toàn quyền quản trị
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ---- RIGHT: Change password ---- */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="security-card">
            <div className="security-header">
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(79,154,113,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f9a71', fontSize: '18px' }}>
                <i className="fa fa-lock"></i>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--admin-heading)' }}>Bảo mật tài khoản</div>
                <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '1px' }}>Cập nhật mật khẩu để bảo vệ tài khoản</div>
              </div>
            </div>

            <div className="security-body">
              {/* Security tip */}
              <div style={{ display: 'flex', gap: '10px', padding: '12px 14px', background: 'rgba(79,154,113,0.05)', borderRadius: '10px', border: '1px solid rgba(79,154,113,0.12)', marginBottom: '24px' }}>
                <i className="fa fa-info-circle" style={{ color: '#4f9a71', marginTop: '1px', flexShrink: 0 }}></i>
                <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                  Mật khẩu mạnh nên có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <PasswordField
                  label="Mật khẩu hiện tại"
                  name="currentPassword"
                  value={form.currentPassword}
                  onChange={handleChange}
                  error={errors.currentPassword}
                  show={showCurrent}
                  setShow={setShowCurrent}
                />
                <PasswordField
                  label="Mật khẩu mới"
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                  error={errors.newPassword}
                  hint="Tối thiểu 6 ký tự"
                  show={showNew}
                  setShow={setShowNew}
                />
                <PasswordField
                  label="Xác nhận mật khẩu mới"
                  name="confirmNewPassword"
                  value={form.confirmNewPassword}
                  onChange={handleChange}
                  error={errors.confirmNewPassword}
                  show={showConfirm}
                  setShow={setShowConfirm}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <AdminButton
                    type="submit"
                    label="Cập nhật mật khẩu"
                    loading={loading}
                    loadingLabel="Đang lưu..."
                    icon="save"
                    variant="primary"
                    size="md"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminPassword;
