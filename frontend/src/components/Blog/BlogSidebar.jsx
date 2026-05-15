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

  return (
    <aside className="col-lg-5 col-xl-4">
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
