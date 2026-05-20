import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getPrograms, deleteProgram, reorderPrograms } from '../../services/api';
import { ROUTES } from '../../constants/routes';
import { formatPrice } from '../../utils/formatters';
import usePendingAction from './usePendingAction';
import AdminHeader from './Shared/AdminHeader';
import AdminButton from './Shared/AdminButton';
import AdminLoadingBlock from './AdminLoadingBlock';
import AdminConfirmModal from './AdminConfirmModal';
import AdminActionBtn from './Shared/AdminActionBtn';

const AdminPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();
  const { isPending, withPending } = usePendingAction();

  // Drag and Drop state
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const [draggedIdx, setDraggedIdx] = useState(null);

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
    try {
      await withPending(`delete-${id}`, async () => {
        await deleteProgram(id);
        toast.success('Xóa khóa học thành công!');
        await fetchData();
      });
    } catch (err) {
      toast.error('Lỗi khi xóa khóa học');
    }
  };

  // Drag and Drop handlers
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
      const newProgs = [...programs];
      const item = newProgs.splice(dragItem.current, 1)[0];
      newProgs.splice(dragOverItem.current, 0, item);
      
      setPrograms(newProgs); // Update UI immediately

      const payload = newProgs.map((prog, idx) => ({ id: prog.id, sortOrder: idx }));
      try {
        await reorderPrograms(payload);
        toast.success('Đã cập nhật thứ tự khóa học!');
      } catch (err) {
        toast.error('Lỗi khi cập nhật vị trí');
        fetchData();
      }
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <AdminHeader 
        title="Quản lý Khóa học" 
        description="Danh sách các khóa học trên hệ thống. Kéo thả biểu tượng ☰ để sắp xếp." 
        action={<AdminButton variant="primary" icon="plus" label="Thêm Mới" onClick={handleOpenCreate} />} 
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
                  <th>Tiêu đề</th>
                  <th>Giá</th>
                  <th>Danh mục</th>
                  <th>Thống kê</th>
                  <th>Trạng thái</th>
                  <th width="150" className="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {programs.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4" style={{color: '#888'}}>
                      <i>Chưa có dữ liệu.</i>
                    </td>
                  </tr>
                ) : (
                  programs.map((row, idx) => (
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
                        <img src={row.thumbnail} alt="" width="50" style={{borderRadius: '4px'}}/>
                      </td>
                      <td>{row.title}</td>
                      <td>
                        {row.salePrice && row.price > row.salePrice ? (
                          <>
                            <div style={{ fontWeight: 600 }}>{formatPrice(row.salePrice)}</div>
                            <small style={{ textDecoration: 'line-through', color: '#999' }}>{formatPrice(row.price)}</small>
                          </>
                        ) : (
                          <span style={{ fontWeight: 600 }}>{formatPrice(row.price)}</span>
                        )}
                      </td>
                      <td>{row.category || '—'}</td>
                      <td>
                        <small>{row.students || 0} học viên / {row.reviews || 0} đánh giá</small>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          <span className="badge badge-success">ĐÃ XUẤT BẢN</span>
                          {row.isFeatured && <span className="badge" style={{ background: '#c19a5b', color: '#fff' }}>⭐ Nổi bật</span>}
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center" style={{ gap: '4px' }}>
                          <AdminActionBtn 
                            variant="edit" 
                            onClick={() => handleOpenEdit(row)} 
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
        title="Xóa khóa học"
        message={
          deleteTarget?.students > 0
            ? `CẢNH BÁO: Đã có ${deleteTarget.students} học sinh học khóa học "${deleteTarget.title}". Việc xóa khóa học sẽ gỡ bỏ dữ liệu liên quan đến học sinh và đơn hàng. Bạn có chắc chắn muốn xóa không?`
            : `Bạn có chắc chắn muốn xóa khóa học "${deleteTarget?.title}" không? Hành động này không thể hoàn tác.`
        }
      />
    </div>
  );
};

export default AdminPrograms;
