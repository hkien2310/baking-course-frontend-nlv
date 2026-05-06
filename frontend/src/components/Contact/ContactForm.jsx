import React, { useState } from 'react';
import { submitContact } from '../../services/api';
import { useTranslation } from '../../i18n/LanguageContext';
import Input from '../Shared/Input';

const ContactForm = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
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
      await submitContact(formData);
      setStatus({ loading: false, error: null, success: true });
      setFormData({ fullName: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => {
        setStatus(prev => ({ ...prev, success: false }));
      }, 5000);
    } catch (err) {
      console.error(err);
      setStatus({ loading: false, error: 'Failed to send message. Please try again.', success: false });
    }
  };

  return (
    <div className="col-lg-8 animate" data-animation="scaleAppear">
      {status.success && (
        <div className="alert alert-success mb-4" role="alert">
          {t('contact.success') || 'Your message has been sent successfully. We will get back to you soon!'}
        </div>
      )}
      {status.error && (
        <div className="alert alert-danger mb-4" role="alert">
          {status.error}
        </div>
      )}

      <form className="custom-react-form c-mb-20 c-gutter-20" onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-sm-12">
            <h4 className="small-margin">{t('contact.formTitle') || 'Contact Form'}</h4>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-6">
            <Input 
              wrapperClassName="has-placeholder mb-3"
              id="fullName"
              name="fullName"
              type="text"
              label={t('contact.fullName') || 'Full Name'}
              placeholder={t('contact.fullName') || 'Full Name'}
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-sm-6">
            <Input 
              wrapperClassName="has-placeholder mb-3"
              id="email"
              name="email"
              type="email"
              label={t('contact.email') || 'Email address'}
              placeholder={t('contact.email') || 'Email Address'}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="row">
          <div className="col-sm-6">
            <Input 
              wrapperClassName="has-placeholder mb-3"
              id="phone"
              name="phone"
              type="text"
              label={<>{t('contact.phone') || 'Phone'} <span style={{color:'#999', fontWeight:400}}>({t('common.optional') || 'Optional'})</span></>}
              placeholder={`${t('contact.phone') || 'Phone Number'} (${t('common.optional') || 'Optional'})`}
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div className="col-sm-6">
            <Input 
              wrapperClassName="has-placeholder mb-3"
              id="subject"
              name="subject"
              type="text"
              label={t('contact.subject') || 'Subject'}
              placeholder={t('contact.subject') || 'Subject'}
              value={formData.subject}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12">
            <div className="form-group has-placeholder">
              <label htmlFor="message">{t('contact.message') || 'Message'}<span className="required">*</span></label>
              <textarea
                rows="6"
                cols="45"
                name="message"
                id="message"
                className="form-control"
                placeholder={t('contact.messagePlaceholder') || 'Your Message...'}
                value={formData.message}
                onChange={handleChange}
                style={{ borderRadius: '5px', padding: '10px 15px' }}
                required
              ></textarea>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="divider-10 d-none d-xl-block"></div>
          <div className="col-sm-12">
            <div className="form-group has-placeholder">
              <button type="submit" className="btn btn-maincolor" disabled={status.loading}>
                {status.loading ? (t('common.sending') || 'Sending...') : (t('common.sendNow') || 'Send Now')}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
