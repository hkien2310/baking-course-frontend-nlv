import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AdminConfirmModal from './AdminConfirmModal';
import AdminModal from './AdminModal';
import AdminButton from './Shared/AdminButton';
import { getContacts, deleteContact } from '../../services/api';
import AdminPageShell from './AdminPageShell';
import usePendingAction from './usePendingAction';

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const { isPending, withPending, hasPending } = usePendingAction();

  const fetchContacts = async () => {
    try {
      const data = await getContacts();
      // Sort by date descending (newest first)
      const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setContacts(sorted);
      setLoading(false);
    } catch (err) {
      console.error("Lỗi khi tải danh sách tin nhắn", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleDelete = async (id) => {
    try {
      await withPending(`delete-${id}`, async () => {
        await deleteContact(id);
        toast.success('Xóa tin nhắn thành công!');
        if (selectedContact?.id === id) setSelectedContact(null);
        setDeleteTargetId(null);
        await fetchContacts();
      });
    } catch (err) {
      toast.error('Lỗi khi xóa tin nhắn');
    }
  };

  if (loading) return <AdminPageShell loading loadingRows={5} />;

  return (
    <>
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 className="mb-0">Tin nhắn Liên hệ</h3>
      </div>
      
      <div className="admin-paper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Khách hàng</th>
              <th>Chủ đề</th>
              <th>Nội dung</th>
              <th className="text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 ? (
              <tr><td colSpan="5" className="text-center">Chưa có tin nhắn nào</td></tr>
            ) : (
              contacts.map(contact => (
                <tr key={contact.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedContact(contact)}>
                  <td style={{ whiteSpace: 'nowrap', color: 'var(--admin-text-muted)' }}>
                    {new Date(contact.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--admin-primary)' }}>{contact.fullName}</div>
                    <div style={{ fontSize: '13px', color: 'var(--admin-text-muted)' }}>{contact.email}</div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{contact.subject || 'Không có chủ đề'}</td>
                  <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--admin-text-muted)' }}>
                    {contact.message}
                  </td>
                  <td className="text-right">
                    <button className="admin-btn-icon view" title="Xem chi tiết" onClick={(e) => { e.stopPropagation(); setSelectedContact(contact); }}>
                      <i className="fa fa-eye"></i>
                    </button>
                    <button className="admin-btn-icon delete" title="Xóa" disabled={isPending(`delete-${contact.id}`)} onClick={(e) => { e.stopPropagation(); setDeleteTargetId(contact.id); }}>
                      <i className={`fa ${isPending(`delete-${contact.id}`) ? 'fa-spinner fa-spin' : 'fa-trash'}`}></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>

    {/* Message Detail Modal */}
    <AdminModal
      isOpen={!!selectedContact}
      onClose={() => setSelectedContact(null)}
      title="Chi tiết Tin nhắn"
    >
      {selectedContact && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--admin-border-light)', paddingBottom: '20px' }}>
            <div>
              <h5 style={{ margin: '0 0 5px 0', color: 'var(--admin-heading)' }}>{selectedContact.fullName}</h5>
              <div style={{ color: 'var(--admin-text-muted)', fontSize: '14px' }}>
                <i className="fa fa-envelope-o mr-2"></i>{selectedContact.email}
              </div>
            </div>
            <div style={{ textAlign: 'right', color: 'var(--admin-text-muted)', fontSize: '14px' }}>
              <i className="fa fa-clock-o mr-2"></i>
              {new Date(selectedContact.createdAt).toLocaleString('vi-VN')}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h6 style={{ color: 'var(--admin-text-muted)', fontSize: '13px', letterSpacing: '0.2px', marginBottom: '10px' }}>Chủ đề</h6>
            <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--admin-heading)' }}>
              {selectedContact.subject || 'Không có chủ đề'}
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h6 style={{ color: 'var(--admin-text-muted)', fontSize: '13px', letterSpacing: '0.2px', marginBottom: '10px' }}>Nội dung tin nhắn</h6>
            <div style={{ 
              background: 'var(--admin-bg)', 
              padding: '20px', 
              borderRadius: '8px', 
              border: '1px solid var(--admin-border-subtle)',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.6',
              color: 'var(--admin-text-base)'
            }}>
              {selectedContact.message}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--admin-border-light)', paddingTop: '20px' }}>
            <button 
              type="button" 
              className="btn btn-outline-danger btn-sm"
              onClick={() => setDeleteTargetId(selectedContact.id)}
              disabled={isPending(`delete-${selectedContact.id}`)}
            >
              <i className="fa fa-trash mr-2"></i>Xóa tin nhắn
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn btn-light" onClick={() => setSelectedContact(null)} disabled={hasPending}>
                {hasPending ? 'Đang xử lý...' : 'Đóng'}
              </button>
              <a 
                href={`mailto:${selectedContact.email}?subject=Re: ${encodeURIComponent(selectedContact.subject || 'Phản hồi từ Muka Bakery')}`}
                className="btn btn-primary"
                style={{ background: 'var(--admin-brand)', borderColor: 'var(--admin-brand)', color: 'white' }}
              >
                <i className="fa fa-reply mr-2"></i> Phản hồi qua Email
              </a>
            </div>
          </div>
        </div>
      )}
    </AdminModal>

    <AdminConfirmModal
      isOpen={!!deleteTargetId}
      onClose={() => setDeleteTargetId(null)}
      onConfirm={() => handleDelete(deleteTargetId)}
      title="Xóa Tin nhắn"
      message="Bạn có chắc chắn muốn xóa tin nhắn liên hệ này? Hành động này không thể hoàn tác."
      loading={isPending(`delete-${deleteTargetId}`)}
      confirmLabel="Xóa"
      cancelLabel="Hủy"
    />
    </>
  );
};

export default AdminContacts;
