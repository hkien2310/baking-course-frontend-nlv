import { useInitOnLoaded } from '../hooks/useInitOnLoaded';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageTitle from '../components/Shared/PageTitle';
import Pagination from '../components/Shared/Pagination';
import { getChiefs } from '../services/api';
import { useTranslation } from '../i18n/LanguageContext';
import { ROUTES } from '../constants/routes';
import { imageUrl } from '../utils/imageUrl';

const ITEMS_PER_PAGE = 6;

const Chiefs = () => {
  const { t } = useTranslation();
  const [chiefs, setChiefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    getChiefs({ page: currentPage, limit: ITEMS_PER_PAGE })
      .then(response => {
        setChiefs(response.data || []);
        setTotalPages(response.totalPages || 1);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch chiefs", err);
        setLoading(false);
      });
  }, [currentPage]);

  useInitOnLoaded(loading);

  if (loading) {
    return (
      <div className="text-center" style={{ padding: '150px 0' }}>
        <h2>{t('chiefs.loading') || 'Đang tải danh sách giảng viên...'}</h2>
        <div className="spinner-border" role="status"></div>
      </div>
    );
  }

  const paginatedChiefs = chiefs;

  const imgSrc = (src) => imageUrl(src, `${import.meta.env.BASE_URL}images/team/01.jpg`);

  return (
    <>
      <PageTitle 
        title={t('chiefs.title') || 'Đội Ngũ Giảng Viên'} 
        breadcrumbs={[{ label: t('header.home'), link: '/' }, { label: t('chiefs.title') || 'Giảng Viên' }]} 
      />

      <section className="ls s-pt-90 s-pb-50 s-py-lg-100 c-mb-50 c-mb-md-30 chiefs">
        <div className="container">
          <div className="row">
            <div className="d-none d-lg-block divider-60"></div>

            {paginatedChiefs.map((chief) => (
              <div key={chief.id} className="col-md-6 col-lg-4">
                <div className="vertical-item content-absolute text-center">
                  <div className="item-media">
                    <img src={imgSrc(chief.image)} alt={chief.name} />
                    <div className="media-links">
                      <Link className="abs-link" title="" to={ROUTES.CHIEF_DETAIL(chief.id)}></Link>
                    </div>
                  </div>
                  <div className="item-content bg-maincolor-transparent">
                    <h4>
                      <Link className="dark" to={ROUTES.CHIEF_DETAIL(chief.id)}>{chief.name}</Link>
                    </h4>
                    <h6 className="small-text">{chief.role}</h6>
                    <div className="mt-3">
                      <Link to={`${ROUTES.PROGRAM}?chiefId=${chief.id}`} className="btn btn-sm btn-outline-maincolor bg-transparent text-white border-white">
                        {t('chiefs.viewClasses') || 'Xem Khóa Học'}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="d-none d-lg-block divider-30"></div>
          </div>

          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={(page) => { setCurrentPage(page); window.scrollTo(0, 0); }} 
          />
        </div>
      </section>
    </>
  );
};

export default Chiefs;
