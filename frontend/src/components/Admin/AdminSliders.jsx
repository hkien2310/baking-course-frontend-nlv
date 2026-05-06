import React, { useState, useEffect } from 'react';
import { getPrograms, toggleProgramFeature } from '../../services/api';
import { toast } from 'react-toastify';
import AdminLoadingBlock from './AdminLoadingBlock';
import usePendingAction from './usePendingAction';

const AdminSliders = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isPending, withPending } = usePendingAction();

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getPrograms({ page: 1, limit: 100 });
      setPrograms(data.data || []);
    } catch (err) {
      toast.error('Không thể tải danh sách khóa học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleToggle = async (id, currentStatus) => {
    try {
      await withPending(`toggle-${id}`, async () => {
        await toggleProgramFeature(id, !currentStatus);
        toast.success(currentStatus ? 'Đã gỡ khỏi Slider' : 'Đã thêm vào Slider');
        await fetchData();
      });
    } catch (err) {
      toast.error('Thao tác thất bại');
    }
  };

  const featuredPrograms = programs.filter(p => p.isFeatured);
  const unfeaturedPrograms = programs.filter(p => !p.isFeatured);
  const limitReached = featuredPrograms.length >= 3;

  return (
    <div className="admin-paper fade-in" style={{ overflow: 'auto' }}>
      <div className="admin-paper-header">
        <div>
          <h4>Hero Slider</h4>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Chọn khóa học hiển thị trên slider trang chủ (tối đa 3).
          </p>
        </div>
        <a href="#programs" className="btn btn-outline-secondary btn-sm">
          <i className="fa fa-book mr-2"></i> Quản lý khóa học
        </a>
      </div>

      <div style={{ padding: '20px 30px' }}>
        {/* FEATURED SECTION */}
        <h5 style={{ marginBottom: '16px' }}>
          <i className="fa fa-star" style={{ color: '#f59e0b', marginRight: '8px' }}></i>
          Đang hiển thị ({featuredPrograms.length}/3)
        </h5>

        {featuredPrograms.length === 0 && (
          <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Chưa có khóa học nào được chọn.</p>
        )}

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '30px' }}>
          {featuredPrograms.map(prog => (
            <div key={prog.id} style={{
              flex: '1 1 calc(33.333% - 12px)',
              minWidth: '220px',
              maxWidth: '350px',
              border: '2px solid #5fa88a',
              borderRadius: '10px',
              overflow: 'hidden',
              background: '#fff',
            }}>
              <img
                src={prog.thumbnail || `${import.meta.env.BASE_URL}images/gallery/01.jpg`}
                alt={prog.title}
                style={{ width: '100%', height: '160px', objectFit: 'cover' }}
              />
              <div style={{ padding: '14px' }}>
                <h6 style={{ margin: '0 0 4px', fontSize: '15px' }}>{prog.title}</h6>
                <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#94a3b8' }}>
                  {prog.authorName || 'Chưa có giảng viên'}
                </p>
                <button
                  className="btn btn-danger btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => handleToggle(prog.id, true)}
                  disabled={isPending(`toggle-${prog.id}`)}
                >
                  {isPending(`toggle-${prog.id}`) ? 'Đang xử lý...' : 'Gỡ khỏi Slider'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* AVAILABLE SECTION — compact table */}
        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0 0 20px' }} />
        <h5 style={{ marginBottom: '16px' }}>
          <i className="fa fa-list" style={{ marginRight: '8px' }}></i>
          Khóa học có thể thêm ({unfeaturedPrograms.length})
        </h5>

        {loading && <AdminLoadingBlock compact rows={4} />}

        {!loading && limitReached && (
          <div style={{
            background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '8px',
            padding: '12px 16px', marginBottom: '16px', fontSize: '14px', color: '#92400e'
          }}>
            <i className="fa fa-exclamation-triangle mr-2"></i>
            Đã đạt giới hạn 3 slider. Gỡ bớt để thêm mới.
          </div>
        )}

        {!loading && unfeaturedPrograms.length === 0 && (
          <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Tất cả khóa học đã được chọn.</p>
        )}

        {!loading && unfeaturedPrograms.length > 0 && (
          <div style={{ borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: '12px', letterSpacing: '0.5px' }}>KHÓA HỌC</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, color: '#64748b', fontSize: '12px', width: '140px' }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {unfeaturedPrograms.map(prog => (
                  <tr key={prog.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={prog.thumbnail || `${import.meta.env.BASE_URL}images/gallery/01.jpg`}
                          alt={prog.title}
                          style={{ width: '50px', height: '36px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prog.title}</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>{prog.authorName || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <button
                        className="btn btn-outline-success btn-sm"
                        style={{ fontSize: '12px', padding: '4px 14px' }}
                        onClick={() => handleToggle(prog.id, false)}
                        disabled={limitReached || isPending(`toggle-${prog.id}`)}
                      >
                        {isPending(`toggle-${prog.id}`) ? '...' : '+ Thêm'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSliders;
