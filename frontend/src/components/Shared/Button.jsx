import React from 'react';
import { Link } from 'react-router-dom';

const Button = ({ 
  to, 
  href, 
  onClick, 
  variant = 'main', 
  className = '', 
  children, 
  ...props 
}) => {
  // Map variant to existing template classes
  const getVariantClass = () => {
    switch (variant) {
      case 'outline':
        return 'btn-light';
      case 'main2':
        return 'btn-maincolor2';
      case 'main':
      default:
        return 'btn-maincolor';
    }
  };

  const btnClass = `btn ${getVariantClass()} ${className}`.trim();

  if (to) {
    return (
      <Link to={to} className={btnClass} {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={btnClass} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={btnClass} {...props}>
      {children}
    </button>
  );
};

export default Button;
