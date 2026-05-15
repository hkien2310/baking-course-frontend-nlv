import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import AdminLoadingBlock from './AdminLoadingBlock';
import AdminConfirmModal from './AdminConfirmModal';
import AdminModal from './AdminModal';
import AdminButton from './Shared/AdminButton';
import AdminActionBtn from './Shared/AdminActionBtn';
import { AdminCurrencyInput, AdminInput } from './Shared/AdminFormControls';
import {
  getLoyaltyConfig, updateLoyaltyConfig,
  getPromoCodes, createPromoCode, updatePromoCode, deletePromoCode
} from '../../services/api';
import { formatPrice } from '../../utils/formatters';
import AdminHeader from './Shared/AdminHeader';

const DISCOUNT_TYPE_LABELS = {
  PROMO: { icon: 'fa-tag', label: 'Mã giảm giá' },
  TIER: { icon: 'fa-trophy', label: 'Giảm giá hạng TV' },
  POINTS: { icon: 'fa-star', label: 'Dùng điểm' },
};

const DEFAULT_CONFIG = {
  discountMode: 'SINGLE',
  discountOrder: ['PROMO', 'TIER', 'POINTS'],
  enabledTypes: ['PROMO', 'TIER', 'POINTS'],
  tiers: [
    { name: 'Silver', minSpent: 500000, discountPercent: 3 },
    { name: 'Gold', minSpent: 2000000, discountPercent: 5 },
    { name: 'Diamond', minSpent: 5000000, discountPercent: 10 },
  ],
  points: { earnRate: 5000, earnPer: 100000, redeemRate: 1 },
};

const EMPTY_PROMO = { code: '', type: 'PERCENTAGE', value: '', maxDiscount: '', minOrderValue: '', usageLimit: '', startDate: '', endDate: '', isActive: true };

