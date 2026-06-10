import React, { useEffect, useState } from 'react';
import AdminPageShell from './AdminPageShell';
import AdminTable from './AdminTable';
import AdminModal from './AdminModal';
import AdminButton from './Shared/AdminButton';
import AdminConfirmModal from './AdminConfirmModal';
import { getStaffAccounts, createStaffAccount, updateStaffAccount, deleteStaffAccount } from '../../services/api';
import { toast } from 'react-toastify';

const ALL_PERMISSIONS = [
  { key: 'programs',     label: 'Khóa học' },
  { key: 'categories',   label: 'Danh mục' },
  { key: 'posts',        label: 'Bài viết' },
  { key: 'orders',       label: 'Đơn hàng' },
  { key: 'contacts',     label: 'Tin nhắn liên hệ' },
  { key: 'banners',      label: 'Banner trang chủ' },
  { key: 'studentWorks', label: 'Sản phẩm học viên' },
  { key: 'loyalty',      label: 'Giảm giá & Tích điểm' },
  { key: 'settings',     label: 'Cấu hình Website' },
  { key: 'qna',          label: 'Hỏi Đáp Q&A' },
];

const EMPTY_FORM = { fullName: '', email: '', password: '', isAdmin: false, permissions: [] };

const RoleBadge = ({ role }) => (
  <span style={{
    padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
    background: role === 'ADMIN' ? 'rgba(239,68,68,0.15)' : 'rgba(96,165,250,0.15)',
    color: role === 'ADMIN' ? '#f87171' : '#60a5fa',
  }}>
    {role}
  </span>
);

