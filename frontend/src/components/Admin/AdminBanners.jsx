import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AdminHeader from './Shared/AdminHeader';
import AdminButton from './Shared/AdminButton';
import AdminLoadingBlock from './AdminLoadingBlock';
import AdminModal from './AdminModal';
import AdminActionBtn from './Shared/AdminActionBtn';
import AdminConfirmModal from './AdminConfirmModal';
import AdminImageUpload from './AdminImageUpload';
import { getBanners, createBanner, updateBanner, deleteBanner, getPrograms, reorderBanners, uploadImage } from '../../services/api';
import usePendingAction from './usePendingAction';

// Helper to format date as yyyy-MM-dd
const formatDateToInput = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toISOString().split('T')[0];
};

// Helper to format date as dd/MM/yyyy
const formatDateToDisplay = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN');
};

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [discountPrograms, setDiscountPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    imageUrl: '',
    countdownDate: '',
    targetUrl: '',
    isActive: true
  });
  
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const { isPending, hasPending, withPending } = usePendingAction();
  const dragItem = React.useRef(null);
  const dragOverItem = React.useRef(null);
  const [draggedIdx, setDraggedIdx] = useState(null);

  const handleDragStart = (position) => {
    dragItem.current = position;
    setDraggedIdx(position);
  };

  const handleDragOver = (e, position) => {
    e.preventDefault();
    dragOverItem.current = position;
  };

  const handleDrop = async () => {
    setDraggedIdx(null);
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const newBanners = [...banners];
      const item = newBanners.splice(dragItem.current, 1)[0];
      newBanners.splice(dragOverItem.current, 0, item);
      
      setBanners(newBanners);

      const payload = newBanners.map((b, idx) => ({ id: b.id, sortOrder: idx }));
      try {
        await reorderBanners(payload);
        toast.success('Đã cập nhật thứ tự banner!');
      } catch (err) {
        toast.error('Lỗi khi cập nhật vị trí');
        fetchData();
      }
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bannersRes, programsRes] = await Promise.all([
        getBanners(),
        getPrograms({ hasDiscount: true })
      ]);
      setBanners(bannersRes || []);
      setDiscountPrograms(programsRes.data || programsRes || []);
    } catch (err) {
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProgramSelect = (e) => {
    const progId = e.target.value;
    if (!progId) return;
    
    const prog = discountPrograms.find(p => p.id === progId);
    if (prog) {
      setFormData(prev => ({
        ...prev,
        title: prog.title,
        imageUrl: prog.thumbnail || '',
        countdownDate: formatDateToInput(prog.saleEndDate),
        targetUrl: `/program/${prog.slug}`
      }));
    }
  };

  const resetForm = () => {
    setFormData({ id: null, title: '', imageUrl: '', countdownDate: '', targetUrl: '', isActive: true });
    setIsEditing(false);
    setIsModalOpen(false);
    setIsUploadingImage(false);
  };

  const handleEdit = (banner) => {
    setFormData({
      id: banner.id,
      title: banner.title,
      imageUrl: banner.imageUrl,
      countdownDate: formatDateToInput(banner.countdownDate),
      targetUrl: banner.targetUrl || '',
      isActive: banner.isActive
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await withPending(`delete-${id}`, async () => {
        await deleteBanner(id);
        toast.success('Xóa banner thành công!');
        fetchData();
      });
    } catch (err) {
      toast.error('Lỗi khi xóa banner');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl) {
      toast.error('Vui lòng nhập tên banner và hình ảnh');
      return;
    }
    
    try {
      await withPending('submit-banner', async () => {
        if (isEditing) {
          await updateBanner(formData.id, formData);
          toast.success('Cập nhật banner thành công!');
        } else {
          await createBanner(formData);
          toast.success('Thêm banner mới thành công!');
        }
        resetForm();
        fetchData();
      });
    } catch (err) {
      toast.error('Lỗi khi lưu banner');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <AdminHeader 
        title="Quản lý Banner" 
        description="Quản lý banner hiển thị ở đầu trang chủ. Kéo thả biểu tượng ☰ để sắp xếp." 
        action={<AdminButton variant="primary" icon="plus" label="Thêm Mới" onClick={() => setIsModalOpen(true)} />} 
      />

      <div className="admin-paper fade-in" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {loading ? (
          <AdminLoadingBlock compact />
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th>Ảnh</th>
                  <th>Tiêu đề Banner</th>
                  <th>Link đến</th>
                  <th>Ngày hết hạn</th>
                  <th>Trạng thái</th>
                  <th width="150" className="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {banners.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4" style={{color: '#888'}}>
                      <i>Chưa có dữ liệu banner.</i>
                    </td>
                  </tr>
                ) : (
                  banners.map((row, idx) => (
                    <tr 
                      key={row.id}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDrop={handleDrop}
                      onDragEnd={() => setDraggedIdx(null)}
                      style={{ 
                        cursor: 'grab', 
                        opacity: draggedIdx === idx ? 0.5 : 1,
                        backgroundColor: draggedIdx === idx ? '#f8f9fa' : 'transparent'
                      }}
                    >
                      <td className="text-center text-muted">
                        <i className="fa fa-bars" style={{ cursor: 'grab' }}></i>
                      </td>
                      <td>
                        <img src={row.imageUrl} alt={row.title} width="80" style={{borderRadius: '4px', objectFit: 'cover', height: '45px'}}/>
                      </td>
                      <td><strong>{row.title}</strong></td>
                      <td>{row.targetUrl || '—'}</td>
                      <td>
                        {formatDateToDisplay(row.countdownDate)}
                      </td>
                      <td>
                        <span className={`badge ${row.isActive ? 'badge-success' : 'badge-secondary'}`}>
                          {row.isActive ? 'Hiển thị' : 'Đang ẩn'}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center" style={{ gap: '4px' }}>
                          <AdminActionBtn 
                            variant="edit" 
                            onClick={() => handleEdit(row)} 
                            title="Sửa" 
                            disabled={isPending(`delete-${row.id}`)} 
                          />
                          <AdminActionBtn 
                            variant="delete" 
                            onClick={() => setDeleteTarget(row)} 
                            title="Xóa" 
                            disabled={isPending(`delete-${row.id}`)}
                            loading={isPending(`delete-${row.id}`)} 
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          handleDelete(deleteTarget.id);
          setDeleteTarget(null);
        }}
        title="Xóa banner"
        message="Bạn có chắc chắn muốn xóa banner này không? Hành động này không thể hoàn tác."
      />

      <AdminModal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={isEditing ? 'Sửa Banner' : 'Thêm Banner Mới'}
      >
        <form onSubmit={handleSubmit}>
          {!isEditing && (
            <div className="form-group mb-4 p-3 bg-light rounded" style={{ border: '1px solid #e2e8f0' }}>
              <label className="font-weight-bold mb-2 text-primary">
                <i className="fa fa-magic mr-1"></i> Tự động điền từ Khóa học khuyến mãi
              </label>
              <select className="admin-form-control" onChange={handleProgramSelect} defaultValue="">
                <option value="" disabled>-- Chọn khóa học --</option>
                {discountPrograms.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
              <small className="text-muted mt-1 d-block">
                Chọn một khóa học để tự động lấy tên, ảnh và ngày đếm ngược. Sau đó bạn có thể sửa lại theo ý muốn.
              </small>
            </div>
          )}

          <div className="form-group mb-3">
            <label className="font-weight-bold mb-2">Tiêu đề Banner <span className="text-danger">*</span></label>
            <input 
              type="text" 
              className="admin-form-control" 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              required
            />
          </div>

          <div className="form-group mb-3">
            <AdminImageUpload 
              label={<span>Hình ảnh Banner <span className="text-danger">*</span></span>}
              name="imageUrl"
              value={formData.imageUrl}
              onChange={(url) => setFormData({...formData, imageUrl: url})}
            />
          </div>

          <div className="form-group mb-3">
            <label className="font-weight-bold mb-2">Đường dẫn khi click (Target URL)</label>
            <input 
              type="text" 
              className="admin-form-control" 
              value={formData.targetUrl} 
              onChange={(e) => setFormData({...formData, targetUrl: e.target.value})} 
              placeholder="/program/slug-khoa-hoc"
            />
          </div>

          <div className="form-group mb-4">
            <label className="font-weight-bold mb-2">Ngày kết thúc Countdown</label>
            <input 
              type="date" 
              className="admin-form-control" 
              value={formData.countdownDate} 
              onChange={(e) => setFormData({...formData, countdownDate: e.target.value})} 
            />
          </div>
          
          <div className="form-group mb-4 p-3 bg-light rounded d-flex justify-content-between align-items-center">
            <div>
              <h6 className="m-0 font-weight-bold">Trạng thái hiển thị</h6>
              <small className="text-muted">Cho phép hiển thị banner ở trang chủ</small>
            </div>
            <label className="switch m-0" style={{position: 'relative', display: 'inline-block', width: '44px', height: '24px'}}>
              <input 
                type="checkbox" 
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                style={{opacity: 0, width: 0, height: 0}}
              />
              <span className="slider round" style={{
                position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: formData.isActive ? 'var(--admin-primary)' : '#ccc', transition: '.4s', borderRadius: '24px'
              }}>
                <span style={{
                  position: 'absolute', height: '18px', width: '18px', left: formData.isActive ? '23px' : '3px',
                  bottom: '3px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
                }}></span>
              </span>
            </label>
          </div>

          <div className="d-flex justify-content-end border-top pt-3 mt-3">
            <AdminButton variant="secondary" onClick={resetForm} disabled={hasPending} label="Hủy bỏ" />
            <AdminButton 
              type="submit" 
              className="admin-btn-save ml-2" 
              disabled={isPending('submit-banner')}
              loading={isPending('submit-banner')}
              label={isEditing ? 'Lưu Cập Nhật' : 'Tạo Mới'}
            />
          </div>
        </form>
      </AdminModal>
    </div>
  );
};

export default AdminBanners;
