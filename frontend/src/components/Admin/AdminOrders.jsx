import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getAllOrders, confirmOrder, rejectOrder } from '../../services/api';
import { formatPrice, getOrderStatusBadge } from '../../utils/formatters';
import AdminLoadingBlock from './AdminLoadingBlock';
import AdminButton from './Shared/AdminButton';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const fetchOrders = async () => {
    try {
      const data = await getAllOrders();
      setOrders(data);
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

  const statusCounts = {
    ALL: orders.length,
    PENDING: orders.filter(o => o.status === 'PENDING').length,
    AWAITING_CONFIRM: orders.filter(o => o.status === 'AWAITING_CONFIRM').length,
    CONFIRMED: orders.filter(o => o.status === 'CONFIRMED').length,
    REJECTED: orders.filter(o => o.status === 'REJECTED').length,
  };

  if (loading) return <AdminLoadingBlock rows={6} />;

  return (
    <div>
      <div className="admin-content-header">
        <h2>Quản Lý Đơn Hàng</h2>
        <p style={{ color: '#88929e' }}>Kiểm tra và quản lý thanh toán Premium Content</p>
      </div>

      {/* Filter Tabs */}
      <div className="d-flex mb-4" style={{ gap: '8px', flexWrap: 'wrap' }}>
        {Object.entries(statusCounts).map(([key, count]) => (
          <button
            key={key}
            className={`btn btn-sm ${filter === key ? 'btn-dark' : 'btn-outline-secondary'}`}
            onClick={() => setFilter(key)}
            style={{ borderRadius: '20px', padding: '6px 16px' }}
          >
            {key === 'ALL' ? 'All' : key.replace('_', ' ')} ({count})
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="admin-paper">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order Code</th>
                <th>User</th>
                <th>Course</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Method</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-4" style={{ color: '#88929e' }}>No orders found</td></tr>
              ) : (
                filteredOrders.map(order => {
                  const badge = getOrderStatusBadge(order.status);
                  return (
                    <tr key={order.id}>
                      <td><code style={{ fontSize: '13px' }}>{order.orderCode}</code></td>
                      <td>
                        <div style={{ fontWeight: '600' }}>{order.user?.fullName}</div>
                        <small style={{ color: '#88929e' }}>{order.user?.email}</small>
                      </td>
                      <td>{order.program?.title}</td>
                      <td style={{ fontWeight: '600' }}>{formatPrice(order.amount)}</td>
                      <td>
                        <span className={`badge ${badge.className}`} style={{ fontSize: '11px' }}>
                          {badge.label}
                        </span>
                      </td>
                      <td>
                        {order.paymentMethod === 'VNPAY' ? (
                          <span className="badge bg-success text-white" style={{ fontSize: '10px' }}>VNPay</span>
                        ) : order.paidViaWebhook ? (
                          <span className="badge bg-info text-white" style={{ fontSize: '10px' }}>Webhook</span>
                        ) : order.proofImage ? (
                          <span className="badge bg-secondary text-white" style={{ fontSize: '10px' }}>Manual</span>
                        ) : (
                          <span style={{ color: '#aaa', fontSize: '12px' }}>—</span>
                        )}
                      </td>
                      <td><small>{new Date(order.createdAt).toLocaleDateString()}</small></td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline-info rounded-pill"
                          onClick={() => { setSelectedOrder(order); setAdminNote(''); }}
                        >
                          <i className="fa fa-eye"></i> View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                      {getOrderStatusBadge(selectedOrder.status).label}
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
                    <AdminButton variant="danger" icon="times" label="Từ chối" onClick={handleReject} disabled={processing} />
                    <AdminButton variant="success" icon="check" label="Xác nhận Thanh toán" onClick={handleConfirm} disabled={processing} />
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
