import { useInitOnLoaded } from '../hooks/useInitOnLoaded';
import React, { useState, useEffect } from 'react';
import PageTitle from '../components/Shared/PageTitle';
import ProgramCard from '../components/Shared/ProgramCard';
import Pagination from '../components/Shared/Pagination';
import { useSearchParams } from 'react-router-dom';
import { getPrograms, getCategories } from '../services/api';
import { useTranslation } from '../i18n/LanguageContext';
import Input from '../components/Shared/Input';
import { formatPrice } from '../utils/formatters';
import './Program.css';
import PageLoading from '../components/Shared/PageLoading';

const ITEMS_PER_PAGE = 6;

const Program = () => {
  const { t } = useTranslation();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const chiefId = searchParams.get('chiefId') || '';
  const searchKeyword = searchParams.get('search') || '';
  const categoryStr = searchParams.get('category') || '';
  const categories = categoryStr ? categoryStr.split(',') : [];
  const sortBy = searchParams.get('sortBy') || 'newest';
  const currentPage = parseInt(searchParams.get('page') || '1');
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';

  const [localSearch, setLocalSearch] = useState(searchKeyword);
  const [localMinPrice, setLocalMinPrice] = useState(minPriceParam);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPriceParam || '10000000');
  const [localCategories, setLocalCategories] = useState(categories);
  const [categoryOptions, setCategoryOptions] = useState([]);

  useEffect(() => {
    getCategories({ type: 'PROGRAM' })
      .then(res => {
        const cats = res?.data || res || [];
        setCategoryOptions(cats.filter(c => c.isActive).map(c => ({ name: c.name, slug: c.slug })));
      })
      .catch(() => console.error('Failed to load categories'));
  }, []);

  // Sync URL params to local state (needed if user clicks header menu while already on /program)
  useEffect(() => {
    setLocalSearch(searchParams.get('search') || '');
    setLocalMinPrice(searchParams.get('minPrice') || '');
    setLocalMaxPrice(searchParams.get('maxPrice') || '10000000');
    
    const catParam = searchParams.get('category') || '';
    setLocalCategories(catParam ? catParam.split(',') : []);
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    const filter = { page: currentPage, limit: ITEMS_PER_PAGE };
    if (chiefId) filter.chiefId = chiefId;
    if (searchKeyword) filter.search = searchKeyword;
    if (categoryStr) filter.category = categoryStr;
    if (sortBy) filter.sortBy = sortBy;
    
    // Only add price filters if they are not the default boundaries
    if (minPriceParam && minPriceParam !== '0') filter.minPrice = minPriceParam;
    if (maxPriceParam && maxPriceParam !== '10000000') filter.maxPrice = maxPriceParam;

    getPrograms(filter)
      .then(response => {
        setPrograms(response.data || []);
        setTotalPages(response.totalPages || 1);
        setTotalItems(response.totalItems || 0);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch programs", err);
        setLoading(false);
      });
  }, [currentPage, chiefId, searchKeyword, categoryStr, sortBy, minPriceParam, maxPriceParam]);

  useInitOnLoaded(loading);

  const applyFilters = () => {
    const newParams = new URLSearchParams(searchParams);
    
    if (localSearch) newParams.set('search', localSearch);
    else newParams.delete('search');

    if (localMinPrice && localMinPrice !== '0') newParams.set('minPrice', localMinPrice);
    else newParams.delete('minPrice');

    if (localMaxPrice && localMaxPrice !== '10000000') newParams.set('maxPrice', localMaxPrice);
    else newParams.delete('maxPrice');

    if (localCategories.length > 0) newParams.set('category', localCategories.join(','));
    else newParams.delete('category');

    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const toggleCategory = (cat) => {
    if (localCategories.includes(cat)) {
      setLocalCategories(localCategories.filter(c => c !== cat));
    } else {
      setLocalCategories([...localCategories, cat]);
    }
  };

  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page);
    setSearchParams(newParams);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <PageTitle 
        title={t('program.title') || 'Tham Khảo Khóa Học'} 
        breadcrumbs={[{ label: t('header.home'), link: '/' }, { label: t('header.programs') || 'Khóa Học' }]} 
      />

			<section className="ls s-pt-90 s-pb-40 s-py-lg-100 c-gutter-30 c-mb-50 c-mb-md-30 program program-page overflow-visible">
				<div className="container">
					<div className="row">
            
            {/* SIDEBAR FILTER */}
            <aside className="col-lg-3 order-lg-1">
              <div className="sidebar-filter">
                {/* Search Widget */}
                <div className="widget widget_search">
                  <h3 className="widget-title">Tìm kiếm</h3>
                  <div className="d-flex position-relative">
                    <Input 
                      placeholder="Tên khóa học..." 
                      value={localSearch} 
                      onChange={e => setLocalSearch(e.target.value)} 
                      style={{ borderRadius: '50px', background: '#f8f9fa', border: '1px solid #eee' }}
                      wrapperClassName="w-100"
                      icon="search"
                      onIconClick={applyFilters}
                      onKeyDown={(e) => { if (e.key === 'Enter') applyFilters(); }}
                    />
                  </div>
                </div>
                
                {/* Categories Widget */}
                <div className="widget widget_categories">
                  <h3 className="widget-title">Danh mục</h3>
                  <div className="category-list">
                    {categoryOptions.map(cat => (
                      <div key={cat.slug} className="custom-checkbox">
                        <input type="checkbox" id={`cat-${cat.slug}`} 
                               checked={localCategories.includes(cat.slug)} onChange={() => toggleCategory(cat.slug)} />
                        <label htmlFor={`cat-${cat.slug}`}>{cat.name}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range Widget */}
                <div className="widget widget_categories">
                  <h3 className="widget-title">Khoảng giá tối đa</h3>
                  <div className="mb-3">
                    <input 
                      type="range" 
                      className="w-100" 
                      min="0" 
                      max="10000000" 
                      step="100000"
                      value={localMaxPrice || 10000000} 
                      onChange={e => {
                        setLocalMaxPrice(e.target.value);
                        setLocalMinPrice('0'); // implicitly set min to 0
                      }} 
                    />
                    <div className="d-flex justify-content-between mt-2">
                      <span className="small-text text-muted">0đ</span>
                      <span className="font-weight-bold color-main">
                        {localMaxPrice === '10000000' || !localMaxPrice ? '(Không giới hạn)' : formatPrice(localMaxPrice)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button className="btn-apply-filter mt-3" onClick={applyFilters}>
                  Áp dụng bộ lọc
                </button>
              </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="col-lg-9 order-lg-2">
              {loading ? (
                <PageLoading compact />
              ) : (
                <>
                  <div className="row">
                    {programs.length === 0 && (
                      <div className="col-12 text-center" style={{ padding: '50px 0' }}>
                        <h4>{t('program.notFound') || 'Không tìm thấy khóa học nào khớp với bộ lọc.'}</h4>
                        <button className="btn btn-maincolor mt-3" style={{ borderRadius: '50px' }} 
                                onClick={() => { 
                                  setLocalSearch(''); 
                                  setLocalMinPrice(''); 
                                  setLocalMaxPrice(''); 
                                  setSearchParams({}); 
                                }}>
                          Xóa tất cả bộ lọc
                        </button>
                      </div>
                    )}

                    {programs.map((cls) => (
                      <div key={cls.id} className="col-md-6 mb-4">
                        <ProgramCard cls={cls} />
                      </div>
                    ))}
                  </div>

                  {totalPages > 0 && (
                    <div className="mt-4">
                      <Pagination 
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                        onPageChange={handlePageChange} 
                      />
                    </div>
                  )}
                </>
              )}
            </main>

					</div>
				</div>
			</section>
    </>
  );
};

export default Program;
