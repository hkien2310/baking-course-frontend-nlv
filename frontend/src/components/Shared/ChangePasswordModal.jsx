import React, { useState } from 'react';
import { changePassword } from '../../services/api';
import { toast } from 'react-toastify';
import { useTranslation } from '../../i18n/LanguageContext';

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const createHoldHandlers = (key) => ({
    onMouseDown: () => setShowPw(prev => ({ ...prev, [key]: true })),
    onMouseUp: () => setShowPw(prev => ({ ...prev, [key]: false })),
    onMouseLeave: () => setShowPw(prev => ({ ...prev, [key]: false })),
    onTouchStart: () => setShowPw(prev => ({ ...prev, [key]: true })),
    onTouchEnd: () => setShowPw(prev => ({ ...prev, [key]: false })),
  });

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
      onClose();
      setFormData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      const msg = err.response?.data?.error || "Lỗi hệ thống";
      toast.error(msg);
      if (msg.includes("hiện tại")) setErrors({ currentPassword: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal fade show" style={{ display: 'block', zIndex: 10001 }} tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content" style={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
            <div className="modal-header" style={{ padding: '20px 30px', borderBottom: '1px solid #eee' }}>
              <h5 className="modal-title" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, margin: 0, fontSize: '1.25rem' }}>
                {t('adminDash.password.title')}
              </h5>
              <button type="button" className="close" onClick={onClose} aria-label="Close" style={{ fontSize: '28px', opacity: 0.5, background: 'none', border: 'none', boxShadow: 'none', outline: 'none' }}>
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body" style={{ padding: '30px' }}>
              <form onSubmit={handleSubmit}>
                <div className="form-group mb-4">
                  <label style={{ fontWeight: 600, color: '#333', marginBottom: '8px', display: 'block' }}>{t('form.currentPassword')}</label>
                  <div className="position-relative stable-pw-wrapper">
                    <input 
                      type={showPw.current ? "text" : "password"}
                      name="currentPassword"
                      className={`form-control ${errors.currentPassword ? 'is-invalid' : ''}`}
                      value={formData.currentPassword}
                      onChange={handleChange}
                      placeholder={t('form.currentPassword')}
                      required
                      style={{ height: '50px', borderRadius: '8px', paddingRight: '50px' }}
                    />
                    <button type="button" className="eye-hold-btn-v5" {...createHoldHandlers('current')}>
                      <i className={`fa fa-eye${showPw.current ? '' : '-slash'}`}></i>
                    </button>
                  </div>
                  {errors.currentPassword && <div className="text-danger small mt-2 fw-500">{errors.currentPassword}</div>}
                </div>

                <div className="form-group mb-4">
                  <label style={{ fontWeight: 600, color: '#333', marginBottom: '8px', display: 'block' }}>{t('form.newPassword')}</label>
                  <div className="position-relative stable-pw-wrapper">
                    <input 
                      type={showPw.next ? "text" : "password"}
                      name="newPassword"
                      className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder={t('form.newPassword')}
                      required
                      style={{ height: '50px', borderRadius: '8px', paddingRight: '50px' }}
                    />
                    <button type="button" className="eye-hold-btn-v5" {...createHoldHandlers('next')}>
                      <i className={`fa fa-eye${showPw.next ? '' : '-slash'}`}></i>
                    </button>
                  </div>
                  {errors.newPassword ? <div className="text-danger small mt-2 fw-500">{errors.newPassword}</div> : <small className="text-muted mt-1">{t('form.passwordTooShort')}</small>}
                </div>

                <div className="form-group mb-5">
                  <label style={{ fontWeight: 600, color: '#333', marginBottom: '8px', display: 'block' }}>{t('form.confirmNewPassword')}</label>
                  <div className="position-relative stable-pw-wrapper">
                    <input 
                      type={showPw.confirm ? "text" : "password"}
                      name="confirmNewPassword"
                      className={`form-control ${errors.confirmNewPassword ? 'is-invalid' : ''}`}
                      value={formData.confirmNewPassword}
                      onChange={handleChange}
                      placeholder={t('form.confirmNewPassword')}
                      required
                      style={{ height: '50px', borderRadius: '8px', paddingRight: '50px' }}
                    />
                    <button type="button" className="eye-hold-btn-v5" {...createHoldHandlers('confirm')}>
                      <i className={`fa fa-eye${showPw.confirm ? '' : '-slash'}`}></i>
                    </button>
                  </div>
                  {errors.confirmNewPassword && <div className="text-danger small mt-2 fw-500">{errors.confirmNewPassword}</div>}
                </div>

                <button 
                  type="submit" 
                  className="btn btn-maincolor btn-block" 
                  disabled={loading}
                  style={{ height: '54px', borderRadius: '50px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}
                >
                  {loading ? <i className="fa fa-spinner fa-spin mr-2"></i> : null}
                  {t('form.changePasswordBtn')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" style={{ zIndex: 10000 }} onClick={onClose}></div>

      <style dangerouslySetInnerHTML={{ __html: `
        .stable-pw-wrapper {
          width: 100%;
          display: block;
        }
        .eye-hold-btn-v5 {
          position: absolute !important;
          right: 0 !important;
          top: 0 !important;
          height: 100% !important;
          width: 50px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          background: transparent !important;
          border: none !important;
          color: #adb5bd !important;
          cursor: pointer !important;
          font-size: 18px !important;
          z-index: 10 !important;
          transition: all 0.2s;
        }
        .eye-hold-btn-v5:hover { color: #6ab78e !important; }
        .eye-hold-btn-v5:active { transform: scale(0.9) !important; }
        .fw-500 { font-weight: 500; }
        .modal-title { color: #20252b !important; }
      `}} />
    </>
  );
};

export default ChangePasswordModal;
