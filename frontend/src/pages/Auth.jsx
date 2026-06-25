import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageTitle from '../components/Shared/PageTitle';
import { loginUser, registerUser, getMe, forgotPassword, resetPassword } from '../services/api';
import { ROUTES } from '../constants/routes';
import { useTranslation } from '../i18n/LanguageContext';
import Input from '../components/Shared/Input';
import { toast } from 'react-toastify';

const Auth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const [regForm, setRegForm] = useState({ fullName: '', email: '', password: '' });
  const [regError, setRegError] = useState('');

  const [forgotForm, setForgotForm] = useState({ email: '' });
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [isSendingForgot, setIsSendingForgot] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [devOtp, setDevOtp] = useState('');

  const [resetForm, setResetForm] = useState({ code: '', password: '', confirmPassword: '' });
  const [resetError, setResetError] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Active Tab state: 'login', 'register', or 'forgot'
  const [activeTab, setActiveTab] = useState('login');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setCheckingAuth(false); return; }
    getMe()
      .then(user => {
        if (user.role) localStorage.setItem('role', user.role);
        if (['ADMIN', 'EDITOR'].includes(user.role)) navigate(ROUTES.ADMIN, { replace: true });
        else navigate(redirectTo || ROUTES.MY_ACCOUNT, { replace: true });
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setCheckingAuth(false);
      });
  }, [navigate]);

  const onLoginChange = (e) => setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  const onRegChange = (e) => setRegForm({ ...regForm, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const data = await loginUser(loginForm);
      localStorage.setItem('token', data.token);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      if (data.user && data.user.role) localStorage.setItem('role', data.user.role);
      if (['ADMIN', 'EDITOR'].includes(data.user?.role)) navigate(ROUTES.ADMIN);
      else navigate(redirectTo || ROUTES.MY_ACCOUNT);
    } catch (err) {
      setLoginError(err.response?.data?.error || t('auth.loginFailed') || 'Đăng nhập thất bại. Vui lòng thử lại.');
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    setIsRegistering(true);
    try {
      const data = await registerUser(regForm);
      localStorage.setItem('token', data.token);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      if (data.user && data.user.role) localStorage.setItem('role', data.user.role);
      navigate(redirectTo || ROUTES.MY_ACCOUNT);
    } catch (err) {
      setRegError(err.response?.data?.error || t('auth.regFailed') || 'Đăng ký thất bại. Email có thể đã tồn tại.');
      setIsRegistering(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setForgotError('');
    setDevOtp('');
    setIsSendingForgot(true);
    try {
      const res = await forgotPassword(forgotForm.email);
      if (res.code) {
        setDevOtp(res.code);
        setResetForm(prev => ({ ...prev, code: res.code }));
      }
      setForgotSubmitted(true);
      toast.success(res.message || 'Mã OTP đã được gửi vào hòm thư email của bạn!');
    } catch (err) {
      setForgotError(err.response?.data?.error || 'Yêu cầu thất bại. Email không tồn tại trong hệ thống.');
    } finally {
      setIsSendingForgot(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    if (resetForm.password !== resetForm.confirmPassword) {
      setResetError('Mật khẩu xác nhận không trùng khớp.');
      return;
    }
    setIsResetting(true);
    try {
      await resetPassword({
        email: forgotForm.email,
        code: resetForm.code,
        newPassword: resetForm.password
      });
      toast.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.');
      setActiveTab('login');
      setForgotForm({ email: '' });
      setResetForm({ code: '', password: '', confirmPassword: '' });
      setForgotSubmitted(false);
    } catch (err) {
      setResetError(err.response?.data?.error || 'Đặt lại mật khẩu thất bại. Vui lòng kiểm tra lại mã OTP.');
    } finally {
      setIsResetting(false);
    }
  };

  useEffect(() => {
    if (!checkingAuth) {
      // Manually trigger animations once the form is rendered
      const timer = setTimeout(() => {
        if (typeof window.documentReadyInit === 'function') {
          window.documentReadyInit();
        }
        if (window.jQuery && window.jQuery.fn.appear) {
          window.jQuery('.animate').each(function() {
            if (window.jQuery(this).is(':appeared')) {
               window.jQuery(this).trigger('appear', [window.jQuery(this)]);
            }
          });
        }
        window.dispatchEvent(new Event('scroll'));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [checkingAuth]);

  if (checkingAuth) {
    return (
      <div className="text-center" style={{ padding: '150px 0' }}>
        <h2>{t('auth.checkingSession') || 'Đang kiểm tra phiên đăng nhập...'}</h2>
        <div className="spinner-border" role="status"></div>
      </div>
    );
  }

  return (
    <>
      <PageTitle 
        title={t('auth.title') || 'Tài Khoản'}
        breadcrumbs={[{ label: t('header.home'), link: '/' }, { label: t('auth.title') || 'Tài Khoản' }]}
      />
      <section className="ls s-py-60 s-py-lg-100">
        <div className="container">
          <div className="row justify-content-center">
            {/* Card width widened a bit as requested (col-md-10 col-lg-8 col-xl-7) */}
            <div className="col-md-10 col-lg-8 col-xl-7">
              
              {/* Tab Navigation */}
              <div className="mb-4">
                <ul className="nav nav-tabs justify-content-center" style={{ borderBottom: '2px solid #eee', display: 'flex', flexWrap: 'nowrap' }}>
                  <li className="nav-item" style={{ flex: 1, textAlign: 'center' }}>
                    <a 
                      className={`nav-link ${activeTab === 'login' ? 'active' : ''}`} 
                      style={{ 
                        border: 'none', background: 'transparent', 
                        color: activeTab === 'login' ? '#c19a5b' : '#888', 
                        fontWeight: 'bold', fontSize: '15px',
                        borderBottom: activeTab === 'login' ? '2px solid #c19a5b' : 'none', 
                        cursor: 'pointer', padding: '12px 5px',
                        transition: 'all 0.3s'
                      }}
                      onClick={() => { setActiveTab('login'); setForgotSubmitted(false); }}
                    >
                      {t('auth.loginTitle') || 'Đăng nhập'}
                    </a>
                  </li>
                  <li className="nav-item" style={{ flex: 1, textAlign: 'center' }}>
                    <a 
                      className={`nav-link ${activeTab === 'register' ? 'active' : ''}`} 
                      style={{ 
                        border: 'none', background: 'transparent', 
                        color: activeTab === 'register' ? '#c19a5b' : '#888', 
                        fontWeight: 'bold', fontSize: '15px',
                        borderBottom: activeTab === 'register' ? '2px solid #c19a5b' : 'none', 
                        cursor: 'pointer', padding: '12px 5px',
                        transition: 'all 0.3s'
                      }}
                      onClick={() => { setActiveTab('register'); setForgotSubmitted(false); }}
                    >
                      {t('auth.registerTitle') || 'Đăng ký'}
                    </a>
                  </li>
                  <li className="nav-item" style={{ flex: 1, textAlign: 'center' }}>
                    <a 
                      className={`nav-link ${activeTab === 'forgot' ? 'active' : ''}`} 
                      style={{ 
                        border: 'none', background: 'transparent', 
                        color: activeTab === 'forgot' ? '#c19a5b' : '#888', 
                        fontWeight: 'bold', fontSize: '15px',
                        borderBottom: activeTab === 'forgot' ? '2px solid #c19a5b' : 'none', 
                        cursor: 'pointer', padding: '12px 5px',
                        transition: 'all 0.3s'
                      }}
                      onClick={() => { setActiveTab('forgot'); setForgotSubmitted(false); }}
                    >
                      Quên mật khẩu
                    </a>
                  </li>
                </ul>
              </div>

              {/* Card Container */}
              <div className="card p-4 p-md-5 shadow-sm" style={{ borderRadius: '12px', border: '1px solid #eee', backgroundColor: '#fff' }}>
                
                {/* LOGIN FORM */}
                {activeTab === 'login' && (
                  <div className="fade-in-up-react">
                    <h4 className="mb-4 text-center">Đăng nhập tài khoản</h4>
                    {loginError && <div className="alert alert-danger" role="alert">{loginError}</div>}
                    <form className="custom-react-form" onSubmit={handleLogin}>
                      <Input
                        wrapperClassName="has-placeholder mb-3"
                        type="email"
                        name="email"
                        id="login-email"
                        label={t('form.email') || 'Email'}
                        placeholder={t('form.email') || 'Địa chỉ Email'}
                        value={loginForm.email}
                        onChange={onLoginChange}
                        required
                      />
                      <Input
                        wrapperClassName="has-placeholder mb-3"
                        type="password"
                        name="password"
                        id="login-password"
                        label={t('form.password') || 'Mật khẩu'}
                        placeholder={t('form.password') || 'Mật khẩu'}
                        value={loginForm.password}
                        onChange={onLoginChange}
                        required
                      />
                      <div className="form-group mb-0 mt-4 text-center">
                        <button type="submit" className="btn btn-maincolor w-100" disabled={isLoggingIn}>
                          {isLoggingIn ? <><i className="fa fa-spinner fa-spin mr-2"></i> {t('auth.loginBtn') || 'Đăng nhập'}...</> : (t('auth.loginBtn') || 'Đăng nhập')}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* REGISTER FORM */}
                {activeTab === 'register' && (
                  <div className="fade-in-up-react">
                    <h4 className="mb-4 text-center">Tạo tài khoản mới</h4>
                    {regError && <div className="alert alert-danger" role="alert">{regError}</div>}
                    <form className="custom-react-form" onSubmit={handleRegister}>
                      <Input
                        wrapperClassName="has-placeholder mb-3"
                        type="text"
                        name="fullName"
                        id="reg-name"
                        label={t('form.fullName') || 'Họ và tên'}
                        placeholder={t('form.fullName') || 'Họ và tên'}
                        value={regForm.fullName}
                        onChange={onRegChange}
                        required
                      />
                      <Input
                        wrapperClassName="has-placeholder mb-3"
                        type="email"
                        name="email"
                        id="reg-email"
                        label={t('form.email') || 'Email'}
                        placeholder={t('form.email') || 'Địa chỉ Email'}
                        value={regForm.email}
                        onChange={onRegChange}
                        required
                      />
                      <Input
                        wrapperClassName="has-placeholder mb-3"
                        type="password"
                        name="password"
                        id="reg-password"
                        label={t('form.password') || 'Mật khẩu'}
                        placeholder={t('form.password') || 'Mật khẩu'}
                        value={regForm.password}
                        onChange={onRegChange}
                        required
                        minLength="6"
                      />
                      <div className="form-group mb-0 mt-4 text-center">
                        <button type="submit" className="btn btn-maincolor2 w-100" disabled={isRegistering}>
                          {isRegistering ? <><i className="fa fa-spinner fa-spin mr-2"></i> {t('auth.registerBtn') || 'Đăng ký ngay'}...</> : (t('auth.registerBtn') || 'Đăng ký ngay')}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* FORGOT PASSWORD FORM */}
                {activeTab === 'forgot' && (
                  <div className="fade-in-up-react">
                    <h4 className="mb-4 text-center">Quên mật khẩu</h4>
                    
                    {!forgotSubmitted ? (
                      <>
                        <p className="text-muted text-center mb-4" style={{ fontSize: '14px' }}>
                          Nhập email đăng ký của bạn. Chúng tôi sẽ gửi mã OTP để bạn đặt lại mật khẩu.
                        </p>
                        {forgotError && <div className="alert alert-danger" role="alert">{forgotError}</div>}
                        <form className="custom-react-form" onSubmit={handleForgot}>
                          <Input
                            wrapperClassName="has-placeholder mb-3"
                            type="email"
                            name="email"
                            id="forgot-email"
                            label={t('form.email') || 'Email'}
                            placeholder={t('form.email') || 'Địa chỉ Email'}
                            value={forgotForm.email}
                            onChange={(e) => setForgotForm({ email: e.target.value })}
                            required
                          />
                          <div className="form-group mb-0 mt-4 text-center">
                            <button type="submit" className="btn btn-maincolor w-100" disabled={isSendingForgot}>
                              {isSendingForgot ? <><i className="fa fa-spinner fa-spin mr-2"></i> Đang xử lý...</> : 'Gửi mã OTP'}
                            </button>
                          </div>
                        </form>
                      </>
                    ) : (
                      <div>
                        <div className="alert alert-warning mb-4 text-center" role="alert" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                          <i className="fa fa-envelope-o mr-2" style={{ fontSize: '16px', color: '#c19a5b' }}></i>
                          Mã OTP khôi phục mật khẩu đã được gửi vào hòm thư <strong>{forgotForm.email}</strong>. Vui lòng kiểm tra hộp thư của bạn (bao gồm cả thư rác/spam).
                        </div>
                        
                        {devOtp && (
                          <div className="alert alert-info mb-4 text-center" role="alert" style={{ fontSize: '13px', lineHeight: '1.6' }}>
                            <i className="fa fa-info-circle mr-2" style={{ fontSize: '15px', color: '#17a2b8' }}></i>
                            <strong>[Chế độ thử nghiệm local]:</strong> Do chưa cấu hình gửi mail SMTP, hệ thống hiển thị mã OTP tại đây để bạn kiểm thử nhanh: <strong style={{ fontSize: '16px', color: '#17a2b8' }}>{devOtp}</strong>
                          </div>
                        )}
                        
                        {resetError && <div className="alert alert-danger" role="alert">{resetError}</div>}
                        
                        <form className="custom-react-form" onSubmit={handleResetPassword}>
                          <Input
                            wrapperClassName="has-placeholder mb-3"
                            type="text"
                            name="code"
                            id="reset-code"
                            label="Mã OTP xác nhận"
                            placeholder="Mã OTP 6 số"
                            value={resetForm.code}
                            onChange={(e) => setResetForm({ ...resetForm, code: e.target.value })}
                            required
                          />
                          <Input
                            wrapperClassName="has-placeholder mb-3"
                            type="password"
                            name="password"
                            id="reset-password"
                            label="Mật khẩu mới"
                            placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                            value={resetForm.password}
                            onChange={(e) => setResetForm({ ...resetForm, password: e.target.value })}
                            required
                            minLength="6"
                          />
                          <Input
                            wrapperClassName="has-placeholder mb-3"
                            type="password"
                            name="confirmPassword"
                            id="reset-confirm-password"
                            label="Xác nhận mật khẩu mới"
                            placeholder="Nhập lại mật khẩu mới"
                            value={resetForm.confirmPassword}
                            onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
                            required
                            minLength="6"
                          />
                          <div className="form-group mb-0 mt-4 text-center">
                            <button type="submit" className="btn btn-maincolor w-100" disabled={isResetting}>
                              {isResetting ? <><i className="fa fa-spinner fa-spin mr-2"></i> Đang cập nhật...</> : 'Đặt lại mật khẩu'}
                            </button>
                            <button 
                              type="button"
                              className="btn btn-link btn-sm mt-3 w-100 text-muted" 
                              onClick={() => setForgotSubmitted(false)}
                            >
                              Nhập email khác
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Auth;
