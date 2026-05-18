import { useInitOnLoaded } from '../hooks/useInitOnLoaded';
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageTitle from '../components/Shared/PageTitle';
import BlogSidebar from '../components/Blog/BlogSidebar';
import { getPostBySlug, getPosts } from '../services/api';
import { ROUTES } from '../constants/routes';
import { useTranslation } from '../i18n/LanguageContext';
import { imageUrl, PLACEHOLDER_IMAGE } from '../utils/imageUrl';
import PageLoading from '../components/Shared/PageLoading';
import { parseHtmlWithVideos } from '../utils/videoParser';

const formatDate = (dateStr) => {
  if (!dateStr) return 'Gần đây';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getDate()} Thg ${d.getMonth() + 1}, ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
};

const PostDetail = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleImageError = (e) => {
    e.target.src = PLACEHOLDER_IMAGE;
  };

  useEffect(() => {
    Promise.all([getPostBySlug(slug), getPosts({ limit: 100 })])
      .then(([postData, postsData]) => {
        setPost(postData);
        setAllPosts(postsData.data || postsData || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch Post details", err);
        setLoading(false);
      });
  }, [slug]);

  useInitOnLoaded(loading);

  if (loading) {
    return (
      <>
        <PageTitle 
          title={t('postDetail.title') || 'Bài Viết'}
          breadcrumbs={[{ label: t('header.home'), link: '/' }, { label: t('receipt.title') || 'Cẩm Nang', link: ROUTES.RECEIPT }, { label: '...' }]}
        />
        <PageLoading />
      </>
    );
  }

  if (!post) {
    return (
      <div className="text-center" style={{ padding: '150px 0' }}>
        <h2>{t('postDetail.notFound') || 'Không tìm thấy bài viết.'}</h2>
      </div>
    );
  }

  // Find current index for prev/next navigation
  const currentIndex = allPosts.findIndex(p => p.slug === slug);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  // Related posts: other posts matching category, fallback to any, max 4
  let relatedPosts = allPosts.filter(p => p.slug !== slug && p.category === post.category);
  if (relatedPosts.length < 2) {
     relatedPosts = allPosts.filter(p => p.slug !== slug);
  }
  relatedPosts = relatedPosts.slice(0, 4);

  // Helper for image src
  const imgSrc = (src) => imageUrl(src);

  return (
    <>
      <PageTitle 
        title={post.title}
        breadcrumbs={[{ label: t('header.home'), link: '/' }, { label: t('receipt.title') || 'Cẩm Nang', link: ROUTES.RECEIPT }, { label: post.title }]}
      />
      
      <section className="ls s-pt-75 s-pb-0 s-py-lg-100 c-gutter-60">
        <div className="container">
          <div className="row">

            <div className="d-none d-lg-block divider-60"></div>

            {/* ===== MAIN CONTENT ===== */}
            <main className="col-lg-7 col-xl-8">

              {/* Article Card */}
              <article className="vertical-item content-padding post type-post status-publish format-standard has-post-thumbnail bordered">
                {/* Featured Image with metadata overlay */}
                <div className="item-media post-thumbnail">
                  <img src={imgSrc(post.thumbnail)} alt={post.title} onError={handleImageError} />
                  <div className="text-md-left entry-meta small-text bg-dark-transpatent">
                    <span className="byline">
                      <span className="posted-on">
                        <span className="screen-reader-text">Posted on</span>
                        <Link to={ROUTES.POST_DETAIL(post.slug)} rel="bookmark">
                          <i className="fa fa-calendar color-main2"></i>
                          <time dateTime={post.createdAt || post.dateString} className="entry-date published updated">
                            {formatDate(post.createdAt || post.dateString)}
                          </time>
                        </Link>
                      </span>
                      <span className="category-links links-maincolor">
                        <span className="screen-reader-text">Categories</span>
                        <Link to={ROUTES.RECEIPT} rel="category tag">
                          <i className="fa fa-tags color-main2"></i>
                          {post.category || t('receipt.title') || 'Cẩm Nang'}
                        </Link>
                      </span>
                    </span>
                  </div>
                </div>

                {/* Article Content */}
                <div className="item-content">
                  <div className="entry-content">
                    {/* Lead paragraph from desc */}
                    {post.desc && (
                      <p>{post.desc}</p>
                    )}

                    {/* Main content rendered from DB */}
                    <div className="fs-16">
                      {parseHtmlWithVideos(post.content.replace(/\n|\\n/g, '<br/>'))}
                    </div>
                  </div>
                </div>
              </article>

              {/* ===== PREV / NEXT NAVIGATION ===== */}
              <div className="row post-nav nav-links c-gutter-20">
                <div className="col-12 col-md-6">
                  {prevPost && (
                    <div className="nav-previous cover-image s-overlay ds">
                      <div className="post-nav-image">
                        <img src={imgSrc(prevPost.thumbnail)} alt="" onError={handleImageError} />
                      </div>
                      <div className="post-nav-text-wrap">
                        <span aria-hidden="true" className="nav-subtitle color-main2 small-text">{t('postDetail.prev') || 'Bài trước'}</span>
                        <h5 className="nav-title">{prevPost.title}</h5>
                      </div>
                      <Link to={ROUTES.POST_DETAIL(prevPost.slug)}></Link>
                    </div>
                  )}
                </div>
                <div className="col-12 col-md-6">
                  {nextPost && (
                    <div className="nav-next cover-image s-overlay ds">
                      <div className="post-nav-image">
                        <img src={imgSrc(nextPost.thumbnail)} alt="" onError={handleImageError} />
                      </div>
                      <div className="post-nav-text-wrap">
                        <span aria-hidden="true" className="nav-subtitle color-main2 small-text">{t('postDetail.next') || 'Bài sau'}</span>
                        <h5 className="nav-title">{nextPost.title}</h5>
                      </div>
                      <Link to={ROUTES.POST_DETAIL(nextPost.slug)}></Link>
                    </div>
                  )}
                </div>
              </div>



              {/* ===== RELATED POSTS ===== */}
              {relatedPosts.length > 0 && (
                <div className="row mt-5">
                <div className="col-12">
                  <h4 className="title">{t('postDetail.relatedPosts') || 'Bài Cùng Chuyên Mục'}</h4>
                  <div className="divider-20"></div>
                </div>
                <div className="widget widget_posts_2cols related-post bordered">
                  <ul className="list-unstyled">
                    {relatedPosts.map(rp => (
                      <li key={rp.id}>
                        <Link to={ROUTES.POST_DETAIL(rp.slug)}>
                          <img src={imgSrc(rp.thumbnail)} alt="" onError={handleImageError} />
                        </Link>
                        <div className="item-content">
                          <h6>
                            <Link to={ROUTES.POST_DETAIL(rp.slug)}>{rp.title}</Link>
                          </h6>
                          <i className="fa fa-calendar color-main2"></i>
                          <span className="small-text">{formatDate(rp.createdAt || rp.dateString)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                </div>
              )}

            </main>

            {/* ===== RIGHT SIDEBAR ===== */}
            <BlogSidebar />

          </div>
        </div>
      </section>
    </>
  );
};

export default PostDetail;
