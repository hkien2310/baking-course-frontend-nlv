import React, { useState, useEffect } from 'react';
import AdminTable from './AdminTable';
import AdminModal from './AdminModal';
import AdminImageUpload from './AdminImageUpload';
import { toast } from 'react-toastify';
import { getPosts, deletePost } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const AdminPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getPosts();
      setPosts(data.data || data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenCreate = () => {
    navigate(ROUTES.ADMIN_POST_NEW);
  };

  const handleOpenEdit = (post) => {
    navigate(ROUTES.ADMIN_POST_EDIT(post.slug || post.id));
  };

  const handleDelete = async (id) => {
    try {
      await deletePost(id);
      toast.success('Xóa bài viết thành công!');
      fetchData();
    } catch (err) {
      toast.error('Lỗi khi xóa bài viết');
    }
  };

  const columns = [
    { label: 'Ảnh', render: (row) => <img src={row.thumbnail} alt="" width="50" style={{borderRadius: '4px'}}/> },
    { label: 'Tiêu đề', key: 'title' },
    { label: 'Chuyên mục', render: (row) => <span className="badge badge-info bg-info">{row.category}</span> },
    { label: 'Tác giả', render: (row) => row.authorName || 'Admin' },
    { label: 'Ngày đăng', render: (row) => row.dateString || new Date(row.createdAt).toLocaleDateString() }
  ];

  return (
    <div>
      <AdminTable 
        title="Quản lý Bài viết & Công thức" 
        columns={columns} 
        data={posts} 
        loading={loading}
        loadingTitle="Đang tải bài viết và công thức..."
        onCreate={handleOpenCreate}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />


    </div>
  );
};

export default AdminPosts;
