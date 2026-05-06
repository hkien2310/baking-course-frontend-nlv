import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTitle from '../components/Shared/PageTitle';
import { loginUser, registerUser, getMe } from '../services/api';
import { ROUTES } from '../constants/routes';
import { useTranslation } from '../i18n/LanguageContext';
import Input from '../components/Shared/Input';

const Auth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const [regForm, setRegForm] = useState({ fullName: '', email: '', password: '' });
  const [regError, setRegError] = useState('');

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setCheckingAuth(false); return; }
    getMe()
      .then(user => {
        if (user.role) localStorage.setItem('role', user.role);
        if (user.role === 'ADMIN') navigate(ROUTES.ADMIN, { replace: true });
        else navigate(ROUTES.MY_ACCOUNT, { replace: true });
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
      if (data.user && data.user.role) localStorage.setItem('role', data.user.role);
      if (data.user?.role === 'ADMIN') navigate(ROUTES.ADMIN);
      else navigate(ROUTES.MY_ACCOUNT);
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
      if (data.user && data.user.role) localStorage.setItem('role', data.user.role);
      navigate(ROUTES.MY_ACCOUNT);
    } catch (err) {
      setRegError(err.response?.data?.error || t('auth.regFailed') || 'Đăng ký thất bại. Email có thể đã tồn tại.');
      setIsRegistering(false);
    }
  };

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
        title={t('auth.title') || 'Đăng Nhập & Đăng Ký'}
        breadcrumbs={[{ label: t('header.home'), link: '/' }, { label: t('auth.title') || 'Tài Khoản' }]}
      />
      <section className="ls s-py-60 s-py-lg-130">
        <div className="container">
          <div className="row c-gutter-60">
            {/* Login Form */}
            <div className="col-lg-6 mb-5 mb-lg-0 animate" data-animation="fadeInUp">
              <h4 className="mb-4">{t('auth.loginTitle') || 'Đăng nhập tài khoản'}</h4>
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
                <div className="form-group mb-0 mt-4">
                  <button type="submit" className="btn btn-maincolor" disabled={isLoggingIn}>
                    {isLoggingIn ? <><i className="fa fa-spinner fa-spin mr-2"></i> {t('auth.loginBtn') || 'Đăng nhập'}...</> : (t('auth.loginBtn') || 'Đăng nhập')}
                  </button>
                </div>
              </form>
            </div>

            {/* Register Form */}
            <div className="col-lg-6 animate" data-animation="fadeInUp">
              <h4 className="mb-4">{t('auth.registerTitle') || 'Tạo tài khoản mới'}</h4>
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
                <div className="form-group mb-0 mt-4">
                  <button type="submit" className="btn btn-maincolor2" disabled={isRegistering}>
                    {isRegistering ? <><i className="fa fa-spinner fa-spin mr-2"></i> {t('auth.registerBtn') || 'Đăng ký ngay'}...</> : (t('auth.registerBtn') || 'Đăng ký ngay')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Auth;
