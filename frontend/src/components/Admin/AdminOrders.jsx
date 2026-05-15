import React, { useEffect, useState } from 'react';
import Pagination from '../Shared/Pagination';
import { toast } from 'react-toastify';
import { getAllOrders, confirmOrder, rejectOrder } from '../../services/api';
import { formatPrice, getOrderStatusBadge } from '../../utils/formatters';
import AdminLoadingBlock from './AdminLoadingBlock';
import AdminButton from './Shared/AdminButton';
import AdminActionBtn from './Shared/AdminActionBtn';
import AdminTable from './AdminTable';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchOrders = async () => {
    try {
      const data = await getAllOrders();
      const sortedData = (data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sortedData);
    } catch (err) {
      toast.error('Lỗi khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleConfirm = async () => {
    if (!selectedOrder) return;
    setProcessing(true);
    try {
      await confirmOrder(selectedOrder.id, adminNote);
      toast.success(`Đã xác nhận đơn hàng ${selectedOrder.orderCode}!`);
      setSelectedOrder(null);
      setAdminNote('');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi khi xác nhận đơn');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedOrder) return;
    if (!adminNote.trim()) {
      toast.warn('Vui lòng nhập lý do từ chối.');
      return;
    }
    setProcessing(true);
    try {
      await rejectOrder(selectedOrder.id, adminNote);
      toast.info(`Đã từ chối đơn hàng ${selectedOrder.orderCode}.`);
      setSelectedOrder(null);
      setAdminNote('');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi khi từ chối đơn');
    } finally {
      setProcessing(false);
    }
  };

  const filteredOrders = filter === 'ALL' 
    ? orders 
    : orders.filter(o => o.status === filter);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const displayStatus = (status) => {
    switch(status) {
      case 'PENDING': return 'Đang chờ';
      case 'AWAITING_CONFIRM': return 'Chờ đối soát';
      case 'CONFIRMED': return 'Thành công';
      case 'REJECTED': return 'Thất bại';
      default: return status;
    }
  };

  const statusCounts = {
    ALL: orders.length,
    PENDING: orders.filter(o => o.status === 'PENDING').length,
    AWAITING_CONFIRM: orders.filter(o => o.status === 'AWAITING_CONFIRM').length,
    CONFIRMED: orders.filter(o => o.status === 'CONFIRMED').length,
    REJECTED: orders.filter(o => o.status === 'REJECTED').length,
  };

  if (loading) return <AdminLoadingBlock rows={6} />;

  const columns = [
    { label: 'Mã Đơn', render: order => <code style={{ fontSize: '13px' }}>{order.orderCode}</code> },
    { label: 'Người Dùng', render: order => (
      <div>
        <div style={{ fontWeight: '600' }}>{order.user?.fullName}</div>
        <small style={{ color: '#88929e' }}>{order.user?.email}</small>
      </div>
    )},
    { label: 'Khóa Học', render: order => order.program?.title },
    { label: 'Số Tiền', render: order => <span style={{ fontWeight: '600' }}>{formatPrice(order.amount)}</span> },
    { label: 'Trạng Thái', render: order => (
      <span className={`badge ${getOrderStatusBadge(order.status).className}`} style={{ fontSize: '11px' }}>
        {displayStatus(order.status)}
      </span>
    )},
    { label: 'Phương Thức', render: order => (
      order.paymentMethod === 'VNPAY' ? (
        <span className="badge bg-success text-white" style={{ fontSize: '10px' }}>VNPay</span>
      ) : order.paidViaWebhook ? (
        <span className="badge bg-info text-white" style={{ fontSize: '10px' }}>Webhook</span>
      ) : order.proofImage ? (
        <span className="badge bg-secondary text-white" style={{ fontSize: '10px' }}>Manual</span>
      ) : (
        <span style={{ color: '#aaa', fontSize: '12px' }}>—</span>
      )
    )},
    { label: 'Ngày', render: order => <small>{new Date(order.createdAt).toLocaleDateString()}</small> }
  ];

  const customActions = (order) => (
    <AdminActionBtn 
      variant="view" 
      onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setAdminNote(''); }} 
      title="Xem chi tiết" 
    />
  );

  const filterTabs = (
    <div className="d-flex" style={{ gap: '8px', flexWrap: 'wrap' }}>
      {Object.entries(statusCounts).map(([key, count]) => (
        <AdminButton
          key={key}
          variant={filter === key ? 'dark' : 'secondary'}
          outline={filter !== key}
          size="sm"
          onClick={() => { setFilter(key); setCurrentPage(1); }}
          style={{ borderRadius: '20px', padding: '6px 16px' }}
          label={`${key === 'ALL' ? 'Tất cả' : displayStatus(key)} (${count})`}
        />
      ))}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div className="admin-content-header">
        <h2>Quản Lý Đơn Hàng</h2>
        <p style={{ color: '#88929e' }}>Kiểm tra và quản lý thanh toán Premium Content</p>
      </div>

      <AdminTable 
        title="Danh sách Đơn Hàng"
        columns={columns}
        data={filteredOrders}
        loading={loading}
        filters={filterTabs}
        customActions={customActions}
        onRowClick={(order) => { setSelectedOrder(order); setAdminNote(''); }}
      />

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h5 style={{ margin: 0 }}>Chi tiết đơn hàng — {selectedOrder.orderCode}</h5>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="admin-modal-close-icon-only"
                style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', fontSize: '20px' }}
              >
                <i className="fa fa-times text-muted"></i>
              </button>
            </div>
            <div className="admin-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {/* Order Info */}
              <div className="row mb-3">
                <div className="col-6">
                  <small style={{ color: '#88929e' }}>Học viên</small>
                  <div style={{ fontWeight: '600' }}>{selectedOrder.user?.fullName}</div>
                  <small>{selectedOrder.user?.email}</small>
                </div>
                <div className="col-6">
                  <small style={{ color: '#88929e' }}>Khóa học</small>
                  <div style={{ fontWeight: '600' }}>{selectedOrder.program?.title}</div>
                  <small>{formatPrice(selectedOrder.amount)}</small>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-6">
                  <small style={{ color: '#88929e' }}>Trạng thái</small>
                  <div>
                    <span className={`badge ${getOrderStatusBadge(selectedOrder.status).className}`}>
                      {displayStatus(selectedOrder.status)}
                    </span>
                  </div>
                </div>
                <div className="col-6">
                  <small style={{ color: '#88929e' }}>Nội dung chuyển khoản</small>
                  <div><code>{selectedOrder.transferContent}</code></div>
                </div>
              </div>

              {/* Transaction Reference */}
              {selectedOrder.transactionRef && (
                <div className="mb-3">
                  <small style={{ color: '#88929e' }}>Mã giao dịch (TxnRef)</small>
                  <div style={{ fontWeight: '600' }}>{selectedOrder.transactionRef}</div>
                </div>
              )}

              {/* Proof Image */}
              {selectedOrder.proofImage && (
                <div className="mb-3">
                  <small style={{ color: '#88929e' }}>Ảnh biên lai (Proof)</small>
                  <div className="mt-1">
                    <img 
                      src={selectedOrder.proofImage.startsWith('http') ? selectedOrder.proofImage : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}${selectedOrder.proofImage}`}
                      alt="Payment proof"
                      style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer' }}
                      onClick={() => window.open(selectedOrder.proofImage.startsWith('http') ? selectedOrder.proofImage : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}${selectedOrder.proofImage}`, '_blank')}
                    />
                  </div>
                </div>
              )}

              {selectedOrder.paidViaWebhook && (
                <div className="alert alert-info small mb-3">
                  <i className="fa fa-bolt mr-1"></i> Đơn hàng này được tự động xác nhận qua {selectedOrder.paymentMethod === 'VNPAY' ? 'VNPay' : 'webhook'}.
                </div>
              )}

              {/* VNPay Gateway Info */}
              {selectedOrder.paymentMethod === 'VNPAY' && (
                <div className="mb-3 p-3" style={{ backgroundColor: 'rgba(40,167,69,0.05)', borderRadius: '8px', border: '1px solid rgba(40,167,69,0.15)' }}>
                  <small style={{ color: '#88929e', fontWeight: '600' }}>Thông tin cổng VNPay</small>
                  <div className="row mt-2" style={{ fontSize: '13px' }}>
                    <div className="col-6 mb-1">
                      <small style={{ color: '#88929e' }}>Mã giao dịch API</small>
                      <div><code>{selectedOrder.gatewayTxnRef || '—'}</code></div>
                    </div>
                    <div className="col-6 mb-1">
                      <small style={{ color: '#88929e' }}>Mã GD Tại Ngân Hàng</small>
                      <div><code>{selectedOrder.gatewayTransactionNo || '—'}</code></div>
                    </div>
                    <div className="col-6 mb-1">
                      <small style={{ color: '#88929e' }}>Mã Phản Hồi VNPay</small>
                      <div><code>{selectedOrder.gatewayResponseCode || '—'}</code></div>
                    </div>
                    <div className="col-6 mb-1">
                      <small style={{ color: '#88929e' }}>Thời gian thanh toán</small>
                      <div>{selectedOrder.paidAt ? new Date(selectedOrder.paidAt).toLocaleString() : '—'}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* VAT Invoice Request Info */}
              {selectedOrder.requiresInvoice && (
                <div className="mb-3 p-3" style={{ backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeeba' }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span style={{ color: '#856404', fontWeight: '600' }}><i className="fa fa-file-text-o mr-1"></i> Yêu cầu xuất hóa đơn VAT</span>
                    <AdminButton 
                      variant="dark" 
                      outline 
                      size="sm"
                      onClick={() => {
                        const txt = `Mã số thuế: ${selectedOrder.taxCode}\nTên công ty: ${selectedOrder.companyName}\nĐịa chỉ: ${selectedOrder.companyAddress}\nEmail: ${selectedOrder.invoiceEmail}`;
                        navigator.clipboard.writeText(txt);
                        toast.success('Đã copy thông tin hóa đơn');
                      }}
                      icon="copy"
                      label="Copy"
                      style={{ padding: '0 8px', height: '24px' }}
                    />
                  </div>
                  <div className="row mt-2" style={{ fontSize: '13px', color: '#856404' }}>
                    <div className="col-6 mb-1">
                      <small style={{ opacity: 0.8 }}>Mã số thuế</small>
                      <div style={{ fontWeight: '600' }}>{selectedOrder.taxCode}</div>
                    </div>
                    <div className="col-6 mb-1">
                      <small style={{ opacity: 0.8 }}>Tên công ty</small>
                      <div style={{ fontWeight: '600' }}>{selectedOrder.companyName}</div>
                    </div>
                    <div className="col-12 mb-1">
                      <small style={{ opacity: 0.8 }}>Địa chỉ</small>
                      <div style={{ fontWeight: '600' }}>{selectedOrder.companyAddress}</div>
                    </div>
                    <div className="col-12 mb-1">
                      <small style={{ opacity: 0.8 }}>Email nhận hóa đơn</small>
                      <div style={{ fontWeight: '600' }}>{selectedOrder.invoiceEmail}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Actions */}
              {['PENDING', 'AWAITING_CONFIRM'].includes(selectedOrder.status) && (
                <>
                  <hr />
                  <div className="mb-3">
                    <label style={{ fontWeight: '600' }}>Ghi chú Admin</label>
                    <textarea
                      className="form-control mt-1"
                      rows="2"
                      value={adminNote}
                      onChange={e => setAdminNote(e.target.value)}
                      placeholder="Ghi chú tùy chọn (Bắt buộc nếu từ chối đơn hàng)..."
                    />
                  </div>
                  <div className="d-flex justify-content-end" style={{ gap: '10px' }}>
                    <AdminButton variant="danger" icon="times" label="Từ chối" onClick={handleReject} loading={processing} loadingLabel="Đang xử lý" disabled={processing} />
                    <AdminButton variant="success" icon="check" label="Xác nhận Thanh toán" onClick={handleConfirm} loading={processing} loadingLabel="Đang xử lý" disabled={processing} />
                  </div>
                </>
              )}

              {selectedOrder.adminNote && selectedOrder.status !== 'AWAITING_CONFIRM' && (
                <div className="mt-3 p-2" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                  <small style={{ color: '#88929e' }}>Ghi chú của Admin:</small>
                  <div>{selectedOrder.adminNote}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
