import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useTranslation } from '../../i18n/LanguageContext';
import { imageUrl, PLACEHOLDER_IMAGE } from '../../utils/imageUrl';

const BlogCard = ({ post }) => {
  const { t } = useTranslation();

  const handleImageError = (e) => {
    e.target.src = PLACEHOLDER_IMAGE;
  };

  return (
    <article className="text-center text-md-left vertical-item content-padding post type-post status-publish format-standard has-post-thumbnail bordered h-100 d-flex flex-column">
      <div className="item-media post-thumbnail">
        <Link to={ROUTES.POST_DETAIL(post.slug || 'sample-post')}>
          <img 
            src={imageUrl(post.thumbnail)} 
            alt={post.title} 
            onError={handleImageError}
            style={{ height: '250px', objectFit: 'cover', width: '100%' }}
          />
        </Link>
        <div className="text-md-left entry-meta small-text bg-dark-transpatent">
          <span className="byline">
            <span className="posted-on">
              <span className="screen-reader-text">Posted on</span>
              <Link to={ROUTES.POST_DETAIL(post.slug || 'sample-post')} rel="bookmark">
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
          </span>
        </div>
      </div>
      
      <div className="item-content flex-grow-1 d-flex flex-column">
        <header className="entry-header">
          <h4 className="blog-title">
            <Link to={ROUTES.POST_DETAIL(post.slug || 'sample-post')} rel="bookmark">
              {post.title}
            </Link>
          </h4>
        </header>

        <div className="entry-content flex-grow-1">
          <p className="text-truncate-3">{post.description || post.desc}</p>
        </div>
        
        <div className="blog-btn mt-3">
          <Link to={ROUTES.POST_DETAIL(post.slug || 'sample-post')} className="btn btn-outline-maincolor2">{t('common.readMore') || 'Đọc thêm'}</Link>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