const AdminAccounts = () => {
  const [accounts, setAccounts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [deletingId, setDeletingId]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showModal, setShowModal]       = useState(false);
  const [editing, setEditing]           = useState(null);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [saving, setSaving]             = useState(false);
  const [formError, setFormError]       = useState('');

  const load = async () => {
    setLoading(true);
    try {
      setAccounts(await getStaffAccounts());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (acc) => {
    setEditing(acc);
    setForm({ fullName: acc.fullName, email: acc.email, password: '', isAdmin: acc.role === 'ADMIN', permissions: acc.permissions || [] });
    setFormError('');
    setShowModal(true);
  };

  const togglePermission = (key) => {
    setForm(f => ({
      ...f,
      permissions: f.permissions.includes(key)
        ? f.permissions.filter(p => p !== key)
        : [...f.permissions, key]
    }));
  };

  const handleSave = async () => {
    setFormError('');
    if (!form.fullName || !form.email) return setFormError('Vui lòng nhập đầy đủ họ tên và email.');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) return setFormError('Email không hợp lệ.');
    
    if (!editing && !form.password) return setFormError('Vui lòng nhập mật khẩu.');
    if (!editing && form.password.length < 6) return setFormError('Mật khẩu phải có ít nhất 6 ký tự.');
    if (editing && form.password && form.password.length < 6) return setFormError('Mật khẩu phải có ít nhất 6 ký tự.');
    
    if (!form.isAdmin && form.permissions.length === 0) {
      return setFormError('Vui lòng chọn ít nhất 1 quyền truy cập cho nhân viên.');
    }
    setSaving(true);
    try {
      const payload = { fullName: form.fullName, role: form.isAdmin ? 'ADMIN' : 'EDITOR', permissions: form.isAdmin ? [] : form.permissions };
      if (!editing) { payload.email = form.email; payload.password = form.password; }
      if (form.password && editing) payload.password = form.password;

      if (editing) await updateStaffAccount(editing.id, payload);
      else         await createStaffAccount(payload);

      toast.success(editing ? 'Đã cập nhật tài khoản.' : 'Đã tạo tài khoản mới.');
      setShowModal(false);
      load();
    } catch (err) {
      setFormError(err?.response?.data?.error || 'Lỗi hệ thống.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await deleteStaffAccount(deleteTarget.id);
      toast.success('Đã xóa tài khoản.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Lỗi hệ thống.');
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    { key: 'fullName', label: 'Họ tên' },
    { key: 'email',    label: 'Email' },
    { key: 'role', label: 'Role',
      render: (row) => <RoleBadge role={row.role} />
    },
    {
      key: 'permissions', label: 'Quyền truy cập',
      render: (row) => row.role === 'ADMIN'
        ? <span style={{ color: 'var(--admin-text-muted)', fontSize: '13px' }}>Tất cả quyền</span>
        : row.permissions?.length
          ? <span style={{ fontSize: '13px' }}>{ALL_PERMISSIONS.filter(p => row.permissions.includes(p.key)).map(p => p.label).join(', ')}</span>
          : <span style={{ color: '#ef4444', fontSize: '13px' }}>Chưa có quyền</span>
    },
    {
      key: 'createdAt', label: 'Ngày tạo',
      render: (row) => <span style={{ color: 'var(--admin-text-muted)', fontSize: '13px' }}>{new Date(row.createdAt).toLocaleDateString('vi-VN')}</span>
    },
  ];

  return (
    <AdminPageShell
      title="Tài khoản nhân viên"
      subtitle="Tạo và phân quyền tài khoản cho nhân viên chỉnh sửa website."
      actions={<AdminButton icon="plus" label="Tạo tài khoản" variant="primary" onClick={openCreate} id="btn-create-staff" />}
    >
      <AdminTable
        columns={columns}
        data={accounts}
        loading={loading}
        onEdit={openEdit}
        onDelete={(id) => setDeleteTarget(accounts.find(a => a.id === id))}
        deletingId={deletingId}
        deleteConfirmTitle="Xóa tài khoản"
        deleteConfirmMessage="Bạn có chắc muốn xóa tài khoản này? Hành động này không thể hoàn tác."
      />

      {/* Form modal */}
      <AdminModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Sửa tài khoản' : 'Tạo tài khoản mới'}
      >
        <div className="admin-form-group">
          <label className="admin-form-label">Họ tên</label>
          <input
            className="admin-form-control"
            value={form.fullName}
            onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
            placeholder="Nguyễn Thị Mai"
          />
        </div>

        {!editing && (
          <div className="admin-form-group">
            <label className="admin-form-label">Email</label>
            <input
              className="admin-form-control"
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="mai@yum.com"
            />
          </div>
        )}

        <div className="admin-form-group">
          <label className="admin-form-label">{editing ? 'Mật khẩu mới (bỏ trống nếu không đổi)' : 'Mật khẩu'}</label>
          <input
            className="admin-form-control"
            type="password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            placeholder="••••••••"
          />
        </div>

        {/* Toggle Admin */}
        <div className="admin-form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', userSelect: 'none', margin: 0 }}>
            <div
              onClick={() => setForm(f => ({ ...f, isAdmin: !f.isAdmin }))}
              style={{
                width: '42px', height: '24px', borderRadius: '12px', flexShrink: 0,
                background: form.isAdmin ? 'var(--admin-brand, #4f9a71)' : '#cbd5e1',
                position: 'relative', transition: 'background 0.2s', cursor: 'pointer',
              }}
            >
              <div style={{
                position: 'absolute', top: '3px',
                left: form.isAdmin ? '21px' : '3px',
                width: '18px', height: '18px', borderRadius: '50%',
                background: '#fff', transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--admin-text)' }}>
                Quản trị viên (toàn quyền)
              </div>
              <div style={{ fontSize: '12px', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                {form.isAdmin ? 'Truy cập tất cả tính năng, không giới hạn.' : 'Chỉ truy cập các module được tick bên dưới.'}
              </div>
            </div>
          </label>
        </div>

        {!form.isAdmin && (
          <div className="admin-form-group">
            <label className="admin-form-label">Phân quyền module</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
              {ALL_PERMISSIONS.map(p => (
                <label key={p.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--admin-text)', lineHeight: 1 }}>
                  <input
                    type="checkbox"
                    checked={form.permissions.includes(p.key)}
                    onChange={() => togglePermission(p.key)}
                    style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: 'var(--admin-brand)', flexShrink: 0, margin: 0 }}
                  />
                  <span>{p.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {formError && (
          <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px' }}>{formError}</p>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <AdminButton variant="secondary" label="Hủy" onClick={() => setShowModal(false)} />
          <AdminButton
            variant="primary"
            icon="save"
            label={editing ? 'Lưu thay đổi' : 'Tạo tài khoản'}
            loading={saving}
            loadingLabel="Đang lưu..."
            onClick={handleSave}
          />
        </div>
      </AdminModal>

      {/* Delete confirm */}
      <AdminConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xóa tài khoản"
        message={`Bạn có chắc muốn xóa tài khoản "${deleteTarget?.fullName}"? Hành động này không thể hoàn tác.`}
        loading={!!deletingId}
        confirmLabel="Xóa"
        cancelLabel="Hủy"
      />
    </AdminPageShell>
  );
};

export default AdminAccounts;
