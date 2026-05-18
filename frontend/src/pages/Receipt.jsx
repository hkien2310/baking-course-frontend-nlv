import { useInitOnLoaded } from '../hooks/useInitOnLoaded';
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageTitle from '../components/Shared/PageTitle';
import BlogCard from '../components/Blog/BlogCard';
import Pagination from '../components/Shared/Pagination';
import { getPosts, getCategories } from '../services/api';
import { ROUTES } from '../constants/routes';
import { useTranslation } from '../i18n/LanguageContext';
import PageLoading from '../components/Shared/PageLoading';
import { imageUrl, PLACEHOLDER_IMAGE } from '../utils/imageUrl';

const ITEMS_PER_PAGE = 6;

const SkeletonCard = () => (
  <div className="col-lg-6 col-xl-4 mb-5">
    <div className="skeleton-card">
      <div className="skeleton-img" style={{ height: '250px' }}></div>
      <div className="skeleton-content p-4">
        <div className="skeleton-line sm mb-3"></div>
        <div className="skeleton-line lg mb-3"></div>
        <div className="skeleton-line md"></div>
      </div>
    </div>
  </div>
);

const Receipt = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('cat');
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleImageError = (e) => {
    e.target.src = PLACEHOLDER_IMAGE;
  };

  useEffect(() => {
    getCategories({ type: 'POST' })
      .then(res => setCategories(res || []))
      .catch(err => console.error("Could not load categories", err));
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter]);

  useEffect(() => {
    setLoading(true);
    setPosts([]); 
    
    getPosts({ page: currentPage, limit: ITEMS_PER_PAGE, category: categoryFilter || undefined })
      .then(response => {
        setPosts(response.data || []);
        setTotalPages(response.totalPages || 1);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch posts", err);
        setLoading(false);
      });
  }, [currentPage, categoryFilter]);

  useInitOnLoaded(loading);

  if (loading && posts.length === 0 && categories.length === 0) {
    return <PageLoading />;
  }

  return (
    <>
      <PageTitle 
        title={t('receipt.title') || 'Cẩm Nang Vị Giác'}
        breadcrumbs={[{ label: t('header.home'), link: '/' }, { label: t('receipt.title') || 'Cẩm Nang' }]}
      />

			<section className="ls s-pt-60 s-pb-20 s-pt-md-75 s-py-lg-100 blog">
				<div className="container">
          <div className="row mb-5 justify-content-center">
            <div className="col-12">
              <nav className="d-flex flex-wrap justify-content-center align-items-center category-nav-container">
                <Link 
                  to={ROUTES.RECEIPT} 
                  className={`premium-nav-item ${!categoryFilter ? 'active' : ''}`}
                >
                  <span className="nav-text">{t('common.all') || 'Tất cả'}</span>
                </Link>
                {categories.map((cat) => (
                  <Link 
                    key={cat.id} 
                    to={ROUTES.RECEIPT + "?cat=" + cat.name} 
                    className={`premium-nav-item ${categoryFilter === cat.name ? 'active' : ''}`}
                  >
                    <span className="nav-text">{cat.name}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          <style dangerouslySetInnerHTML={{ __html: `
            .category-nav-container {
              padding: 15px 0;
              gap: 12px;
            }
            .premium-nav-item {
              position: relative;
              padding: 10px 28px;
              background: transparent;
              border: 2px solid #e5e5e5;
              border-radius: 50px;
              color: #20252b;
              font-family: 'Playfair Display', serif;
              font-size: 15px;
              font-weight: 600;
              letter-spacing: 0.5px;
              cursor: pointer !important;
              transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
              display: flex;
              align-items: center;
              justify-content: center;
              text-decoration: none !important;
            }
            .premium-nav-item:hover {
              border-color: #6ab78e;
              color: #6ab78e;
              transform: translateY(-3px);
            }
            .premium-nav-item.active {
              background: #6ab78e;
              border-color: #6ab78e;
              color: #ffffff;
              box-shadow: 0 4px 12px rgba(106, 183, 142, 0.4);
            }
            
            /* Skeleton Styles */
            .skeleton-card {
              background: #fff;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 2px 10px rgba(0,0,0,0.05);
              height: 100%;
            }
            .skeleton-img {
              width: 100%;
              background: linear-gradient(90deg, #f0f0f0 25%, #f7f7f7 50%, #f0f0f0 75%);
              background-size: 200% 100%;
              animation: skeleton-loading 1.5s infinite linear;
            }
            .skeleton-line {
              height: 12px;
              background: linear-gradient(90deg, #f0f0f0 25%, #f7f7f7 50%, #f0f0f0 75%);
              background-size: 200% 100%;
              animation: skeleton-loading 1.5s infinite linear;
              border-radius: 4px;
            }
            .skeleton-line.sm { width: 30%; }
            .skeleton-line.md { width: 60%; }
            .skeleton-line.lg { width: 90%; }
            
            @keyframes skeleton-loading {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }

            .dark-link:hover {
              color: #6ab78e;
            }
          `}} />

					<div className="d-none d-lg-block divider-40"></div>

					<div className="row c-gutter-60 mt-4">
						<main className="col-lg-12">
              <div className="row">
                {loading ? (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                ) : posts.length > 0 ? (
                  <>
                    {posts.map(post => (
                      <div key={post.id} className="col-lg-6 col-xl-4 mb-5">
                        <BlogCard post={post} />
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center no-results py-5 col-12" style={{ background: '#f5f5f5', border: '2px dashed #e5e5e5', borderRadius: '30px' }}>
                    <div className="mb-4" style={{ fontSize: '6rem', filter: 'grayscale(1)', opacity: '0.3' }}>🥨</div>
                    <h3 className="mb-3" style={{ fontWeight: '700', color: '#20252b', fontFamily: 'Playfair Display, serif' }}>{t('common.noPosts') || 'Chưa có công thức này'}</h3>
                    <p className="mb-4" style={{ color: '#808080', fontSize: '1.1rem' }}>{t('common.tryAgain') || 'Hãy thử tìm một hương vị khác nhé!'}</p>
                    <Link to={ROUTES.RECEIPT} className="btn btn-receipt-back px-5 py-3" style={{ background: '#6ab78e', borderColor: '#6ab78e', cursor: 'pointer' }}>
                      {t('common.backToAll') || 'Xem tất cả công thức'}
                    </Link>
                  </div>
                )}
              </div>
              
              {!loading && posts.length > 0 && (
                <>
                  <div className="divider-40"></div>
                  <Pagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={(page) => { setCurrentPage(page); window.scrollTo(0, 0); }} 
                  />
                </>
              )}
						</main>
					</div>
				</div>
			</section>

      <style dangerouslySetInnerHTML={{ __html: `
        .text-truncate-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;  
          overflow: hidden;
        }
        .btn-receipt-back {
          color: #fff !important;
          min-width: 250px !important;
          border-radius: 50px !important;
          text-transform: none !important;
          font-weight: 600 !important;
        }
      `}} />
    </>
  );
};

export default Receipt;
