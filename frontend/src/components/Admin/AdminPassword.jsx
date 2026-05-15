import React, { useState } from 'react';
import AdminPageShell from './AdminPageShell';
import AdminButton from './Shared/AdminButton';
import { changePassword } from '../../services/api';
import { toast } from 'react-toastify';
import { useTranslation } from '../../i18n/LanguageContext';

const AdminPassword = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Visibility states
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (formData.newPassword.length < 6) {
      newErrors.newPassword = t('form.passwordTooShort');
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      newErrors.confirmNewPassword = t('form.passwordMismatch');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      toast.success(t('form.passwordChangedSuccess'));
      setFormData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setErrors({});
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Lỗi khi đổi mật khẩu";
      toast.error(errorMsg);
      if (errorMsg.includes("hiện tại")) {
        setErrors({ currentPassword: errorMsg });
      }
    } finally {
      setLoading(false);
    }
  };

  const createHoldHandlers = (setter) => ({
    onMouseDown: () => setter(true),
    onMouseUp: () => setter(false),
    onMouseLeave: () => setter(false),
    onTouchStart: (e) => { setter(true); },
    onTouchEnd: (e) => { setter(false); }
  });

  return (
    <AdminPageShell 
      title={t('adminDash.password.title')} 
      subtitle={t('adminDash.password.subtitle')}
    >
      <div style={{ maxWidth: '700px', margin: '40px auto' }}>
        <div className="admin-paper" style={{ padding: '40px', borderRadius: '12px' }}>
          <form onSubmit={handleSubmit} noValidate>
            
            {/* CURRENT PASSWORD */}
            <div className="admin-form-group">
              <label style={{ fontWeight: '600', fontSize: '14px', marginBottom: '10px' }}>{t('form.currentPassword')}</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input 
                  type={showCurrent ? "text" : "password"}
                  name="currentPassword"
                  className={`admin-form-control ${errors.currentPassword ? 'is-invalid' : ''}`}
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder={t('form.currentPassword')}
                  style={{ paddingRight: '50px' }}
                />
                <button 
                  type="button"
                  className="eye-hold-btn"
                  {...createHoldHandlers(setShowCurrent)}
                >
                  <i className={`fa fa-eye${showCurrent ? '' : '-slash'}`}></i>
                </button>
              </div>
              {errors.currentPassword && <span className="field-error">{errors.currentPassword}</span>}
            </div>

            {/* NEW PASSWORD */}
            <div className="admin-form-group">
              <label style={{ fontWeight: '600', fontSize: '14px', marginBottom: '10px' }}>{t('form.newPassword')}</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input 
                  type={showNew ? "text" : "password"}
                  name="newPassword"
                  className={`admin-form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder={t('form.newPassword')}
                  style={{ paddingRight: '50px' }}
                />
                <button 
                  type="button"
                  className="eye-hold-btn"
                  {...createHoldHandlers(setShowNew)}
                >
                  <i className={`fa fa-eye${showNew ? '' : '-slash'}`}></i>
                </button>
              </div>
              {errors.newPassword ? (
                <span className="field-error">{errors.newPassword}</span>
              ) : (
                <small className="text-muted" style={{ display: 'block', marginTop: '5px' }}>{t('form.passwordTooShort')}</small>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="admin-form-group">
              <label style={{ fontWeight: '600', fontSize: '14px', marginBottom: '10px' }}>{t('form.confirmNewPassword')}</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input 
                  type={showConfirm ? "text" : "password"}
                  name="confirmNewPassword"
                  className={`admin-form-control ${errors.confirmNewPassword ? 'is-invalid' : ''}`}
                  value={formData.confirmNewPassword}
                  onChange={handleChange}
                  placeholder={t('form.confirmNewPassword')}
                  style={{ paddingRight: '50px' }}
                />
                <button 
                  type="button"
                  className="eye-hold-btn"
                  {...createHoldHandlers(setShowConfirm)}
                >
                  <i className={`fa fa-eye${showConfirm ? '' : '-slash'}`}></i>
                </button>
              </div>
              {errors.confirmNewPassword && <span className="field-error">{errors.confirmNewPassword}</span>}
            </div>

            <div className="text-right mt-5">
              <AdminButton 
                type="submit"
                label={t('form.changePasswordBtn')}
                loading={loading}
                icon="save"
                size="lg"
                className="admin-btn-primary"
              />
            </div>
          </form>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .eye-hold-btn {
          position: absolute !important;
          right: 0 !important;
          top: 0 !important;
          height: 44px !important;
          width: 44px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
          margin: 0 !important;
          color: #94a3b8 !important;
          cursor: pointer !important;
          font-size: 16px !important;
          z-index: 5 !important;
        }
        .eye-hold-btn:hover {
          color: var(--admin-brand, #4f9a71) !important;
        }
        .eye-hold-btn:active {
          transform: scale(0.9) !important;
        }
        .admin-form-control.is-invalid {
          border-color: #e53e3e !important;
          background-color: #fffafa !important;
        }
      `}} />
    </AdminPageShell>
  );
};

export default AdminPassword;
