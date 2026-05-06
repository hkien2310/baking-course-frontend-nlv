import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';

const NotFound = () => {
  const { t } = useTranslation();
  return (
    <section className="ls s-py-130 error-404 not-found page_404 s-overlay" style={{ backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container">
        <div className="row">
          <div className="d-none d-lg-block divider-55"></div>
          <div className="col-sm-12 text-center">
            <header className="page-header">
              <h3>404</h3>
              <h4>{t('notFound.title') || 'Oops, page not found!'}</h4>
            </header>

            <div className="page-content mt-5">
              <p className="mb-4">{t('notFound.description') || 'It looks like nothing was found at this location. Maybe try a search or navigate back to the homepage?'}</p>
              <div>
                <Link to="/" className="btn btn-maincolor2">{t('notFound.backHome') || 'back to Home'}</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="d-none d-lg-block divider-75"></div>
      </div>
    </section>
  );
};

export default NotFound;
