import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { formatPrice, formatStudentCount, calcDiscountPercent } from '../../utils/formatters';
import { imageUrl } from '../../utils/imageUrl';
import Button from './Button';

const ProgramCard = ({ cls }) => {
  const navigate = useNavigate();
  const discountPercent = calcDiscountPercent(cls.price, cls.salePrice);
  const displayPrice = cls.salePrice && cls.price > cls.salePrice ? cls.salePrice : cls.price;

  const handleBuyClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(ROUTES.PROGRAM_DETAIL(cls.slug));
  };

  const getCategoryLabel = () => {
    if (cls.category) return cls.category;
    if (cls.programType === 'LIVE_CLASS') return 'Live class';
    return 'Khóa học';
  };

  const stripHtmlAndTruncate = (html, length = 120) => {
    if (!html) return '';
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const text = doc.body.textContent || "";
      return text.length > length ? text.substring(0, length) + '...' : text;
    } catch(e) {
      // Fallback regex if DOMParser fails (e.g. some SSR environments, though we are in Vite client)
      const text = html.replace(/<[^>]*>?/gm, '');
      return text.length > length ? text.substring(0, length) + '...' : text;
    }
  };

  return (
    <div className="program-card-v3 bordered">
      {/* Image */}
      <div className="pc3-image">
        <Link to={ROUTES.PROGRAM_DETAIL(cls.slug)}>
          <img src={imageUrl(cls.thumbnail, `${import.meta.env.BASE_URL}images/gallery/09.jpg`)} alt={cls.title} />
        </Link>
      </div>

      {/* Content */}
      <div className="pc3-body">
        <h5 className="pc3-title">
          <Link to={ROUTES.PROGRAM_DETAIL(cls.slug)}>{cls.title}</Link>
        </h5>
        <p className="pc3-desc">{stripHtmlAndTruncate(cls.description, 140)}</p>
      </div>

      {/* Footer: stats + buy button */}
      <div className="pc3-footer">
        <div className="pc3-stats-row">
          {discountPercent && (
            <span className="pc3-discount-pill">-{discountPercent}%</span>
          )}
          {cls.salePrice && cls.price > cls.salePrice && (
            <span className="pc3-price-old">{formatPrice(cls.price)}</span>
          )}
          <span className="pc3-students">{formatStudentCount(cls.students)} học viên</span>
        </div>
        <Button 
          variant="main" 
          onClick={handleBuyClick} 
          style={{ width: '100%', fontSize: '18px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', borderRadius: '50px' }}
        >
          <i className="fa fa-shopping-cart"></i>
          {formatPrice(displayPrice)}
        </Button>
      </div>
    </div>
  );
};

export default ProgramCard;
