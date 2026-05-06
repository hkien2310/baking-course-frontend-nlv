import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getCategories, createCategory, updateCategory, deleteCategory, reorderCategories } from '../../services/api';
import AdminModal from './AdminModal';
import AdminConfirmModal from './AdminConfirmModal';
import AdminButton from './Shared/AdminButton';
import AdminLoadingBlock from './AdminLoadingBlock';
import AdminActionBtn from './Shared/AdminActionBtn';
import usePendingAction from './usePendingAction';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('PROGRAM');
  const [formData, setFormData] = useState({ id: null, name: '', slug: '', sortOrder: 0, isActive: true });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [draggedIdx, setDraggedIdx] = useState(null);
  const { isPending, withPending, hasPending } = usePendingAction();

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getCategories({ includeInactive: true, type: activeTab });
      const sortedData = data.sort((a, b) => a.sortOrder - b.sortOrder);
      setCategories(sortedData);
    } catch (err) {
      toast.error('Lỗi khi tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  const resetForm = () => {
    setIsEditing(false);
    setFormData({ id: null, name: '', slug: '', isActive: true });
    setIsModalOpen(false);
  };

  const dragItem = React.useRef(null);
  const dragOverItem = React.useRef(null);

  const handleDragStart = (idx) => {
    dragItem.current = idx;
    setDraggedIdx(idx);
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    dragOverItem.current = idx;
  };

  const handleDrop = async () => {
    setDraggedIdx(null);
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const newCats = [...categories];
      const item = newCats.splice(dragItem.current, 1)[0];
      newCats.splice(dragOverItem.current, 0, item);
      
      setCategories(newCats); // Update UI immediately

      const payload = newCats.map((cat, idx) => ({ id: cat.id, sortOrder: idx }));
      try {
        await reorderCategories(payload);
        toast.success('Đã cập nhật thứ tự!');
      } catch (err) {
        toast.error('Lỗi khi cập nhật vị trí');
        fetchData();
      }
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleEdit = (category) => {
    setIsEditing(true);
    setFormData({
      id: category.id,
      name: category.name,
      slug: category.slug || '',
      isActive: category.isActive
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await withPending(`delete-${id}`, async () => {
        await deleteCategory(id);
        toast.success('Xóa danh mục thành công!');
        await fetchData();
        setIsModalOpen(false);
      });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi khi xóa danh mục');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên danh mục');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        isActive: formData.isActive,
        type: activeTab
      };

      await withPending('submit-category', async () => {
        if (isEditing) {
          await updateCategory(formData.id, payload);
          toast.success('Cập nhật danh mục thành công!');
        } else {
          await createCategory(payload);
          toast.success('Thêm danh mục mới thành công!');
        }
        resetForm();
        await fetchData();
      });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi lưu danh mục');
    }
  };
  return (
    <div className="admin-categories-page">
      <div className="admin-tabs">
        <button 
          type="button"
          className={`admin-tab-btn ${activeTab === 'PROGRAM' ? 'active' : ''}`}
          onClick={() => setActiveTab('PROGRAM')}
        >
          <i className="fa fa-graduation-cap mr-2"></i> Danh mục Khóa học
        </button>
        <button 
          type="button"
          className={`admin-tab-btn ${activeTab === 'POST' ? 'active' : ''}`}
          onClick={() => setActiveTab('POST')}
        >
          <i className="fa fa-pencil-square-o mr-2"></i> Danh mục Bài viết
        </button>
      </div>

      <div className="admin-paper fade-in">
        <div className="admin-paper-header">
          <h4>{activeTab === 'PROGRAM' ? "Danh mục Khóa học" : "Danh mục Bài viết"}</h4>
          <AdminButton variant="primary" icon="plus" label="Thêm Mới" onClick={() => setIsModalOpen(true)} />
        </div>

        {loading ? (
          <AdminLoadingBlock compact />
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th>Tên danh mục</th>
                  <th>Đường dẫn (slug)</th>
                  <th>Trạng thái</th>
                  <th width="150" className="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4" style={{color: '#888'}}>
                      <i>Chưa có dữ liệu.</i>
                    </td>
                  </tr>
                ) : (
                  categories.map((row, idx) => (
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
                      <td>{row.name}</td>
                      <td>{row.slug}</td>
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
        title="Xóa danh mục"
        message="Bạn có chắc chắn muốn xóa danh mục này không? Hành động này không thể hoàn tác."
      />

      <AdminModal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={isEditing ? 'Sửa Danh Mục' : 'Tạo Danh Mục Mới'}
      >
        <form onSubmit={handleSubmit} id="category-form">
          <div className="form-group mb-4">
            <label className="font-weight-bold mb-2">Tên danh mục <span className="text-danger">*</span></label>
            <input 
              type="text" 
              className="admin-form-control" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              placeholder={activeTab === 'PROGRAM' ? "VD: Bánh Ngọt, Món Âu..." : "VD: Kiến Thức, Mẹo Vặt..."}
              required
            />
          </div>
          
          <div className="form-group mb-4 p-3 bg-light rounded d-flex justify-content-between align-items-center">
            <div>
              <h6 className="m-0 font-weight-bold">Trạng thái hiển thị</h6>
              <small className="text-muted">Cho phép hiển thị ngoài website</small>
            </div>
            <label className="switch m-0">
              <input 
                type="checkbox" 
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              />
              <span className="slider round"></span>
            </label>
          </div>

          <div className="d-flex justify-content-end border-top pt-3 mt-3">
            <AdminButton variant="secondary" onClick={resetForm} disabled={hasPending} label="Hủy bỏ" />
            <AdminButton 
              type="submit" 
              className="admin-btn-save ml-2" 
              disabled={isPending('submit-category')}
              loading={isPending('submit-category')}
              label={isEditing ? 'Lưu Thay Đổi' : 'Tạo Mới'}
            />
          </div>
        </form>
      </AdminModal>

      {/* MODAL & UI INLINE CSS */}
      <style>{`
        .admin-categories-page { height: 100%; display: flex; flex-direction: column; min-height: 0; }
        .admin-tabs { flex-shrink: 0; }
        
        /* TOGGLE SWITCH */
        .switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: #ccc;
          transition: .4s;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
        }
        input:checked + .slider { background-color: var(--admin-primary); }
        input:checked + .slider:before { transform: translateX(20px); }
        .slider.round { border-radius: 24px; }
        .slider.round:before { border-radius: 50%; }
      `}</style>
    </div>
  );
};

export default AdminCategories;
