import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AdminConfirmModal from './AdminConfirmModal';
import AdminButton from './Shared/AdminButton';
import { getEnrollments, updateEnrollmentStatus, deleteEnrollment } from '../../services/api';
import AdminPageShell from './AdminPageShell';
import usePendingAction from './usePendingAction';
import AdminHeader from './Shared/AdminHeader';

const AdminEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const { isPending, withPending } = usePendingAction();

  const fetchEnrollments = async () => {
    try {
      const data = await getEnrollments();
      setEnrollments(data);
      setLoading(false);
    } catch (err) {
      console.error("Lỗi khi tải danh sách ghi danh", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const handleStatusChange = async (id, currentStatus) => {
    const newStatus = currentStatus === 'PENDING' ? 'CONFIRMED' : 'PENDING';
    try {
      await withPending(`status-${id}`, async () => {
        await updateEnrollmentStatus(id, newStatus);
        toast.success(`Đã chuyển trạng thái thành ${newStatus === 'CONFIRMED' ? 'XÁC NHẬN' : 'CHỜ DUYỆT'}`);
        await fetchEnrollments();
      });
    } catch (err) {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const handleDelete = async (id) => {
    try {
      await withPending(`delete-${id}`, async () => {
        await deleteEnrollment(id);
        toast.success('Xóa ghi danh thành công!');
        setDeleteTargetId(null);
        await fetchEnrollments();
      });
    } catch (err) {
      toast.error('Lỗi khi xóa ghi danh');
    }
  };

  if (loading) return <AdminPageShell loading loadingRows={5} />;

  return (
    <>
    <div>
      <AdminHeader 
        title="Danh sách Ghi danh" 
        description="Quản lý thông tin học viên đăng ký khóa học" 
      />
      
      <div className="admin-paper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Tên Học viên</th>
              <th>Email</th>
              <th>SĐT</th>
              <th>Khóa học</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.length === 0 ? (
              <tr><td colSpan="7" className="text-center">Chưa có lượt ghi danh nào</td></tr>
            ) : (
              enrollments.map(enr => (
                <tr key={enr.id}>
                  <td>{new Date(enr.createdAt).toLocaleDateString()}</td>
                  <td>{enr.fullName}</td>
                  <td>{enr.email}</td>
                  <td>{enr.phone || '—'}</td>
                  <td>
                    {enr.classSession?.program?.title || 'Không rõ khóa học'}
                    <br/><small className="text-muted">{enr.classSession?.startDate ? new Date(enr.classSession.startDate).toLocaleDateString() : ''}</small>
                  </td>
                  <td>
                    <span 
                      style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        backgroundColor: enr.status === 'CONFIRMED' ? '#d4edda' : '#fff3cd',
                        color: enr.status === 'CONFIRMED' ? '#155724' : '#856404',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleStatusChange(enr.id, enr.status)}
                    >
                      {isPending(`status-${enr.id}`) ? 'ĐANG CẬP NHẬT' : enr.status === 'CONFIRMED' ? 'XÁC NHẬN' : 'CHỜ DUYỆT'}
                    </span>
                  </td>
                  <td>
                    <AdminButton variant="danger" icon="trash" outline size="sm" onClick={() => setDeleteTargetId(enr.id)} loading={isPending(`delete-${enr.id}`)} disabled={isPending(`status-${enr.id}`)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>

    <AdminConfirmModal
      isOpen={!!deleteTargetId}
      onClose={() => setDeleteTargetId(null)}
      onConfirm={() => handleDelete(deleteTargetId)}
      title="Xóa Ghi danh"
      message="Bạn có chắc chắn muốn xóa lượt ghi danh này? Hành động này không thể hoàn tác."
      loading={isPending(`delete-${deleteTargetId}`)}
      confirmLabel="Xóa"
      cancelLabel="Hủy"
    />
    </>
  );
};

export default AdminEnrollments;
