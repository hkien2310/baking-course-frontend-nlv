import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AdminConfirmModal from './AdminConfirmModal';
import AdminButton from './Shared/AdminButton';
import AdminTable from './AdminTable';
import { getEnrollments, updateEnrollmentStatus, deleteEnrollment } from '../../services/api';
import AdminPageShell from './AdminPageShell';
import usePendingAction from './usePendingAction';

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

  const columns = [
    { label: 'Ngày', render: enr => new Date(enr.createdAt).toLocaleDateString() },
    { label: 'Tên Học viên', render: enr => enr.fullName },
    { label: 'Email', render: enr => enr.email },
    { label: 'SĐT', render: enr => enr.phone || '—' },
    { label: 'Khóa học', render: enr => (
      <>
        {enr.classSession?.program?.title || 'Không rõ khóa học'}
        <br/><small className="text-muted">{enr.classSession?.startDate ? new Date(enr.classSession.startDate).toLocaleDateString() : ''}</small>
      </>
    )},
    { label: 'Trạng thái', render: enr => (
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
    )}
  ];

  const customActions = (enr) => (
    <AdminButton variant="danger" icon="trash" outline size="sm" onClick={() => setDeleteTargetId(enr.id)} loading={isPending(`delete-${enr.id}`)} disabled={isPending(`status-${enr.id}`)} />
  );

  return (
    <>
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <AdminTable 
        title="Danh sách Ghi danh"
        columns={columns}
        data={enrollments}
        loading={loading}
        customActions={customActions}
      />
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
