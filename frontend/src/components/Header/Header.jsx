import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { ROUTES } from '../../constants/routes';
import { useTranslation } from '../../i18n/LanguageContext';
import Button from '../Shared/Button';
import { getCategories } from '../../services/api';

const Header = () => {
  const { siteConfig } = useSiteConfig();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { t, language, setLanguage } = useTranslation();
  const hasToken = !!localStorage.getItem('token');
  const [categories, setCategories] = useState([]);
  
  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null);

  useEffect(() => {
    getCategories({ type: 'PROGRAM' })
      .then(res => {
        const cats = res?.data || res || [];
        setCategories(cats.filter(c => c.isActive));
        
        // Re-init superfish plugin after categories are loaded to bind dropdown events (for PC)
        setTimeout(() => {
          if (typeof window.documentReadyInit === 'function') {
            window.documentReadyInit();
          }
        }, 50);
      })
      .catch(() => console.error('Failed to load categories for header'));
  }, []);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setExpandedMenu(null); // Reset accordions when closed
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleSubmenu = (menuName) => {
    setExpandedMenu(expandedMenu === menuName ? null : menuName);
  };

  // Close mobile menu on route change
  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <div className={isHome ? 'header_absolute' : ''} key={isHome ? 'home-header' : 'inner-header'}>
      <header className={`page_header justify-nav-center ${isHome ? 's-bordertop nav-narrow ds header-main' : 'ls'}`} style={{ position: 'relative', zIndex: 1060 }}>
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
            {/* Desktop Navigation */}
            <div className="col-xl-8 col-lg-5 col-1 text-sm-center">
              <nav className="top-nav">
                <ul className="nav sf-menu d-none d-lg-block">
                  <li className={location.pathname.startsWith("/program") ? "active" : ""}>
                    <Link to={ROUTES.PROGRAM}>{t('header.programs')}</Link>
                    {categories.length > 0 && (
                      <ul>
                        <li><Link to={ROUTES.PROGRAM}>Tất cả khóa học</Link></li>
                        {categories.map(cat => (
                          <li key={cat.id}>
                            <Link to={`${ROUTES.PROGRAM}?category=${cat.slug}`}>
                              {cat.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                  <li className={location.pathname === "/receipt" || location.pathname.startsWith("/post") ? "active" : ""}>
                    <Link to={ROUTES.RECEIPT}>{t('header.recipes') || 'Chia sẻ'}</Link>
                  </li>
                  <li className={location.pathname === "/student-work" ? "active" : ""}>
                    <Link to={ROUTES.STUDENT_WORK}>{t('header.studentWork')}</Link>
                  </li>
                  <li className={location.pathname === "/contact" ? "active" : ""}>
                    <Link to={ROUTES.CONTACT}>{t('header.contacts')}</Link>
                  </li>
                </ul>
              </nav>
            </div>
            {/* Desktop CTA */}
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
        
        {/* Mobile Hamburger Toggle (Template overrides this visually, but we control the click) */}
        <span 
          className={`toggle_menu ${isMobileMenuOpen ? 'active' : ''}`} 
          onClick={(e) => {
             e.stopPropagation();
             toggleMobileMenu();
          }}
          style={{ zIndex: 1070 }}
        >
          <span></span>
        </span>
      </header>

      {/* --- CUSTOM UI/UX MOBILE SIDEBAR DRAWER --- */}
      
      {/* Backdrop Overlay */}
      <div 
        onClick={closeMobileMenu}
        style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 1040,
          opacity: isMobileMenuOpen ? 1 : 0,
          visibility: isMobileMenuOpen ? 'visible' : 'hidden',
          transition: 'opacity 0.3s ease, visibility 0.3s ease'
        }}
      />

      {/* Sidebar Panel */}
      <div 
        style={{
          position: 'fixed', top: 0, left: 0, width: '85%', maxWidth: '340px', height: '100%',
          backgroundColor: '#ffffff',
          boxShadow: '5px 0 25px rgba(0,0,0,0.1)',
          zIndex: 1050,
          transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex', flexDirection: 'column',
          paddingTop: '90px', // Offset for the header sitting on top
          overflowY: 'auto', overflowX: 'hidden'
        }}
      >

        {/* Sidebar Menu Items */}
        <div style={{ padding: '10px 0', display: 'flex', flexDirection: 'column', flex: 1 }}>
          
          {/* Programs with Accordion */}
          <div>
            <div 
              style={{
                padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: '1px solid #f5f5f5', cursor: 'pointer',
                backgroundColor: expandedMenu === 'programs' ? '#fafafa' : '#fff'
              }}
              onClick={() => toggleSubmenu('programs')}
            >
              <Link 
                to={ROUTES.PROGRAM} 
                onClick={(e) => { e.stopPropagation(); closeMobileMenu(); }}
                style={{ 
                  fontSize: '16px', fontWeight: 600, 
                  color: location.pathname.startsWith("/program") ? '#00a651' : '#333' 
                }}
              >
                {t('header.programs')}
              </Link>
              <span style={{ 
                transform: expandedMenu === 'programs' ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease', color: '#888', fontSize: '14px'
              }}>
                ▼
              </span>
            </div>
            
            {/* Submenu Drawer */}
            <div style={{
              maxHeight: expandedMenu === 'programs' ? '500px' : '0',
              overflow: 'hidden', transition: 'max-height 0.4s ease',
              backgroundColor: '#fafafa'
            }}>
              <Link to={ROUTES.PROGRAM} onClick={closeMobileMenu} style={{ 
                display: 'block', padding: '12px 24px 12px 40px', color: '#555', fontSize: '15px', borderBottom: '1px solid #f0f0f0' 
              }}>
                Tất cả khóa học
              </Link>
              {categories.map(cat => (
                <Link key={cat.id} to={`${ROUTES.PROGRAM}?category=${cat.slug}`} onClick={closeMobileMenu} style={{ 
                  display: 'block', padding: '12px 24px 12px 40px', color: '#555', fontSize: '15px', borderBottom: '1px solid #f0f0f0' 
                }}>
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <Link to={ROUTES.RECEIPT} onClick={closeMobileMenu} style={{ 
            padding: '16px 24px', fontSize: '16px', fontWeight: 600, borderBottom: '1px solid #f5f5f5',
            color: (location.pathname === "/receipt" || location.pathname.startsWith("/post")) ? '#00a651' : '#333' 
          }}>
            {t('header.recipes') || 'Chia sẻ'}
          </Link>
          
          <Link to={ROUTES.STUDENT_WORK} onClick={closeMobileMenu} style={{ 
            padding: '16px 24px', fontSize: '16px', fontWeight: 600, borderBottom: '1px solid #f5f5f5',
            color: location.pathname === "/student-work" ? '#00a651' : '#333' 
          }}>
            {t('header.studentWork')}
          </Link>

          <Link to={ROUTES.CONTACT} onClick={closeMobileMenu} style={{ 
            padding: '16px 24px', fontSize: '16px', fontWeight: 600, borderBottom: '1px solid #f5f5f5',
            color: location.pathname === "/contact" ? '#00a651' : '#333' 
          }}>
            {t('header.contacts')}
          </Link>

        </div>

        {/* Sidebar Footer CTA */}
        <div style={{ padding: '24px', marginTop: 'auto', borderTop: '1px solid #eee' }}>
          {hasToken ? (
            <Link 
              to={localStorage.getItem('role') === 'ADMIN' ? ROUTES.ADMIN : ROUTES.MY_ACCOUNT} 
              onClick={closeMobileMenu}
              style={{
                display: 'block', textAlign: 'center', backgroundColor: '#00a651', color: '#fff',
                padding: '14px', borderRadius: '8px', fontWeight: 'bold', letterSpacing: '0.5px',
                boxShadow: '0 4px 14px rgba(0, 166, 81, 0.3)'
              }}
            >
              {t('userDash.title') || 'Dashboard'}
            </Link>
          ) : (
            <Link 
              to={ROUTES.AUTH} 
              onClick={closeMobileMenu}
              style={{
                display: 'block', textAlign: 'center', backgroundColor: '#00a651', color: '#fff',
                padding: '14px', borderRadius: '8px', fontWeight: 'bold', letterSpacing: '0.5px',
                boxShadow: '0 4px 14px rgba(0, 166, 81, 0.3)'
              }}
            >
              {t('header.cta')}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
