import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/api';
import AdminTable from './AdminTable';
import AdminModal from './AdminModal';
import AdminButton from './Shared/AdminButton';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('PROGRAM');
  const [formData, setFormData] = useState({ id: null, name: '', slug: '', sortOrder: 0, isActive: true });

  const fetchData = async () => {
    try {
      const data = await getCategories({ includeInactive: true, type: activeTab });
      const sortedData = data.sort((a, b) => a.sortOrder - b.sortOrder);
      setCategories(sortedData);
    } catch (err) {
      toast.error('Lỗi khi tải danh mục');
    }
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  const resetForm = () => {
    setIsEditing(false);
    setFormData({ id: null, name: '', slug: '', isActive: true });
    setIsModalOpen(false);
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
      await deleteCategory(id);
      toast.success('Xóa danh mục thành công!');
      fetchData();
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

      if (isEditing) {
        await updateCategory(formData.id, payload);
        toast.success('Cập nhật danh mục thành công!');
      } else {
        await createCategory(payload);
        toast.success('Thêm danh mục mới thành công!');
      }
      resetForm();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi lưu danh mục');
    }
  };

  const columns = [
    { label: 'Tên danh mục', key: 'name' },
    { label: 'Đường dẫn (slug)', key: 'slug' },
    { 
      label: 'Trạng thái', 
      render: (row) => (
        <span className={`badge ${row.isActive ? 'badge-success' : 'badge-secondary'}`}>
          {row.isActive ? 'Hiển thị' : 'Đang ẩn'}
        </span>
      ) 
    }
  ];

  return (
    <div className="admin-categories-page">
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'PROGRAM' ? 'active font-weight-bold' : 'text-muted'}`}
            onClick={() => setActiveTab('PROGRAM')}
            style={{ 
              borderTopLeftRadius: '8px', borderTopRightRadius: '8px', borderBottom: 'none', 
              background: activeTab === 'PROGRAM' ? '#fff' : 'transparent', 
              outline: 'none',
              color: activeTab === 'PROGRAM' ? 'var(--admin-primary)' : ''
            }}
          >
            <i className="fa fa-graduation-cap mr-2"></i> Danh mục Khóa học
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'POST' ? 'active font-weight-bold' : 'text-muted'}`}
            onClick={() => setActiveTab('POST')}
            style={{ 
              borderTopLeftRadius: '8px', borderTopRightRadius: '8px', borderBottom: 'none', 
              background: activeTab === 'POST' ? '#fff' : 'transparent', 
              outline: 'none',
              color: activeTab === 'POST' ? 'var(--admin-primary)' : ''
            }}
          >
            <i className="fa fa-pencil-square-o mr-2"></i> Danh mục Bài viết
          </button>
        </li>
      </ul>

      <AdminTable 
        title={activeTab === 'PROGRAM' ? "Danh mục Khóa học" : "Danh mục Bài viết"} 
        columns={columns} 
        data={categories} 
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={() => setIsModalOpen(true)}
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
            <button type="button" className="btn btn-light" onClick={resetForm}>Hủy bỏ</button>
            <button type="submit" className="admin-btn-save ml-2">
              {isEditing ? 'Lưu Thay Đổi' : 'Tạo Mới'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* MODAL & UI INLINE CSS */}
      <style>{`
        .admin-categories-page { height: 100%; }
        
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
