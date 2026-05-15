import React, { useState } from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <nav className="navigation pagination justify-content-center" role="navigation">
      <div className="nav-links">
        <a 
          className={`prev page-numbers ${currentPage <= 1 ? 'disabled' : ''}`} 
          href="#" 
          onClick={(e) => { 
            e.preventDefault(); 
            if (currentPage > 1) onPageChange(currentPage - 1); 
          }}
          style={currentPage <= 1 ? { opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' } : {}}
        >
          <i className="fa fa-angle-left"></i>
        </a>
        {getPageNumbers().map(page => (
          page === currentPage ? (
            <span key={page} className="page-numbers current">
              {page}
            </span>
          ) : (
            <a key={page} className="page-numbers" href="#" onClick={(e) => { e.preventDefault(); onPageChange(page); }}>
              {page}
            </a>
          )
        ))}

        <a 
          className={`next page-numbers ${currentPage >= totalPages ? 'disabled' : ''}`} 
          href="#" 
          onClick={(e) => { 
            e.preventDefault(); 
            if (currentPage < totalPages) onPageChange(currentPage + 1); 
          }}
          style={currentPage >= totalPages ? { opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' } : {}}
        >
          <i className="fa fa-angle-right"></i>
        </a>
      </div>
    </nav>
  );
};

export default Pagination;
