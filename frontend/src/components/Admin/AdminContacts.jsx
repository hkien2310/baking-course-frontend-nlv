import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AdminConfirmModal from './AdminConfirmModal';
import AdminModal from './AdminModal';
import AdminButton from './Shared/AdminButton';
import AdminActionBtn from './Shared/AdminActionBtn';
import AdminLoadingBlock from './AdminLoadingBlock';
import Pagination from '../Shared/Pagination';
import { getContacts, deleteContact } from '../../services/api';
import usePendingAction from './usePendingAction';
import AdminHeader from './Shared/AdminHeader';

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { isPending, withPending, hasPending } = usePendingAction();

  const fetchContacts = async () => {
    try {
      const data = await getContacts();
      // Sort by date descending (newest first)
      const sorted = (data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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

  if (loading) return (
    <>
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <AdminHeader 
        title="Tin nhắn Liên hệ" 
        description="Quản lý và phản hồi các liên hệ từ khách hàng" 
      />
      <div className="admin-paper fade-in" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <AdminLoadingBlock compact rows={5} />
      </div>
    </div>
    </>
  );

  const totalPages = Math.ceil(contacts.length / itemsPerPage) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const paginatedContacts = contacts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <>
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <AdminHeader 
        title="Tin nhắn Liên hệ" 
        description="Quản lý và phản hồi các liên hệ từ khách hàng" 
      />
      <div className="admin-paper fade-in" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
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
            {paginatedContacts.length === 0 ? (
              <tr><td colSpan="5" className="text-center">Chưa có tin nhắn nào</td></tr>
            ) : (
              paginatedContacts.map(contact => (
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
                  <td className="text-right d-flex justify-content-end">
                    <AdminActionBtn 
                      variant="view" 
                      onClick={(e) => { e.stopPropagation(); setSelectedContact(contact); }} 
                      title="Xem chi tiết" 
                    />
                    <AdminActionBtn 
                      variant="delete" 
                      onClick={(e) => { e.stopPropagation(); setDeleteTargetId(contact.id); }} 
                      title="Xóa" 
                      loading={isPending(`delete-${contact.id}`)} 
                      disabled={isPending(`delete-${contact.id}`)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
        {totalPages > 1 && (
          <div className="admin-pagination-wrapper pt-4 pb-2" style={{ borderTop: '1px solid var(--admin-border-subtle)' }}>
            <Pagination 
              currentPage={safePage} 
              totalPages={totalPages} 
              onPageChange={(p) => setCurrentPage(p)} 
            />
          </div>
        )}
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
            <AdminButton 
              variant="danger" 
              outline
              icon="trash"
              label="Xóa tin nhắn"
              onClick={() => setDeleteTargetId(selectedContact.id)}
              disabled={isPending(`delete-${selectedContact.id}`)}
              loading={isPending(`delete-${selectedContact.id}`)}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <AdminButton 
                variant="secondary" 
                onClick={() => setSelectedContact(null)} 
                disabled={hasPending}
                label="Đóng"
              />
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
