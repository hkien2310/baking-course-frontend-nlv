import React, { useState, useEffect } from 'react';
import AdminTable from './AdminTable';
import AdminModal from './AdminModal';
import AdminImageUpload from './AdminImageUpload';
import AdminButton from './Shared/AdminButton';
import { AdminInput, AdminTextarea } from './Shared/AdminFormControls';
import { getChiefs, createChief, updateChief, deleteChief } from '../../services/api';
import { toast } from 'react-toastify';
import usePendingAction from './usePendingAction';
import AdminHeader from './Shared/AdminHeader';

const EMPTY_FORM = {
  name: '', role: '', image: '',
  bio: '', biography: '',
  highlights: '',
  socialFb: '', socialTw: '', socialIn: '',
  skills: [{ name: '', percent: 80 }]
};

const AdminChiefs = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, item: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const { isPending, withPending, hasPending } = usePendingAction();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getChiefs();
      setData(res.data || res || []);
    } catch { toast.error('Could not load chiefs.'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = (item = null) => {
    setModal({ isOpen: true, item });
    if (item) {
      let skills = [{ name: '', percent: 80 }];
      try { skills = item.skills ? JSON.parse(item.skills) : skills; } catch {}
      setForm({ ...EMPTY_FORM, ...item, skills });
    } else {
      setForm(EMPTY_FORM);
    }
  };

  const closeModal = () => setModal({ isOpen: false, item: null });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Skills row management
  const addSkill = () => setForm({ ...form, skills: [...form.skills, { name: '', percent: 80 }] });
  const removeSkill = (i) => setForm({ ...form, skills: form.skills.filter((_, idx) => idx !== i) });
  const updateSkill = (i, field, val) => {
    const updated = form.skills.map((s, idx) => idx === i ? { ...s, [field]: field === 'percent' ? parseInt(val) : val } : s);
    setForm({ ...form, skills: updated });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, skills: JSON.stringify(form.skills) };
      await withPending('submit-chief', async () => {
        if (modal.item) {
          await updateChief(modal.item.id, payload);
          toast.success('Cập nhật giảng viên thành công!');
        } else {
          await createChief(payload);
          toast.success('Thêm giảng viên thành công!');
        }
        closeModal();
        await fetchData();
      });
    } catch { toast.error('Lỗi lưu giảng viên.'); }
  };

  const handleDelete = async (id) => {
    try {
      await withPending(`delete-${id}`, async () => {
        await deleteChief(id);
        toast.success('Đã xóa!');
        await fetchData();
      });
    } catch { toast.error('Lỗi khi xóa.'); }
  };

  const columns = [
    { key: 'image', label: 'Ảnh', render: (row) => row.image ? <img src={row.image.startsWith('http') ? row.image : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}${row.image}`} alt="" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} /> : <span style={{color:'#64748b'}}>Chưa có ảnh</span> },
    { key: 'name', label: 'Họ tên' },
    { key: 'role', label: 'Vị trí' },
    { key: 'bio', label: 'Giới thiệu ngắn', render: (row) => row.bio ? row.bio.substring(0, 50) + '...' : '—' },
  ];



  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <AdminHeader 
        title="Quản lý Giảng Viên" 
        description="Quản lý đội ngũ giảng viên và chuyên gia" 
        action={<AdminButton variant="primary" icon="plus" label="Thêm Mới" onClick={() => openModal()} />} 
      />
      <AdminTable 
        columns={columns} 
        data={data} 
        loading={loading} 
        onEdit={openModal}
        onDelete={handleDelete}
        deletingId={data.find((item) => isPending(`delete-${item.id}`))?.id || null}
        deleteConfirmTitle="Xóa giảng viên"
        deleteConfirmMessage="Bạn có chắc chắn muốn xóa giảng viên này không? Hành động này không thể hoàn tác."
        emptyMessage="Chưa có giảng viên nào." 
      />

      <AdminModal isOpen={modal.isOpen} onClose={closeModal} title={modal.item ? 'Sửa Giảng Viên' : 'Thêm Giảng Viên'}>
        <form onSubmit={handleSave} style={{ maxHeight: '75vh', overflowY: 'auto', padding: '0 4px' }}>

          {/* Photo + Basic */}
          <div className="row">
            <div className="col-md-6">
              <AdminInput label="Họ tên" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <AdminInput label="Vị trí / Chức danh" name="role" value={form.role} onChange={handleChange} placeholder="VD: Đầu bếp chuẩn sao Michelin" required />
            </div>
          </div>

          <AdminImageUpload label="Ảnh đại diện" name="image" value={form.image} onChange={(url) => setForm({ ...form, image: url })} />

          <AdminTextarea label="Giới thiệu ngắn (Mô tả)" name="bio" value={form.bio} onChange={handleChange} rows="2" placeholder="1-2 dòng giới thiệu hiển thị trên card..." />

          <AdminInput
            label="Thành tựu (ngăn cách bằng dấu |)"
            name="highlights"
            value={form.highlights}
            onChange={handleChange}
            placeholder="Đoạt giải thưởng | Chuyên gia bánh Pháp | Hơn 10 năm kinh nghiệm"
          />

          <AdminTextarea label="Tiểu sử đầy đủ" name="biography" value={form.biography} onChange={handleChange} rows="5" placeholder="Tiểu sử chi tiết hiển thị trong tab Khóa học..." />

          {/* Social */}
          <div className="row mt-2">
            <div className="col-md-4">
              <AdminInput label="Facebook URL" name="socialFb" value={form.socialFb} onChange={handleChange} placeholder="https://fb.com/..." />
            </div>
            <div className="col-md-4">
              <AdminInput label="Twitter URL" name="socialTw" value={form.socialTw} onChange={handleChange} placeholder="https://twitter.com/..." />
            </div>
            <div className="col-md-4">
              <AdminInput label="Instagram URL" name="socialIn" value={form.socialIn} onChange={handleChange} placeholder="https://instagram.com/..." />
            </div>
          </div>

          {/* Skills */}
          <div className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label style={{ color: 'var(--admin-primary)', fontWeight: 600 }}>Kỹ năng (Thanh %)</label>
              <AdminButton variant="info" outline size="sm" icon="plus" label="Thêm Kỹ năng" onClick={addSkill} />
            </div>
            {form.skills.map((skill, i) => (
              <div key={i} className="d-flex align-items-center mb-2" style={{ gap: 8 }}>
                <input
                  className="admin-form-control"
                  style={{ flex: 2 }}
                  placeholder="Tên kỹ năng (vd: Nướng bánh)"
                  value={skill.name}
                  onChange={(e) => updateSkill(i, 'name', e.target.value)}
                />
                <input
                  type="number" min="0" max="100"
                  className="admin-form-control"
                  style={{ flex: 1 }}
                  placeholder="%"
                  value={skill.percent}
                  onChange={(e) => updateSkill(i, 'percent', e.target.value)}
                />
                <AdminButton variant="danger" icon="trash" onClick={() => removeSkill(i)} />
              </div>
            ))}
          </div>

          <div className="mt-4 text-right">
            <AdminButton variant="secondary" onClick={closeModal} label="Hủy" className="mr-2" disabled={hasPending} />
            <AdminButton type="submit" variant="primary" icon="save" label="Lưu Giảng Viên" loading={isPending('submit-chief')} loadingLabel="Đang lưu" />
          </div>
        </form>
      </AdminModal>
    </div>
  );
};

export default AdminChiefs;
