import React, { useState } from 'react';
import { submitContact } from '../../services/api';
import { useTranslation } from '../../i18n/LanguageContext';
import Input from '../Shared/Input';

const HomeContacts = () => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [status, setStatus] = useState({ loading: false, error: null, success: false });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: false });
    try {
      await submitContact({
        fullName: formData.fullName,
        email: formData.email,
        subject: `Yêu cầu tư vấn - SĐT: ${formData.phone}`,
        message: formData.message
      });
      setStatus({ loading: false, error: null, success: true });
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        message: ''
      });
      setTimeout(() => {
        setStatus(prev => ({ ...prev, success: false }));
      }, 5000);
    } catch (err) {
      console.error(err);
      setStatus({ loading: false, error: 'Đăng ký thất bại. Vui lòng thử lại.', success: false });
    }
  };

  return (
    <section className="ls s-py-40 s-py-lg-130 contact-form main-from s-overlay" id="contacts">
      <div className="container">
        <div className="divider-25"></div>
        <div className="row">
          <div className="col-12 text-center">
            <div className="section-heading">
              <h6 className="small-text color-main2">{t('home.contacts.subtitle')}</h6>
              <h3>{t('home.contacts.title')}</h3>
              <img className="image-wrap" src={`${import.meta.env.BASE_URL}images/icon-main.png`} alt=""/>
            </div>
            <div className="d-none d-lg-block divider-60"></div>
          </div>
        </div>
        
        {status.success && (
          <div className="alert alert-success text-center mb-4" role="alert">
            Cảm ơn bạn! Đăng ký đã được ghi nhận. Chúng tôi sẽ liên hệ sớm.
          </div>
        )}
        
        {status.error && (
          <div className="alert alert-danger text-center mb-4" role="alert">
            {status.error}
          </div>
        )}

        <form className="custom-react-form c-mb-10 c-mb-md-20 c-gutter-20" onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-12 col-md-3">
              <Input 
                wrapperClassName="has-placeholder mb-3"
                id="fullName"
                name="fullName"
                type="text"
                label={t('form.fullName')}
                placeholder={t('form.fullName') || 'Họ và tên'}
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-12 col-md-3">
              <Input 
                wrapperClassName="has-placeholder mb-3"
                id="email"
                name="email"
                type="email"
                label={t('form.email')}
                placeholder={t('form.email') || 'Email'}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-12 col-md-3">
              <Input 
                wrapperClassName="has-placeholder mb-3"
                id="phone"
                name="phone"
                type="text"
                label={t('form.phone')}
                placeholder={t('form.phone') || 'Số điện thoại'}
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-12 col-md-3">
              <Input 
                wrapperClassName="has-placeholder mb-3"
                id="message"
                name="message"
                type="text"
                label={t('form.message')}
                placeholder={t('form.message') || 'Nội dung tư vấn...'}
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="row c-mt-10">
            <div className="col-sm-12">
              <div className="form-group text-center mt-3">
                <button type="submit" className="btn btn-maincolor2" disabled={status.loading}>
                  {status.loading ? (t('common.loading') || 'Đang xử lý...') : (t('common.enrollNow') || 'Đăng ký ngay')}
                </button>
              </div>
            </div>
          </div>
        </form>
        <div className="divider-30"></div>
      </div>
    </section>
  );
};

export default HomeContacts;
