import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminTable from './AdminTable';
import { toast } from 'react-toastify';
import { getPrograms, deleteProgram } from '../../services/api';
import { ROUTES } from '../../constants/routes';
import { formatPrice } from '../../utils/formatters';

const AdminPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getPrograms();
      setPrograms(data.data || data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenCreate = () => {
    navigate(ROUTES.ADMIN_PROGRAM_NEW);
  };

  const handleOpenEdit = (prog) => {
    navigate(ROUTES.ADMIN_PROGRAM_EDIT(prog.id));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khóa học này không?")) return;
    try {
      await deleteProgram(id);
      toast.success('Xóa khóa học thành công!');
      fetchData();
    } catch (err) {
      toast.error('Lỗi khi xóa khóa học');
    }
  };

  const columns = [
    { label: 'Ảnh', render: (row) => <img src={row.thumbnail} alt="" width="50" style={{borderRadius: '4px'}}/> },
    { label: 'Tiêu đề', key: 'title' },
    { label: 'Giá', render: (row) => (
      <div>
        {row.salePrice && row.price > row.salePrice ? (
          <>
            <div style={{ fontWeight: 600 }}>{formatPrice(row.salePrice)}</div>
            <small style={{ textDecoration: 'line-through', color: '#999' }}>{formatPrice(row.price)}</small>
          </>
        ) : (
          <span style={{ fontWeight: 600 }}>{formatPrice(row.price)}</span>
        )}
      </div>
    )},
    { label: 'Danh mục', render: (row) => row.category || '—' },
    { label: 'Thống kê', render: (row) => {
      const studentCount = row.students || 0;
      return <small>{studentCount} học viên / {row.reviews || 0} đánh giá</small>;
    }},
    { label: 'Trạng thái', render: (row) => (
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        <span className="badge badge-success">ĐÃ XUẤT BẢN</span>
        {row.isFeatured && <span className="badge" style={{ background: '#c19a5b', color: '#fff' }}>⭐ Nổi bật</span>}
      </div>
    )}
  ];

  return (
    <div>
      <AdminTable 
        title="Quản lý Khóa học" 
        columns={columns} 
        data={programs} 
        loading={loading}
        loadingTitle="Đang tải danh sách khóa học..."
        onCreate={handleOpenCreate}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default AdminPrograms;
