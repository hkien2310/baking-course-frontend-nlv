import { useInitOnLoaded } from '../hooks/useInitOnLoaded';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageTitle from '../components/Shared/PageTitle';
import BlogCard from '../components/Blog/BlogCard';
import BlogSidebar from '../components/Blog/BlogSidebar';
import Pagination from '../components/Shared/Pagination';
import { getPosts } from '../services/api';
import { ROUTES } from '../constants/routes';
import { useTranslation } from '../i18n/LanguageContext';

const ITEMS_PER_PAGE = 3;

const Receipt = () => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch featured posts once
  useEffect(() => {
    getPosts()
      .then(data => {
        if (Array.isArray(data)) {
          setFeaturedPosts(data.slice(0, 3));
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    getPosts({ page: currentPage, limit: ITEMS_PER_PAGE })
      .then(response => {
        setPosts(response.data || []);
        setTotalPages(response.totalPages || 1);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch posts", err);
        setLoading(false);
      });
  }, [currentPage]);

  useInitOnLoaded(loading);

  if (loading) {
    return (
      <div className="text-center" style={{ padding: '150px 0' }}>
        <h2>{t('receipt.loading') || 'Đang tải bài viết...'}</h2>
        <div className="spinner-border" role="status"></div>
      </div>
    );
  }

  const paginatedPosts = posts;

  return (
    <>
      <PageTitle 
        title={t('receipt.title') || 'Cẩm Nang Vị Giác'}
        breadcrumbs={[{ label: t('header.home'), link: '/' }, { label: t('receipt.title') || 'Cẩm Nang' }]}
      />

			<section className="ls s-pt-60 s-pb-20 s-pt-md-75 s-py-lg-100 blog">
				<div className="container">
					<div className="d-none d-lg-block divider-60"></div>
					<div className="row c-mb-60 c-mb-lg-30">
						<div className="col-lg-12 blog-featured-posts">
							<h3 className="text-center featured-title">{t('receipt.topPosts') || 'Bài viết nổi bật'}</h3>
              <div className="row justify-content-center">
                {featuredPosts.map((post) => (
                  <div key={post.id} className="col-xl-4 col-md-6">
                    <article className="vertical-item text-center content-padding padding-small bordered post type-post status-publish format-standard has-post-thumbnail featured">
                      <div className="item-media post-thumbnail">
                        <Link to={ROUTES.POST_DETAIL(post.slug)}>
                          <img src={post.thumbnail} alt=""/>
                        </Link>
                        <div className="entry-meta small-text bg-dark-transpatent">
                          <span className="byline">
                            <span className="posted-on">
                              <span className="screen-reader-text">Posted on</span>
                              <Link to={ROUTES.POST_DETAIL(post.slug)} rel="bookmark">
                                <i className="fa fa-calendar color-main2"></i>
                                <time dateTime={post.dateIso || post.createdAt} className="entry-date published updated">{new Date(post.createdAt || post.dateIso || new Date()).toLocaleDateString('vi-VN')}</time>
                              </Link>
                            </span>
                            <span className="category-links links-maincolor">
                              <span className="screen-reader-text">Categories</span>
                              <Link to={ROUTES.RECEIPT} rel="category tag">
                                <i className="fa fa-tags color-main2"></i>
                                {post.category || (t('receipt.title') || 'Cẩm Nang')}
                              </Link>
                            </span>
                            <span className="author vcard">
                              <Link className="url fn n" to={ROUTES.RECEIPT}>
                                <i className="fa fa-user color-main2"></i>
                                {post.author?.name || post.authorName || 'Admin'}
                              </Link>
                            </span>
                          </span>
                        </div>
                      </div>
                      
                      <div className="item-content">
                        <header className="entry-header">
                          <h4 className="entry-title">
                            <Link to={ROUTES.POST_DETAIL(post.slug)} rel="bookmark">
                              {post.title}
                            </Link>
                          </h4>
                        </header>
                        <div className="entry-content">
                          <p>{post.description || post.desc}</p>
                        </div>
                      </div>
                    </article>
                  </div>
                ))}
							</div>
						</div>
					</div>
					<div className="d-none d-lg-block divider-20"></div>
					<div className="row c-gutter-60">
						<main className="col-lg-7 col-xl-8">
              {paginatedPosts.map(post => (
                <div key={post.id}>
                  <BlogCard post={post} />
                  <div className="divider-85"></div>
                </div>
              ))}

              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={(page) => { setCurrentPage(page); window.scrollTo(0, 0); }} 
              />
						</main>

						<BlogSidebar />

					</div>
				</div>
			</section>

    </>
  );
};

export default Receipt;
