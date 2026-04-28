import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useTranslation } from '../../i18n/LanguageContext';

const BlogCard = ({ post }) => {
  const { t } = useTranslation();
  return (
    <article className="text-center text-md-left vertical-item content-padding post type-post status-publish format-standard has-post-thumbnail bordered">
      <div className="item-media post-thumbnail">
        <Link to={ROUTES.POST_DETAIL(post.slug || 'sample-post')}>
          <img src={post.thumbnail} alt="" />
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
          <h4 className="blog-title">
            <Link to={ROUTES.POST_DETAIL(post.slug || 'sample-post')} rel="bookmark">
              {post.title}
            </Link>
          </h4>
        </header>

        <div className="entry-content">
          <p>{post.desc}</p>
        </div>
      </div>
      
      <div className="text-center blog-btn">
        <Link to={ROUTES.POST_DETAIL(post.slug || 'sample-post')} className="btn btn-outline-maincolor2">{t('common.readMore') || 'Đọc thêm'}</Link>
      </div>
    </article>
  );
};

export default BlogCard;
