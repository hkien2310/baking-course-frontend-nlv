import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../../services/api';
import { ROUTES } from '../../constants/routes';

const BlogSidebar = ({ data }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories({ type: 'POST' })
      .then(res => setCategories(res))
      .catch(() => console.error("Could not load categories in sidebar"));
  }, []);

  // Assuming total posts might be given statically for now, or just remove the /112
  return (
    <aside className="col-lg-5 col-xl-4">
      <div className="widget widget_apsc_widget">
        <div className="apsc-icons-wrapper clearfix apsc-theme-4">
          <div className="apsc-each-profile">
            <a className="apsc-dribble-icon clearfix" href="#">
              <div className="apsc-inner-block">
                <span className="social-icon">
                  <i className="fa fa-dribbble apsc-dribble"></i>
                  <span className="media-name">dribble</span>
                </span>
                <span className="apsc-count">10,547 fans</span>
              </div>
            </a>
          </div>
          <div className="apsc-each-profile">
            <a className="apsc-twitter-icon clearfix" href="#">
              <div className="apsc-inner-block">
                <span className="social-icon">
                  <i className="fa fa-twitter apsc-twitter"></i>
                  <span className="media-name">twitter</span>
                </span>
                <span className="apsc-count">572 fans</span>
              </div>
            </a>
          </div>
          <div className="apsc-each-profile">
            <a className="apsc-google-plus-icon clearfix" href="#">
              <div className="apsc-inner-block">
                <span className="social-icon">
                  <i className="apsc-google-plus fa fa-google-plus"></i>
                  <span className="media-name">google-plus</span>
                </span>
                <span className="apsc-count">756 fans</span>
              </div>
            </a>
          </div>
        </div>
      </div>

      <div className="widget widget_categories">
        <h3 className="widget-title">Categories</h3>
        <ul>
          <li className="cat-item with-icon">
            <i className="color-main2 fa fa-cogs" aria-hidden="true"></i>
            <Link to={ROUTES.RECEIPT}>All news</Link>
          </li>
          {categories.map((cat, index) => (
            <li key={index} className="cat-item">
              <Link to={ROUTES.RECEIPT + "?cat=" + cat.name}>{cat.name}</Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Tạm ẩn Tags do chưa có API thật
      <div className="widget widget_tag_cloud">
        <h3 className="widget-title">Tags</h3>
        <div className="tagcloud">
          {data.tags.map((tag, index) => (
            <Link key={index} to={ROUTES.RECEIPT} className="tag-cloud-link">{tag}</Link>
          ))}
        </div>
      </div>
      */}
    </aside>
  );
};

export default BlogSidebar;
