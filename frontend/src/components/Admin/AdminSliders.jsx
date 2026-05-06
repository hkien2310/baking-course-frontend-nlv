import React, { useState, useEffect, useCallback } from 'react';
import { getPrograms, toggleProgramFeature } from '../../services/api';
import { toast } from 'react-toastify';
import AdminLoadingBlock from './AdminLoadingBlock';
import Pagination from '../Shared/Pagination';
import usePendingAction from './usePendingAction';

const ITEMS_PER_PAGE = 8;

const AdminSliders = () => {
  const [featuredPrograms, setFeaturedPrograms] = useState([]);
  const [availablePrograms, setAvailablePrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const { isPending, withPending } = usePendingAction();

  // Lấy danh sách featured (không phân trang, luôn lấy hết vì tối đa 3)
  // Lấy featured (server filter isFeatured=true, tối đa 3)
  const fetchFeatured = useCallback(async () => {
    try {
      const data = await getPrograms({ isFeatured: true });
      const all = Array.isArray(data) ? data : (data.data || []);
      setFeaturedPrograms(all);
    } catch (err) {
      // silent
    }
  }, []);

  // Lấy available (server filter isFeatured=false + server-side pagination)
  const fetchAvailable = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const data = await getPrograms({ page, limit: ITEMS_PER_PAGE, isFeatured: false });
      setAvailablePrograms(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalItems || 0);
      setCurrentPage(data.currentPage || page);
    } catch (err) {
      toast.error('Không thể tải danh sách khóa học');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeatured();
    fetchAvailable(1);
  }, [fetchFeatured, fetchAvailable]);

  const handleToggle = async (id, currentStatus) => {
    try {
      await withPending(`toggle-${id}`, async () => {
        await toggleProgramFeature(id, !currentStatus);
        toast.success(currentStatus ? 'Đã gỡ khỏi Slider' : 'Đã thêm vào Slider');
        // Reload cả hai
        await fetchFeatured();
        await fetchAvailable(currentPage);
      });
    } catch (err) {
      toast.error('Thao tác thất bại');
    }
  };

  const handlePageChange = (page) => {
    fetchAvailable(page);
  };

  const limitReached = featuredPrograms.length >= 3;

  return (
    <>
      {/* FEATURED SECTION */}
      <div className="slider-featured-section">
        <div className="slider-section-header">
          <div className="slider-section-title">
            <i className="fa fa-star"></i>
            <span>Đang hiển thị trên Slider</span>
          </div>
          <span className="slider-counter">{featuredPrograms.length} / 3</span>
        </div>

        {featuredPrograms.length === 0 ? (
          <div className="slider-empty-state">
            <i className="fa fa-image"></i>
            <p>Chưa có khóa học nào trên Slider</p>
            <small>Chọn khóa học bên dưới để thêm vào trang chủ</small>
          </div>
        ) : (
          <div className="slider-featured-grid">
            {featuredPrograms.map((prog, idx) => (
              <div key={prog.id} className="slider-featured-card">
                <div className="slider-featured-badge">{idx + 1}</div>
                <div className="slider-featured-img">
                  <img
                    src={prog.thumbnail || `${import.meta.env.BASE_URL}images/gallery/01.jpg`}
                    alt={prog.title}
                  />
                </div>
                <div className="slider-featured-info">
                  <h6>{prog.title}</h6>
                  <span>{prog.authorName || 'Chưa có giảng viên'}</span>
                </div>
                <button
                  className="btn slider-remove-btn"
                  onClick={() => handleToggle(prog.id, true)}
                  disabled={isPending(`toggle-${prog.id}`)}
                  title="Gỡ khỏi Slider"
                >
                  {isPending(`toggle-${prog.id}`)
                    ? <i className="fa fa-spinner fa-spin"></i>
                    : <i className="fa fa-times"></i>
                  }
                </button>
              </div>
            ))}
            {/* Empty slots */}
            {Array.from({ length: 3 - featuredPrograms.length }).map((_, i) => (
              <div key={`empty-${i}`} className="slider-featured-card empty">
                <div className="slider-featured-badge empty">{featuredPrograms.length + i + 1}</div>
                <div className="slider-empty-slot">
                  <i className="fa fa-plus"></i>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AVAILABLE PROGRAMS TABLE */}
      <div className="admin-paper fade-in" style={{ overflow: 'hidden' }}>
        <div className="admin-paper-header">
          <div>
            <h4>Chọn khóa học</h4>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>
              {totalItems} khóa học trong hệ thống
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '20px 30px' }}>
            <AdminLoadingBlock compact rows={4} />
          </div>
        ) : (
          <>
            {limitReached && (
              <div className="slider-limit-banner">
                <i className="fa fa-info-circle"></i>
                Đã đạt giới hạn 3 slider. Gỡ bớt để thêm mới.
              </div>
            )}

            <div style={{ padding: '20px 24px' }}>
              {availablePrograms.length === 0 ? (
                <div className="slider-empty-state">
                  <i className="fa fa-inbox"></i>
                  <p>Không còn khóa học nào</p>
                </div>
              ) : (
                <div className="slider-available-grid">
                  {availablePrograms.map(prog => (
                    <div key={prog.id} className={`slider-available-card ${limitReached ? 'disabled' : ''}`}>
                      <div className="slider-available-img">
                        <img
                          src={prog.thumbnail || `${import.meta.env.BASE_URL}images/gallery/01.jpg`}
                          alt={prog.title}
                        />
                      </div>
                      <div className="slider-available-body">
                        <h6>{prog.title}</h6>
                        <span>{prog.authorName || 'Chưa có giảng viên'}</span>
                        <button
                          className="btn slider-add-btn"
                          onClick={() => handleToggle(prog.id, false)}
                          disabled={limitReached || isPending(`toggle-${prog.id}`)}
                        >
                          {isPending(`toggle-${prog.id}`)
                            ? <i className="fa fa-spinner fa-spin"></i>
                            : <><i className="fa fa-plus"></i> Thêm vào Slider</>
                          }
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="admin-pagination-wrapper" style={{ borderTop: '1px solid var(--admin-border-subtle)', padding: '15px 30px' }}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        /* ── FEATURED SECTION ── */
        .slider-featured-section {
          background: var(--admin-paper-bg, #fff);
          border: 1px solid var(--admin-border-subtle, #ebdcd0);
          border-radius: 10px;
          padding: 24px;
          margin-bottom: 24px;
        }
        .slider-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .slider-section-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 16px;
          font-weight: 700;
          color: var(--admin-heading, #0f172a);
        }
        .slider-section-title i {
          color: #f59e0b;
          font-size: 18px;
        }
        .slider-counter {
          background: #f0fdf4;
          color: #16a34a;
          font-weight: 700;
          font-size: 13px;
          padding: 4px 14px;
          border-radius: 20px;
          border: 1px solid #bbf7d0;
        }

        /* ── FEATURED GRID ── */
        .slider-featured-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .slider-featured-card {
          position: relative;
          border: 2px solid var(--admin-primary, #5fa88a);
          border-radius: 12px;
          overflow: hidden;
          background: #fff;
          transition: box-shadow 0.2s ease;
        }
        .slider-featured-card:hover {
          box-shadow: 0 4px 20px rgba(95, 168, 138, 0.15);
        }
        .slider-featured-card.empty {
          border: 2px dashed var(--admin-border-subtle, #ebdcd0);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 180px;
        }
        .slider-featured-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: var(--admin-primary, #5fa88a);
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }
        .slider-featured-badge.empty {
          background: var(--admin-border-subtle, #ebdcd0);
          color: var(--admin-text-muted, #94a3b8);
        }
        .slider-featured-img img {
          width: 100%;
          height: 140px;
          object-fit: cover;
          display: block;
        }
        .slider-featured-info {
          padding: 12px 14px;
        }
        .slider-featured-info h6 {
          margin: 0 0 4px;
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .slider-featured-info span {
          font-size: 12px;
          color: var(--admin-text-muted, #94a3b8);
        }
        .slider-remove-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.9) !important;
          color: #fff !important;
          border: none !important;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 12px;
          z-index: 2;
          padding: 0 !important;
        }
        .slider-remove-btn:hover {
          background: #dc2626 !important;
          transform: scale(1.1);
        }
        .slider-empty-slot {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          color: var(--admin-text-muted, #94a3b8);
          font-size: 24px;
        }
        .slider-empty-state {
          text-align: center;
          padding: 40px 20px;
          color: var(--admin-text-muted, #94a3b8);
        }
        .slider-empty-state i {
          font-size: 40px;
          margin-bottom: 12px;
          opacity: 0.4;
        }
        .slider-empty-state p {
          margin: 0 0 4px;
          font-weight: 600;
          color: var(--admin-text-base, #334155);
        }
        .slider-empty-state small {
          font-size: 13px;
        }

        /* ── AVAILABLE CARDS GRID ── */
        .slider-available-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .slider-available-card {
          border: 1px solid var(--admin-border-subtle, #ebdcd0);
          border-radius: 10px;
          overflow: hidden;
          background: #fff;
          transition: all 0.2s ease;
        }
        .slider-available-card:hover {
          border-color: var(--admin-primary, #5fa88a);
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
        }
        .slider-available-card.disabled {
          opacity: 0.5;
          pointer-events: none;
        }
        .slider-available-img img {
          width: 100%;
          height: 110px;
          object-fit: cover;
          display: block;
        }
        .slider-available-body {
          padding: 12px;
        }
        .slider-available-body h6 {
          margin: 0 0 4px;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: var(--admin-heading, #0f172a);
        }
        .slider-available-body > span {
          display: block;
          font-size: 12px;
          color: var(--admin-text-muted, #94a3b8);
          margin-bottom: 10px;
        }
        .slider-add-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          width: 100%;
          justify-content: center;
          background: #f0fdf4 !important;
          color: #16a34a !important;
          border: 1px solid #bbf7d0 !important;
          border-radius: 6px !important;
          padding: 6px 12px !important;
          font-size: 12px !important;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .slider-add-btn:hover:not(:disabled) {
          background: #dcfce7 !important;
          border-color: #86efac !important;
        }
        .slider-add-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .slider-limit-banner {
          background: #fffbeb;
          border-bottom: 1px solid #fde68a;
          padding: 10px 30px;
          font-size: 13px;
          color: #92400e;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1200px) {
          .slider-available-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 768px) {
          .slider-featured-grid,
          .slider-available-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 480px) {
          .slider-featured-grid,
          .slider-available-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
};

export default AdminSliders;
