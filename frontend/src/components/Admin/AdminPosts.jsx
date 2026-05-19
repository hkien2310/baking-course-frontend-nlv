import React, { useState, useEffect } from 'react';
import AdminTable from './AdminTable';
import AdminModal from './AdminModal';
import AdminImageUpload from './AdminImageUpload';
import { toast } from 'react-toastify';
import { getPosts, deletePost } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import usePendingAction from './usePendingAction';
import AdminHeader from './Shared/AdminHeader';
import AdminButton from './Shared/AdminButton';

const AdminPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isPending, withPending } = usePendingAction();

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
      await withPending(`delete-${id}`, async () => {
        await deletePost(id);
        toast.success('Xóa bài viết thành công!');
        await fetchData();
      });
    } catch (err) {
      toast.error('Lỗi khi xóa bài viết');
    }
  };

  const columns = [
    { label: 'Ảnh', render: (row) => <img src={row.thumbnail} alt="" width="50" style={{borderRadius: '4px'}}/> },
    { label: 'Tiêu đề', key: 'title' },
    { label: 'Chuyên mục', render: (row) => <span className="badge badge-info bg-info">{row.category}</span> },
    { label: 'Tác giả', render: (row) => row.authorName || 'Admin' },
    { label: 'Ngày đăng', render: (row) => {
      if (row.dateString) {
        const d = new Date(row.dateString);
        return isNaN(d.getTime()) ? row.dateString : d.toLocaleDateString('vi-VN');
      }
      return new Date(row.createdAt).toLocaleDateString('vi-VN');
    } }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <AdminHeader 
        title="Quản lý Chia sẻ" 
        description="Quản lý các bài viết, tin tức, và công thức làm bánh" 
        action={<AdminButton variant="primary" icon="plus" label="Thêm Mới" onClick={handleOpenCreate} />} 
      />
      <AdminTable 
        columns={columns} 
        data={posts} 
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        deletingId={posts.find((item) => isPending(`delete-${item.id}`))?.id || null}
        deleteConfirmTitle="Xóa bài viết"
        deleteConfirmMessage="Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác."
      />
    </div>
  );
};

export default AdminPosts;