const AdminLoyalty = () => {
  const [activeTab, setActiveTab] = useState('tiers');
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState(null);

  // Promo codes state
  const [promos, setPromos] = useState([]);
  const [promosLoading, setPromosLoading] = useState(false);
  const [promoModal, setPromoModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [promoForm, setPromoForm] = useState(EMPTY_PROMO);
  const [promoSaving, setPromoSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getLoyaltyConfig()
      .then(data => { setConfig({ ...DEFAULT_CONFIG, ...data }); setLoading(false); })
      .catch(() => { setConfig(DEFAULT_CONFIG); setLoading(false); });
  }, []);

  const fetchPromos = useCallback(() => {
    setPromosLoading(true);
    getPromoCodes()
      .then(data => { setPromos(data); setPromosLoading(false); })
      .catch(() => setPromosLoading(false));
  }, []);

  useEffect(() => { if (activeTab === 'promos') fetchPromos(); }, [activeTab, fetchPromos]);

  const saveConfig = async () => {
    setSaving(true);
    try {
      await updateLoyaltyConfig(config);
      toast.success('Đã lưu cấu hình!');
    } catch { toast.error('Lỗi khi lưu!'); }
    setSaving(false);
  };

  // ── TIER HELPERS ──
  const updateTier = (idx, field, value) => {
    const tiers = [...config.tiers];
    const isNumeric = ['minSpent', 'discountPercent'].includes(field);
    tiers[idx] = { ...tiers[idx], [field]: isNumeric ? Number(value) : value };
    setConfig(c => ({ ...c, tiers }));
  };
  const addTier = () => setConfig(c => ({ ...c, tiers: [...c.tiers, { name: 'New', minSpent: 0, discountPercent: 0, color: '#c19a5b' }] }));
  const removeTier = (idx) => setConfig(c => ({ ...c, tiers: c.tiers.filter((_, i) => i !== idx) }));

  // ── DRAG & DROP HELPERS ──
  const dragItem = React.useRef(null);
  const dragOverItem = React.useRef(null);

  const handleDragStart = (idx) => {
    dragItem.current = idx;
    setDraggedIdx(idx);
  };
  const handleDragOver = (e, idx) => {
    e.preventDefault();
    dragOverItem.current = idx;
  };
  const handleDrop = () => {
    setDraggedIdx(null);
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const order = [...config.discountOrder];
      const item = order.splice(dragItem.current, 1)[0];
      order.splice(dragOverItem.current, 0, item);
      setConfig(c => ({ ...c, discountOrder: order }));
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  // ── DISCOUNT MODE HELPERS ──
  const toggleEnabled = (type) => {
    const enabled = config.enabledTypes.includes(type)
      ? config.enabledTypes.filter(t => t !== type)
      : [...config.enabledTypes, type];
    setConfig(c => ({ ...c, enabledTypes: enabled }));
  };

  // ── PROMO HELPERS ──
  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setPromoForm(f => ({ ...f, code }));
  };
  const openPromoCreate = () => { setEditingPromo(null); setPromoForm(EMPTY_PROMO); setPromoModal(true); };
  const openPromoEdit = (p) => {
    setEditingPromo(p);
    setPromoForm({
      code: p.code, type: p.type, value: p.value, maxDiscount: p.maxDiscount ?? '',
      minOrderValue: p.minOrderValue ?? 0, usageLimit: p.usageLimit ?? '',
      startDate: p.startDate ? p.startDate.slice(0, 10) : '',
      endDate: p.endDate ? p.endDate.slice(0, 10) : '',
      isActive: p.isActive,
    });
    setPromoModal(true);
  };
  const savePromo = async () => {
    setPromoSaving(true);
    try {
      const payload = {
        ...promoForm,
        value: Number(promoForm.value),
        maxDiscount: promoForm.maxDiscount !== '' ? Number(promoForm.maxDiscount) : null,
        minOrderValue: Number(promoForm.minOrderValue) || 0,
        usageLimit: promoForm.usageLimit !== '' ? Number(promoForm.usageLimit) : null,
      };
      if (editingPromo) await updatePromoCode(editingPromo.id, payload);
      else await createPromoCode(payload);
      toast.success(editingPromo ? 'Đã cập nhật mã!' : 'Đã tạo mã!');
      setPromoModal(false);
      fetchPromos();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Lỗi!');
    }
    setPromoSaving(false);
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await deletePromoCode(deleteTarget.id); toast.success('Đã xóa mã!'); fetchPromos(); }
    catch { toast.error('Lỗi khi xóa!'); }
    setDeleting(false); setDeleteTarget(null);
  };

  if (loading) return <AdminLoadingBlock rows={4} />;

  return (
    <div className="admin-loyalty-page" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <AdminHeader 
        title="Thành viên & Khuyến mãi" 
        description="Cấu hình hạng thành viên, điểm thưởng và mã giảm giá" 
      />
      {/* Tabs — reuse admin-tabs from admin.css */}
      <div className="admin-tabs">
        {[['tiers','fa-trophy','Hạng TV'],['mode','fa-sliders','Chế độ'],['points','fa-star','Điểm'],['promos','fa-tag','Mã giảm giá']].map(([key, icon, label]) => (
          <button key={key} className={`admin-tab-btn ${activeTab === key ? 'active' : ''}`} onClick={() => setActiveTab(key)}>
            <i className={`fa ${icon} mr-1`} /> {label}
          </button>
        ))}
      </div>

      {/* ── TAB: HẠNG THÀNH VIÊN ── */}
      {activeTab === 'tiers' && (
        <div className="admin-paper fade-in">
          <div className="admin-paper-header">
            <h4>Hạng thành viên</h4>
            <AdminButton variant="primary" icon="save" label="Lưu cấu hình" onClick={saveConfig} disabled={saving} loading={saving} loadingLabel="Đang lưu..." />
          </div>
          <div style={{ padding: '30px' }}>
            <p className="text-muted mb-4" style={{ fontSize: 14 }}>Tự động xếp hạng khi tổng chi tiêu đạt ngưỡng. Mỗi hạng có % giảm giá riêng.</p>
            <div className="table-responsive">
              <table className="admin-table">
                <thead><tr><th>Tên hạng</th><th>Chi tiêu tối thiểu (VND)</th><th>% Giảm giá</th><th>Màu sắc</th><th width="80" className="text-center">Thao tác</th></tr></thead>
                <tbody>
                  {config.tiers.map((t, idx) => (
                    <tr key={idx}>
                      <td><input className="admin-form-control" value={t.name} onChange={e => updateTier(idx, 'name', e.target.value)} /></td>
                      <td style={{ padding: '8px' }}>
                        <AdminCurrencyInput 
                          value={t.minSpent} 
                          onChange={e => updateTier(idx, 'minSpent', e.target.value)} 
                          placeholder="500.000"
                          noMargin
                        />
                      </td>
                      <td><input className="admin-form-control" type="number" min="0" max="100" value={t.discountPercent} onChange={e => updateTier(idx, 'discountPercent', e.target.value)} /></td>
                      <td>
                        <input type="color" className="admin-form-control" style={{ width: '50px', height: '38px', padding: '2px' }} value={t.color || '#c19a5b'} onChange={e => updateTier(idx, 'color', e.target.value)} title="Chọn màu huy hiệu" />
                      </td>
                      <td className="text-center">
                        <AdminActionBtn variant="delete" onClick={() => removeTier(idx)} title="Xóa" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AdminButton variant="primary" outline icon="plus" label="Thêm hạng" onClick={addTier} className="mt-3" />
          </div>
        </div>
      )}

      {/* ── TAB: CHẾ ĐỘ GIẢM GIÁ ── */}
      {activeTab === 'mode' && (
        <div className="admin-paper fade-in">
          <div className="admin-paper-header">
            <h4>Chế độ giảm giá</h4>
            <AdminButton variant="primary" icon="save" label="Lưu cấu hình" onClick={saveConfig} disabled={saving} loading={saving} loadingLabel="Đang lưu..." />
          </div>
          <div style={{ padding: '30px' }}>
            <div className="mb-4">
              <label className={`loyalty-radio-card ${config.discountMode === 'SINGLE' ? 'selected' : ''}`} onClick={() => setConfig(c => ({ ...c, discountMode: 'SINGLE' }))}>
                <input type="radio" name="discountMode" checked={config.discountMode === 'SINGLE'} readOnly />
                <div><strong>Chỉ 1 loại</strong> — User chọn 1 trong các loại đang bật</div>
              </label>
              <label className={`loyalty-radio-card ${config.discountMode === 'STACK' ? 'selected' : ''}`} onClick={() => setConfig(c => ({ ...c, discountMode: 'STACK' }))}>
                <input type="radio" name="discountMode" checked={config.discountMode === 'STACK'} readOnly />
                <div><strong>Kết hợp nhiều</strong> — Áp dụng tuần tự theo thứ tự bên dưới</div>
              </label>
            </div>

            <h5 className="mb-3" style={{ fontFamily: 'inherit', fontSize: 16, fontWeight: 600 }}>Thứ tự ưu tiên & Bật/tắt (Kéo thả để sắp xếp)</h5>
            {config.discountOrder.map((type, idx) => (
              <div 
                key={type} 
                className="loyalty-order-row"
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={handleDrop}
                onDragEnd={() => setDraggedIdx(null)}
                style={{ 
                  cursor: 'grab', 
                  opacity: draggedIdx === idx ? 0.5 : 1,
                  backgroundColor: draggedIdx === idx ? '#f8f9fa' : 'transparent',
                  padding: '12px 15px',
                  border: '1px solid #eee',
                  marginBottom: '8px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <i className="fa fa-bars text-muted" />
                <i className={`fa ${DISCOUNT_TYPE_LABELS[type].icon}`} style={{ color: 'var(--admin-brand)', fontSize: 16, width: 20, textAlign: 'center' }} />
                <span style={{ flex: 1, fontWeight: 500 }}>{DISCOUNT_TYPE_LABELS[type].label}</span>
                
                <label className="switch m-0">
                  <input type="checkbox" checked={config.enabledTypes.includes(type)} onChange={() => toggleEnabled(type)} />
                  <span className="slider round"></span>
                </label>
              </div>
            ))}
            {config.discountMode === 'STACK' && (
              <div className="loyalty-info-box mt-3">
                <i className="fa fa-info-circle mr-2" />Khi STACK: giảm giá áp dụng tuần tự từ trên xuống. Mỗi loại tính trên giá đã giảm trước đó.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: ĐIỂM ── */}
      {activeTab === 'points' && (
        <div className="admin-paper fade-in">
          <div className="admin-paper-header">
            <h4>Cấu hình Tích điểm</h4>
            <AdminButton variant="primary" icon="save" label="Lưu cấu hình" onClick={saveConfig} disabled={saving} loading={saving} loadingLabel="Đang lưu..." />
          </div>
          <div style={{ padding: '30px' }}>
            <p className="text-muted mb-4" style={{ fontSize: 14 }}>Hệ thống tự động tích điểm dựa trên chi tiêu và cho phép khách hàng đổi điểm thành tiền giảm giá.</p>
            
            <h5 className="mb-3" style={{ fontSize: 16, fontWeight: 600 }}>Cơ chế Tích điểm</h5>
            <div className="row align-items-end mb-5">
              <div className="col-md-5">
                <AdminCurrencyInput 
                  label="Mỗi mức chi tiêu (VND)"
                  value={config.points.earnPer} 
                  onChange={e => setConfig(c => ({ ...c, points: { ...c.points, earnPer: e.target.value } }))} 
                />
              </div>
              <div className="col-md-2 text-center pb-4">
                <i className="fa fa-arrow-right text-muted" style={{ fontSize: 20 }} />
              </div>
              <div className="col-md-5">
                <AdminCurrencyInput 
                  label="Khách hàng nhận được (Điểm)"
                  value={config.points.earnRate} 
                  onChange={e => setConfig(c => ({ ...c, points: { ...c.points, earnRate: e.target.value } }))} 
                />
              </div>
            </div>

            <h5 className="mb-3" style={{ fontSize: 16, fontWeight: 600 }}>Giá trị Quy đổi</h5>
            <div className="row">
              <div className="col-md-6">
                <AdminCurrencyInput 
                  label="1 điểm tích lũy tương đương (VND)"
                  value={config.points.redeemRate} 
                  onChange={e => setConfig(c => ({ ...c, points: { ...c.points, redeemRate: e.target.value } }))} 
                  placeholder="VD: 100"
                />
              </div>
            </div>

            <div className="loyalty-info-box mt-4">
              <div className="d-flex align-items-start">
                <i className="fa fa-lightbulb-o mr-3 mt-1" style={{ fontSize: 18, color: 'var(--admin-brand)' }} />
                <div style={{ fontSize: 14, lineHeight: 1.7 }}>
                  <strong>Ví dụ thực tế:</strong><br/>
                  - Tích điểm: Chi <strong>{formatPrice(config.points.earnPer)}</strong> nhận <strong>{config.points.earnRate.toLocaleString()} điểm</strong>.<br/>
                  - Quy đổi: <strong>{config.points.earnRate.toLocaleString()} điểm</strong> sẽ giảm được <strong>{formatPrice(config.points.earnRate * config.points.redeemRate)}</strong> cho lần mua sau.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: MÃ GIẢM GIÁ ── */}
      {activeTab === 'promos' && (
        <div className="admin-paper fade-in">
          <div className="admin-paper-header">
            <h4>Mã giảm giá</h4>
            <AdminButton variant="primary" icon="plus" label="Tạo mã mới" onClick={openPromoCreate} />
          </div>
          {promosLoading ? <AdminLoadingBlock compact /> : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead><tr><th>Mã</th><th>Loại</th><th>Giá trị</th><th>Đã dùng</th><th>Hết hạn</th><th>Trạng thái</th><th width="120" className="text-center">Thao tác</th></tr></thead>
                <tbody>
                  {promos.length === 0 && <tr><td colSpan={7} className="text-center py-4" style={{ color: '#888' }}><i>Chưa có mã giảm giá.</i></td></tr>}
                  {promos.map(p => (
                    <tr key={p.id}>
                      <td><code style={{ fontWeight: 700, fontSize: 13 }}>{p.code}</code></td>
                      <td><span className={`badge ${p.type === 'PERCENTAGE' ? 'badge-info' : 'badge-warning'}`}>{p.type === 'PERCENTAGE' ? 'Phần trăm' : 'Cố định'}</span></td>
                      <td>{p.type === 'PERCENTAGE' ? `${p.value}%${p.maxDiscount ? ` (tối đa ${formatPrice(p.maxDiscount)})` : ''}` : formatPrice(p.value)}</td>
                      <td>{p.usedCount}{p.usageLimit ? `/${p.usageLimit}` : ''}</td>
                      <td>{p.endDate ? new Date(p.endDate).toLocaleDateString('vi-VN') : '—'}</td>
                      <td><span className={`badge ${p.isActive ? 'badge-success' : 'badge-secondary'}`}>{p.isActive ? 'Đang bật' : 'Đã tắt'}</span></td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center" style={{ gap: '4px' }}>
                          <AdminActionBtn variant="edit" onClick={() => openPromoEdit(p)} title="Sửa" />
                          <AdminActionBtn variant="delete" onClick={() => setDeleteTarget(p)} title="Xóa" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Promo Modal */}
      <AdminModal
        isOpen={promoModal}
        title={editingPromo ? 'Sửa mã giảm giá' : 'Tạo mã giảm giá'}
        onClose={() => setPromoModal(false)}
      >
        <div className="row">
          <div className="col-md-6 form-group mb-4">
            <label className="font-weight-bold mb-2">Mã {!editingPromo && <small className="text-muted font-weight-normal">(Để trống để tự sinh)</small>}</label>
            <input className="admin-form-control" value={promoForm.code} onChange={e => setPromoForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="VD: SALE50K" disabled={!!editingPromo} />
          </div>
          <div className="col-md-6 form-group mb-4">
            <label className="font-weight-bold mb-2">Loại <span className="text-danger">*</span></label>
            <select className="admin-form-control" value={promoForm.type} onChange={e => setPromoForm(f => ({ ...f, type: e.target.value }))}>
              <option value="PERCENTAGE">Phần trăm (%)</option>
              <option value="FIXED">Cố định (VND)</option>
            </select>
          </div>
          <div className="col-md-6 mb-2">
            {promoForm.type === 'PERCENTAGE' ? (
              <div className="form-group mb-4">
                <label className="font-weight-bold mb-2">Giá trị (%) <span className="text-danger">*</span></label>
                <input className="admin-form-control" type="number" value={promoForm.value} onChange={e => setPromoForm(f => ({ ...f, value: e.target.value }))} placeholder="VD: 10" />
              </div>
            ) : (
              <AdminCurrencyInput 
                label={<>Giá trị (VND) <span className="text-danger">*</span></>}
                value={promoForm.value}
                onChange={e => setPromoForm(f => ({ ...f, value: e.target.value }))}
                placeholder="VD: 50.000"
              />
            )}
          </div>
          {promoForm.type === 'PERCENTAGE' && (
            <div className="col-md-6 mb-2">
              <AdminCurrencyInput 
                label="Giảm tối đa (VND)"
                value={promoForm.maxDiscount}
                onChange={e => setPromoForm(f => ({ ...f, maxDiscount: e.target.value }))}
                placeholder="Để trống = không giới hạn"
              />
            </div>
          )}
          <div className="col-md-6 mb-2">
            <AdminCurrencyInput 
              label="Đơn tối thiểu (VND)"
              value={promoForm.minOrderValue}
              onChange={e => setPromoForm(f => ({ ...f, minOrderValue: e.target.value }))}
              placeholder="0 = không giới hạn"
            />
          </div>
          <div className="col-md-6 form-group mb-4">
            <label className="font-weight-bold mb-2">Giới hạn lượt dùng</label>
            <input className="admin-form-control" type="number" value={promoForm.usageLimit} onChange={e => setPromoForm(f => ({ ...f, usageLimit: e.target.value }))} placeholder="Để trống = không giới hạn" />
          </div>
          <div className="col-md-6 form-group mb-4">
            <AdminInput 
              label="Ngày bắt đầu" 
              type="date" 
              name="startDate"
              value={promoForm.startDate} 
              onChange={e => setPromoForm(f => ({ ...f, startDate: e.target.value }))} 
            />
          </div>
          <div className="col-md-6 form-group mb-4">
            <AdminInput 
              label="Ngày hết hạn" 
              type="date" 
              name="endDate"
              value={promoForm.endDate} 
              onChange={e => setPromoForm(f => ({ ...f, endDate: e.target.value }))} 
              error={promoForm.startDate && promoForm.endDate && new Date(promoForm.endDate) <= new Date(promoForm.startDate) ? 'Ngày hết hạn phải sau ngày bắt đầu' : ''}
            />
          </div>
          <div className="col-12 form-group mb-3 p-3 bg-light rounded d-flex justify-content-between align-items-center">
            <div>
              <h6 className="m-0 font-weight-bold">Kích hoạt mã ngay</h6>
              <small className="text-muted">Cho phép khách hàng sử dụng mã này</small>
            </div>
            <label className="switch m-0">
              <input type="checkbox" checked={promoForm.isActive} onChange={e => setPromoForm(f => ({ ...f, isActive: e.target.checked }))} />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
        <div className="d-flex justify-content-end border-top pt-3 mt-3">
          <AdminButton variant="secondary" onClick={() => setPromoModal(false)} disabled={promoSaving} label="Hủy bỏ" />
          <AdminButton variant="primary" onClick={savePromo} disabled={promoSaving} loading={promoSaving} label={editingPromo ? 'Lưu Thay Đổi' : 'Tạo Mới'} className="ml-2" />
        </div>
      </AdminModal>

      <AdminConfirmModal
        isOpen={!!deleteTarget}
        title="Xóa mã giảm giá"
        message={`Bạn có chắc muốn xóa mã "${deleteTarget?.code}"?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
};
export default AdminLoyalty;
