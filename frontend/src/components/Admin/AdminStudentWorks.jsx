import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { 
  getAllStudentWorks, approveStudentWork, rejectStudentWork, deleteStudentWork,
  createStudentWork, updateStudentWork, getPrograms 
} from '../../services/api';
import AdminLoadingBlock from './AdminLoadingBlock';
import { imageUrl } from '../../utils/imageUrl';
import AdminTable from './AdminTable';
import AdminActionBtn from './Shared/AdminActionBtn';
import AdminButton from './Shared/AdminButton';
import AdminConfirmModal from './AdminConfirmModal';
import AdminModal from './AdminModal';
import AdminImageUpload from './AdminImageUpload';

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
  const [programs, setPrograms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState({ id: null, studentName: '', imageUrl: '', description: '', programId: '', status: 'APPROVED' });
  const [isSaving, setIsSaving] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);

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

  useEffect(() => {
    getPrograms().then(res => {
      setPrograms(res.data || res || []);
    }).catch(console.error);
  }, []);

  const openModal = (work = null) => {
    if (work) {
      setEditData({ ...work });
    } else {
      setEditData({ id: null, studentName: '', imageUrl: '', description: '', programId: programs[0]?.id || '', status: 'APPROVED' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editData.studentName || !editData.imageUrl || !editData.programId) {
      toast.error('Vui lòng điền đủ thông tin bắt buộc');
      return;
    }
    setIsSaving(true);
    try {
      if (editData.id) {
        await updateStudentWork(editData.id, editData);
        toast.success('Cập nhật thành công');
      } else {
        await createStudentWork(editData);
        toast.success('Thêm mới thành công');
      }
      setIsModalOpen(false);
      fetchWorks();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi khi lưu bài nộp');
    } finally {
      setIsSaving(false);
    }
  };

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
  const columns = [
    { label: 'Hình ảnh', render: work => (
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
    )},
    { label: 'Học viên', render: work => <span style={{ fontWeight: '600' }}>{work.studentName}</span> },
    { label: 'Khóa học', render: work => <span style={{ color: '#555' }}>{work.program?.title}</span> },
    { label: 'Mô tả', render: work => (
      <div 
        style={{ cursor: 'pointer', maxWidth: '250px' }} 
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
      </div>
    )},
    { label: 'Ngày nộp', render: work => <small style={{ color: '#88929e' }}>{new Date(work.createdAt).toLocaleDateString('vi-VN')}</small> },
    { label: 'Trạng thái', render: work => (
      <span className={`badge ${statusBadge(work.status).className}`} style={{ fontSize: '11px' }}>
        {statusBadge(work.status).label}
      </span>
    )}
  ];

  const customActions = (work) => (
    <>
      <AdminActionBtn variant="edit" onClick={() => openModal(work)} title="Sửa" />
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
    </>
  );

  const filterTabs = (
    <div className="d-flex" style={{ gap: '8px', flexWrap: 'wrap' }}>
      {Object.entries(counts).map(([key, count]) => (
        <AdminButton
          key={key}
          variant={filter === key ? 'dark' : 'secondary'}
          outline={filter !== key}
          size="sm"
          onClick={() => { setFilter(key); setPage(1); }}
          style={{ borderRadius: '20px', padding: '6px 16px' }}
          label={`${key === 'ALL' ? 'Tất cả' : statusBadge(key).label} (${count})`}
        />
      ))}
    </div>
  );


  if (loading) return <AdminLoadingBlock rows={4} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div className="admin-content-header d-flex justify-content-between align-items-center">
        <div>
          <h2>Sản Phẩm Học Viên</h2>
          <p style={{ color: '#88929e' }}>Duyệt và quản lý bài nộp từ học viên</p>
        </div>
        <AdminButton variant="primary" onClick={() => openModal()} label="Thêm sản phẩm" icon="fa-plus" />
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

      <AdminTable 
        title="Quản Lý Bài Nộp Học Viên"
        columns={columns}
        data={works}
        loading={loading}
        filters={filterTabs}
        customActions={customActions}
        serverSidePagination={true}
        totalItems={counts[filter] || 0}
        totalPages={totalPages}
        currentPage={page}
        onPageChange={(p) => setPage(p)}
        onCreate={() => openModal()}
      />

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

      {/* Create/Edit Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editData.id ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
        size="lg"
      >
        <form onSubmit={handleSave}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="small text-muted mb-1">Tên học viên <span className="text-danger">*</span></label>
              <input 
                type="text" 
                className="admin-form-control w-100" 
                value={editData.studentName} 
                onChange={e => setEditData({...editData, studentName: e.target.value})} 
                required 
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="small text-muted mb-1">Khóa học <span className="text-danger">*</span></label>
              <select 
                className="admin-form-control w-100" 
                value={editData.programId} 
                onChange={e => setEditData({...editData, programId: e.target.value})}
                required
              >
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mb-3">
            <AdminImageUpload 
              label={<span>Hình ảnh <span className="text-danger">*</span></span>}
              value={editData.imageUrl}
              onChange={(url) => setEditData({...editData, imageUrl: url})}
              name="imageUrl"
            />
          </div>

          <div className="mb-3">
            <label className="small text-muted mb-1">Mô tả / Đánh giá <span className="text-danger">*</span></label>
            <textarea 
              className="admin-form-control w-100" 
              rows="4" 
              value={editData.description} 
              onChange={e => setEditData({...editData, description: e.target.value})}
              required
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="small text-muted mb-1">Trạng thái</label>
            <select 
              className="admin-form-control w-100" 
              value={editData.status} 
              onChange={e => setEditData({...editData, status: e.target.value})}
            >
              <option value="APPROVED">Đã duyệt (Hiển thị)</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="REJECTED">Từ chối (Ẩn)</option>
            </select>
          </div>

          <div className="d-flex justify-content-end" style={{ gap: '10px' }}>
            <AdminButton variant="secondary" outline onClick={() => setIsModalOpen(false)} label="Hủy" type="button" />
            <AdminButton variant="primary" type="submit" loading={isSaving} label="Lưu Sản Phẩm" icon="fa-save" />
          </div>
        </form>
      </AdminModal>

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
