import { Link, useLocation } from 'react-router-dom';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { ROUTES } from '../../constants/routes';
import { useTranslation } from '../../i18n/LanguageContext';
import Button from '../Shared/Button';

const Header = () => {
  const { siteConfig } = useSiteConfig();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { t, language, setLanguage } = useTranslation();
  const hasToken = !!localStorage.getItem('token');

  return (
    <div className={isHome ? 'header_absolute' : ''} key={isHome ? 'home-header' : 'inner-header'}>
      <header className={`page_header justify-nav-center ${isHome ? 's-bordertop nav-narrow ds header-main' : 'ls'}`}>
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-xl-2 col-lg-3 col-11">
              <Link to={ROUTES.HOME} className="logo">
                <img src={`${import.meta.env.BASE_URL}images/logo_yum_saigon.png`} alt="Logo" style={{ maxWidth: '100px', marginRight: '15px' }} />
                <span className="logo-text color-darkgrey">
                  {siteConfig.logoText}<strong className="color-main logo-dot">{siteConfig.logoDot}</strong>
                </span>
              </Link>
            </div>
            <div className="col-xl-8 col-lg-5 col-1 text-sm-center">
              <nav className="top-nav">
                <ul className="nav sf-menu">
                  <li className={isHome ? "active" : ""}>
                    <Link to={ROUTES.HOME}>{t('header.home')}</Link>
                  </li>
                  <li className={location.pathname === "/about" ? "active" : ""}>
                    <Link to={ROUTES.ABOUT}>{t('header.about')}</Link>
                  </li>
                  <li className={location.pathname.startsWith("/program") ? "active" : ""}>
                    <Link to={ROUTES.PROGRAM}>{t('header.programs')}</Link>
                  </li>
                  {/* [HIDDEN] Ẩn menu Giảng viên theo yêu cầu khách hàng
                  <li className={location.pathname === "/chiefs" ? "active" : ""}>
                    <Link to={ROUTES.CHIEFS}>{t('header.instructors')}</Link>
                  </li>
                  */}
                  <li className={location.pathname === "/receipt" || location.pathname.startsWith("/post") ? "active" : ""}>
                    <Link to={ROUTES.RECEIPT}>{t('header.recipes')}</Link>
                  </li>
                  <li className={location.pathname === "/contact" ? "active" : ""}>
                    <Link to={ROUTES.CONTACT}>{t('header.contacts')}</Link>
                  </li>
                </ul>
              </nav>
            </div>
            <div className="col-xl-2 col-lg-3 text-left text-xl-right d-none d-lg-block">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                {hasToken ? (
                  <Button to={localStorage.getItem('role') === 'ADMIN' ? ROUTES.ADMIN : ROUTES.MY_ACCOUNT} variant="main2">{t('userDash.title') || 'Dashboard'}</Button>
                ) : (
                  <Button to={ROUTES.AUTH} variant="main2">{t('header.cta')}</Button>
                )}
              </span>
            </div>
          </div>
        </div>
        <span className="toggle_menu">
          <span></span>
        </span>
      </header>
    </div>
  );
};

export default Header;
