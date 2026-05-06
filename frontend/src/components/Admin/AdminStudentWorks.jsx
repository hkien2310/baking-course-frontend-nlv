import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getAllStudentWorks, approveStudentWork, rejectStudentWork, deleteStudentWork } from '../../services/api';
import AdminLoadingBlock from './AdminLoadingBlock';
import Pagination from '../Shared/Pagination';
import { imageUrl } from '../../utils/imageUrl';
import AdminActionBtn from './Shared/AdminActionBtn';
import AdminButton from './Shared/AdminButton';
import AdminConfirmModal from './AdminConfirmModal';

const AdminStudentWorks = () => {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [counts, setCounts] = useState({ ALL: 0, PENDING: 0, APPROVED: 0, REJECTED: 0 });
  const [previewWork, setPreviewWork] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchWorks = async () => {
    try {
      const res = await getAllStudentWorks(page, 10, filter);
      const worksData = res.data || res || [];
      setWorks(Array.isArray(worksData) ? worksData : []);
      setTotalPages(res.totalPages || 1);
      if (res.counts) setCounts(res.counts);
    } catch (err) {
      toast.error('Lỗi khi tải danh sách bài nộp');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWorks(); }, [page, filter]);

  const handleApprove = async (id) => {
    try {
      await approveStudentWork(id);
      toast.success('Đã duyệt bài nộp!');
      fetchWorks();
    } catch { toast.error('Lỗi khi duyệt'); }
  };

  const handleReject = async (id) => {
    try {
      await rejectStudentWork(id);
      toast.info('Đã từ chối bài nộp.');
      fetchWorks();
    } catch { toast.error('Lỗi khi từ chối'); }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await deleteStudentWork(deleteTargetId);
      toast.info('Đã xóa bài nộp.');
      setDeleteTargetId(null);
      fetchWorks();
    } catch { 
      toast.error('Lỗi khi xóa'); 
    } finally {
      setIsDeleting(false);
    }
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'APPROVED': return { className: 'bg-success text-white', label: 'Đã duyệt' };
      case 'REJECTED': return { className: 'bg-danger text-white', label: 'Từ chối' };
      default: return { className: 'bg-warning text-dark', label: 'Chờ duyệt' };
    }
  };

  if (loading) return <AdminLoadingBlock rows={4} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div className="admin-content-header">
        <h2>Sản Phẩm Học Viên</h2>
        <p style={{ color: '#88929e' }}>Duyệt và quản lý bài nộp từ học viên</p>
      </div>

      {/* Filter Tabs */}
      <div className="d-flex mb-4" style={{ gap: '8px', flexWrap: 'wrap' }}>
        {Object.entries(counts).map(([key, count]) => (
          <button
            key={key}
            className={`btn btn-sm ${filter === key ? 'btn-dark' : 'btn-outline-secondary'}`}
            onClick={() => { setFilter(key); setPage(1); }}
            style={{ borderRadius: '20px', padding: '6px 16px' }}
          >
            {key === 'ALL' ? 'Tất cả' : statusBadge(key).label} ({count})
          </button>
        ))}
      </div>

      {works.length === 0 ? (
        <div className="admin-paper text-center py-5">
          <i className="fa fa-image" style={{ fontSize: '48px', color: '#ddd' }}></i>
          <p className="mt-2" style={{ color: '#88929e' }}>Chưa có bài nộp nào</p>
        </div>
      ) : (
        <div className="admin-paper">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '100px' }}>Hình ảnh</th>
                  <th>Học viên</th>
                  <th>Khóa học</th>
                  <th style={{ width: '25%' }}>Mô tả</th>
                  <th>Ngày nộp</th>
                  <th>Trạng thái</th>
                  <th className="text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {works.map(work => {
                  const badge = statusBadge(work.status);
                  
                  return (
                    <tr key={work.id}>
                      <td>
                        <div 
                          style={{ 
                            width: '80px', 
                            height: '60px', 
                            borderRadius: '6px', 
                            overflow: 'hidden',
                            backgroundColor: '#f8f9fa',
                            cursor: 'pointer'
                          }}
                          onClick={() => setPreviewWork(work)}
                          title="Nhấn để xem chi tiết"
                        >
                          <img 
                            src={imageUrl(work.imageUrl)} 
                            alt={work.studentName} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        </div>
                      </td>
                      <td style={{ fontWeight: '600' }}>{work.studentName}</td>
                      <td style={{ color: '#555' }}>{work.program?.title}</td>
                      <td 
                        style={{ cursor: 'pointer' }} 
                        onClick={() => setPreviewWork(work)}
                        title="Nhấn để xem toàn bộ nội dung"
                      >
                        <p style={{ 
                          margin: 0, 
                          fontSize: '13px', 
                          color: '#666',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {work.description}
                        </p>
                      </td>
                      <td>
                        <small style={{ color: '#88929e' }}>
                          {new Date(work.createdAt).toLocaleDateString('vi-VN')}
                        </small>
                      </td>
                      <td>
                        <span className={`badge ${badge.className}`} style={{ fontSize: '11px' }}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="d-flex justify-content-end" style={{ gap: '6px' }}>
                          {work.status === 'PENDING' && (
                            <>
                              <AdminActionBtn variant="approve" onClick={() => handleApprove(work.id)} title="Duyệt" />
                              <AdminActionBtn variant="reject" onClick={() => handleReject(work.id)} title="Từ chối" />
                            </>
                          )}
                          {work.status === 'REJECTED' && (
                            <AdminActionBtn variant="approve" onClick={() => handleApprove(work.id)} title="Duyệt lại" />
                          )}
                          {work.status === 'APPROVED' && (
                            <AdminActionBtn variant="hide" onClick={() => handleReject(work.id)} title="Ẩn" />
                          )}
                          <AdminActionBtn variant="delete" onClick={() => setDeleteTargetId(work.id)} title="Xóa" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="admin-pagination-wrapper pt-4 pb-2" style={{ borderTop: '1px solid var(--admin-border-subtle)' }}>
              <Pagination 
                currentPage={page} 
                totalPages={totalPages} 
                onPageChange={(p) => setPage(p)} 
              />
            </div>
          )}
        </div>
      )}

      {/* Detail & Image Preview Modal */}
      {previewWork && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
            backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}
          onClick={() => setPreviewWork(null)}
        >
          <div 
            style={{ 
              position: 'relative', 
              maxWidth: '900px', 
              width: '90%', 
              maxHeight: '90vh', 
              display: 'flex', 
              flexDirection: 'column',
              backgroundColor: '#fff',
              borderRadius: '8px',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              style={{
                position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', 
                color: '#333', fontSize: '24px', cursor: 'pointer', zIndex: 10
              }}
              onClick={() => setPreviewWork(null)}
            >
              &times;
            </button>
            <div style={{ display: 'flex', flexWrap: 'wrap', height: '100%', maxHeight: '90vh' }}>
              {/* Image Side */}
              <div style={{ flex: '1 1 50%', minWidth: '300px', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img 
                  src={imageUrl(previewWork.imageUrl)} 
                  alt="Preview" 
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                />
              </div>
              {/* Content Side */}
              <div style={{ flex: '1 1 50%', padding: '30px', minWidth: '300px', overflowY: 'auto' }}>
                <h4 style={{ marginBottom: '5px' }}>{previewWork.studentName}</h4>
                <p style={{ color: '#88929e', fontSize: '14px', marginBottom: '20px' }}>
                  <i className="fa fa-book mr-2"></i>{previewWork.program?.title}
                </p>
                <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px', fontSize: '15px', lineHeight: '1.6', color: '#444' }}>
                  {previewWork.description}
                </div>
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                  {previewWork.status === 'PENDING' && (
                    <>
                      <AdminButton variant="primary" size="sm" onClick={() => { handleApprove(previewWork.id); setPreviewWork(null); }} label="Duyệt bài" />
                      <AdminButton variant="danger" outline size="sm" onClick={() => { handleReject(previewWork.id); setPreviewWork(null); }} label="Từ chối" />
                    </>
                  )}
                  {previewWork.status === 'REJECTED' && (
                    <AdminButton variant="success" size="sm" onClick={() => { handleApprove(previewWork.id); setPreviewWork(null); }} label="Duyệt lại" />
                  )}
                  {previewWork.status === 'APPROVED' && (
                    <AdminButton variant="warning" size="sm" onClick={() => { handleReject(previewWork.id); setPreviewWork(null); }} label="Ẩn bài" style={{ color: '#fff' }} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <AdminConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Xóa bài nộp"
        message="Bạn có chắc chắn muốn xóa bài nộp này không? Hành động này không thể hoàn tác."
        loading={isDeleting}
      />
    </div>
  );
};

export default AdminStudentWorks;
