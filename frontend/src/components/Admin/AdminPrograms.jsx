import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminTable from './AdminTable';
import { toast } from 'react-toastify';
import { getPrograms, deleteProgram } from '../../services/api';
import { ROUTES } from '../../constants/routes';
import { formatPrice } from '../../utils/formatters';

const AdminPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const navigate = useNavigate();

  const fetchData = async () => {
    const data = await getPrograms();
    setPrograms(data.data || data || []);
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
    { label: 'Giá', render: (row) => formatPrice(row.price) },
    { label: 'Danh mục', render: (row) => row.category || '—' },
    { label: 'Thống kê', render: (row) => {
      const studentCount = row.students || 0;
      return <small>{studentCount} học viên / {row.reviews || 0} đánh giá</small>;
    }},
    { label: 'Trạng thái', render: (row) => {
        return <span className="badge badge-success">ĐÃ XUẤT BẢN</span>;
    }}
  ];

  return (
    <div>
      <AdminTable 
        title="Quản lý Khóa học" 
        columns={columns} 
        data={programs} 
        onCreate={handleOpenCreate}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default AdminPrograms;
