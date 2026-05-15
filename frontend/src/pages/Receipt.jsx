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

// --- Skeleton Components ---
const SkeletonFeatured = () => (
  <div className="col-xl-4 col-md-6 mb-4">
    <div className="skeleton-card featured">
      <div className="skeleton-img" style={{ height: '280px' }}></div>
      <div className="skeleton-content p-4">
        <div className="skeleton-line sm mb-3"></div>
        <div className="skeleton-line lg mb-3"></div>
        <div className="skeleton-line md"></div>
      </div>
    </div>
  </div>
);

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
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(true);
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
    setFeaturedLoading(true);
    getPosts({ limit: 3 })
      .then(response => {
        const data = response.data || response;
        if (Array.isArray(data)) {
          setFeaturedPosts(data.slice(0, 3));
        }
        setFeaturedLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch featured posts", err);
        setFeaturedLoading(false);
      });
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

  useInitOnLoaded(loading || featuredLoading);

  if ((loading || featuredLoading) && posts.length === 0 && categories.length === 0 && featuredPosts.length === 0) {
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
            .btn-maincolor2 {
              color: #fff !important;
              min-width: 250px !important;
              border-radius: 50px !important;
            }
            article, a, button, img {
              cursor: pointer;
            }
          `}} />

					<div className="d-none d-lg-block divider-40"></div>

          {/* Featured Posts Skeleton or Content */}
          {!categoryFilter && (
            <div className="row c-mb-60 c-mb-lg-30 mb-5">
              <div className="col-lg-12 blog-featured-posts">
                <h3 className="text-center featured-title mb-5" style={{ fontWeight: '800', fontSize: '2.5rem', fontFamily: 'Playfair Display, serif', color: '#20252b' }}>
                  {t('receipt.topPosts') || 'Bài viết nổi bật'}
                </h3>
                <div className="row justify-content-center">
                  {featuredLoading ? (
                    <>
                      <SkeletonFeatured />
                      <SkeletonFeatured />
                      <SkeletonFeatured />
                    </>
                  ) : (
                    featuredPosts.map((post) => (
                      <div key={post.id} className="col-xl-4 col-md-6 mb-4">
                        <article className="vertical-item text-center post type-post status-publish has-post-thumbnail featured h-100 shadow-sm border-0" style={{ borderRadius: '20px', overflow: 'hidden', background: '#fff' }}>
                          <div className="item-media post-thumbnail">
                            <Link to={ROUTES.POST_DETAIL(post.slug)}>
                              <img 
                                src={imageUrl(post.thumbnail)} 
                                alt={post.title} 
                                onError={handleImageError}
                                style={{ height: '280px', objectFit: 'cover', width: '100%' }}
                              />
                            </Link>
                          </div>
                          <div className="item-content p-4 d-flex flex-column h-100">
                            <header className="entry-header">
                              <div className="entry-meta small-text mb-3" style={{ color: '#808080', fontWeight: '500' }}>
                                <span className="posted-on">
                                  <i className="fa fa-calendar" style={{ color: '#6ab78e', marginRight: '8px' }}></i>
                                  <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</time>
                                </span>
                              </div>
                              <h4 className="entry-title mb-3" style={{ fontSize: '1.4rem', lineHeight: '1.3', fontFamily: 'Playfair Display, serif', fontWeight: '700' }}>
                                <Link to={ROUTES.POST_DETAIL(post.slug)} rel="bookmark" className="dark-link" style={{ color: '#20252b' }}>
                                  {post.title}
                                </Link>
                              </h4>
                            </header>
                            <div className="entry-content flex-grow-1">
                              <p className="text-truncate-2" style={{ fontSize: '1rem', color: '#808080', lineHeight: '1.6' }}>{post.description || post.desc}</p>
                            </div>
                          </div>
                        </article>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
					
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
                    <Link to={ROUTES.RECEIPT} className="btn btn-maincolor2 px-5 py-3" style={{ background: '#6ab78e', borderColor: '#6ab78e', cursor: 'pointer' }}>
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
        .btn-maincolor2 {
          color: #fff !important;
          min-width: 250px !important;
          text-transform: none !important;
          font-weight: 600 !important;
        }
      `}} />
    </>
  );
};

export default Receipt;
