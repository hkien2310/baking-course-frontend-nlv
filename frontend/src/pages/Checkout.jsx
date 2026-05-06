import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import './Checkout.css';
import { toast } from 'react-toastify';
import PageTitle from '../components/Shared/PageTitle';
import { getProgramBySlug, getPaymentConfig, createOrder, getOrderById, submitOrderProof, cancelOrder, uploadImage, createVnpayPaymentUrl, getMyOrders } from '../services/api';
import { formatPrice, getOrderStatusBadge } from '../utils/formatters';
import { ROUTES } from '../constants/routes';
import { useTranslation } from '../i18n/LanguageContext';

const STEPS = {
  SUMMARY: 1,
  STATUS: 2
};

const Checkout = ({ user }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  const { t } = useTranslation();

  const [program, setProgram] = useState(null);
  const [order, setOrder] = useState(null);
  const [step, setStep] = useState(STEPS.SUMMARY);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('VNPAY');
  const [usePoints, setUsePoints] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  
  const [requiresInvoice, setRequiresInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    taxCode: '',
    companyName: '',
    companyAddress: '',
    invoiceEmail: user?.email || ''
  });

  useEffect(() => {
    const init = async () => {
      try {
        const prog = await getProgramBySlug(slug);
        setProgram(prog);

        // If already purchased, redirect to program detail
        if (prog.hasPurchased) {
          toast.info(t('checkout.toast.orderCreated') || 'You already own this course!');
          navigate(ROUTES.PROGRAM_DETAIL(slug));
          return;
        }

        // Check if there's an existing active order
        if (prog.orderStatus === 'PENDING' || prog.orderStatus === 'AWAITING_CONFIRM' || prog.orderStatus === 'REJECTED') {
          try {
            const userOrders = await getMyOrders();
            const existingOrder = userOrders.find(o => o.programId === prog.id && ['PENDING', 'AWAITING_CONFIRM', 'REJECTED'].includes(o.status));
            
            if (existingOrder) {
              setOrder(existingOrder);
              setStep(STEPS.STATUS);
            }
          } catch (err) {
            console.error('Failed to fetch existing order', err);
          }
        }
      } catch (err) {
        console.error('Checkout init error:', err);
        toast.error(t('checkout.toast.orderCreateFailed') || 'Failed to load checkout information.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [slug, navigate, t]);

  const handleCreateOrder = async () => {
    if (requiresInvoice) {
      const { taxCode, companyName, companyAddress, invoiceEmail } = invoiceData;
      if (!taxCode?.trim() || !companyName?.trim() || !companyAddress?.trim() || !invoiceEmail?.trim()) {
        toast.error('Vui lòng điền đầy đủ thông tin xuất hóa đơn (Mã số thuế, Tên công ty, Địa chỉ và Email).');
        // Scroll to invoice section to notify user
        const section = document.querySelector('.invoice-section');
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await createOrder({ 
        programId: program.id, 
        classSessionId: sessionId,
        requiresInvoice,
        ...invoiceData
      });
      setOrder(res.order);
      // Immediately call VNPay
      const vnpayRes = await createVnpayPaymentUrl(res.order.id);
      window.location.href = vnpayRes.paymentUrl;
    } catch (err) {
      toast.error(err.response?.data?.error || t('checkout.toast.orderCreateFailed'));
      setSubmitting(false);
    }
  };

  const handleVnpayPayment = async () => {
    if (!order) return;
    setSubmitting(true);
    try {
      const res = await createVnpayPaymentUrl(order.id);
      // Redirect to VNPay payment page
      window.location.href = res.paymentUrl;
    } catch (err) {
      toast.error(err.response?.data?.error || t('checkout.toast.vnpayFailed'));
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await cancelOrder(order.id);
      toast.info(t('checkout.toast.orderCancelled'));
      navigate(ROUTES.PROGRAM_DETAIL(slug));
    } catch (err) {
      toast.error(t('checkout.toast.cancelFailed') || 'Failed to cancel order.');
    }
  };

  const handleRefreshStatus = async () => {
    if (!order) return;
    try {
      const updated = await getOrderById(order.id);
      setOrder(updated);
      if (updated.status === 'CONFIRMED') {
        toast.success(t('checkout.toast.paymentConfirmed') || 'Payment confirmed');
        setStep(STEPS.STATUS);
      } else if (updated.status === 'REJECTED' || updated.status === 'CANCELLED') {
        toast.warn('Thanh toán thất bại hoặc đã hủy.');
        setStep(STEPS.STATUS);
      }
    } catch (err) {
      console.error('refresh error', err);
    }
  };

  if (loading) {
    return (
      <div className="text-center" style={{ padding: '150px 0' }}>
        <h2>{t('checkout.loading')}</h2>
        <div className="spinner-border" role="status"></div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="text-center" style={{ padding: '150px 0' }}>
        <h2>{t('checkout.notFound')}</h2>
      </div>
    );
  }

  const statusBadge = order ? getOrderStatusBadge(order.status) : null;
  const stepLabels = [
    { num: 1, label: t('checkout.steps.summary') || 'Xác nhận đơn' },
    { num: 2, label: t('checkout.steps.status') || 'Trạng thái' }
  ];

  return (
    <>
      <PageTitle 
        title={t('checkout.pageTitle') || 'Thanh Toán'}
        breadcrumbs={[
          { label: t('header.home') || 'Trang Chủ', link: '/' },
          { label: t('header.programs') || 'Khóa Học', link: ROUTES.PROGRAM },
          { label: program.title, link: ROUTES.PROGRAM_DETAIL(slug) },
          { label: t('checkout.pageTitle') || 'Thanh Toán' }
        ]}
      />

      <section className="ls s-py-60 s-py-lg-100">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">

              {/* Progress Steps */}
              <div className="checkout-steps d-flex justify-content-center mb-5">
                {stepLabels.map(s => (
                  <div key={s.num} className={`checkout-step ${step >= s.num ? 'active' : ''} ${step === s.num ? 'current' : ''}`}>
                    <div className="step-number">{s.num}</div>
                    <div className="step-label">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Helper for image src */}
              {(() => {
                window.imgSrc = (src) => {
                  if (!src) return `${import.meta.env.BASE_URL}images/gallery/09.jpg`;
                  if (src.startsWith('http') || src.startsWith(import.meta.env.BASE_URL)) return src;
                  return `${import.meta.env.BASE_URL}${src.replace(/^\//, '')}`;
                };
                return null;
              })()}

              {/* STEP 1: Order Summary */}
              {step === STEPS.SUMMARY && (
                <form className="checkout-form" onSubmit={(e) => { e.preventDefault(); handleCreateOrder(); }}>
                  <div className="checkout-card bordered p-4 p-lg-5">
                    <h4 className="mb-4"><i className="fa fa-shopping-cart color-main mr-2"></i> {t('checkout.orderSummary')}</h4>
                    
                    <div className="d-flex align-items-start mb-4" style={{ gap: '20px' }}>
                      {program.thumbnail && (
                        <img 
                          src={window.imgSrc(program.thumbnail)} 
                          alt={program.title} 
                          style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                      )}
                      <div>
                        <h5 className="mb-1">{program.title}</h5>
                        {program.chief && <p className="small-text color-main mb-1">{t('programDetail.instructor') || 'Giảng viên'}: {program.chief.name}</p>}
                        <p className="text-muted small mb-0">{program.description?.substring(0, 120)}...</p>
                      </div>
                    </div>

                    <div className="divider-15"></div>

                    <div className="discount-code-section mb-4">
                      <div className="input-group">
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Nhập mã giảm giá..." 
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value)}
                          style={{ height: '44px' }}
                        />
                        <div className="input-group-append">
                          <button 
                            className="btn btn-maincolor" 
                            type="button"
                            onClick={() => {
                              if (discountCode) toast.info('Tính năng mã giảm giá đang được cập nhật!');
                            }}
                            style={{ margin: 0, height: '44px', lineHeight: '44px', padding: '0 20px' }}
                          >
                            Áp dụng
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="summary-list" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '20px' }}>
                      {(() => {
                        const originalPrice = program.price || 0;
                        const salePrice = program.salePrice && program.price > program.salePrice ? program.salePrice : originalPrice;
                        const promoDiscount = originalPrice - salePrice;
                        const finalPrice = salePrice - appliedDiscount;
                        const vatAmount = Math.round(finalPrice * 0.08);
                        const totalPayment = finalPrice + vatAmount;
                        
                        return (
                          <>
                            <div className="d-flex justify-content-between mb-2">
                              <span>Tạm tính</span>
                              <span>{formatPrice(originalPrice)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                              <span>Giảm giá khuyến mại</span>
                              <span>{promoDiscount > 0 ? `- ${formatPrice(promoDiscount)}` : '0 đ'}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                              <span>Giảm giá thành viên</span>
                              <span>0 đ</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <span className="d-flex align-items-center" style={{ gap: '8px' }}>
                                Tích điểm (*)
                                <label className="switch mb-0">
                                  <input type="checkbox" checked={usePoints} onChange={(e) => setUsePoints(e.target.checked)} />
                                  <span className="slider round"></span>
                                </label>
                              </span>
                              <span>0 đ</span>
                            </div>
                            
                            <div className="divider-15" style={{borderTop: '1px solid #ddd'}}></div>
                            
                            <div className="d-flex justify-content-between mb-2 mt-3">
                              <span style={{ fontSize: '16px', fontWeight: '600' }}>Tổng cộng</span>
                              <span style={{ fontSize: '16px', fontWeight: '600' }}>
                                {formatPrice(finalPrice)}
                              </span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                              <span>VAT 8%</span>
                              <span>{formatPrice(vatAmount)}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mt-3">
                              <span style={{ fontSize: '18px', fontWeight: '600' }}>Tiền thanh toán</span>
                              <span style={{ fontSize: '24px', fontWeight: '700', color: 'var(--colorMain)' }}>
                                {formatPrice(totalPayment)}
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    <div className="divider-30"></div>

                    {/* VAT Form Section */}
                    <div className="invoice-section mb-4 p-4" style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                      <h5 className="mb-2" style={{fontSize: '16px'}}>Thông tin xuất hóa đơn</h5>
                      <div className="p-2 mb-3" style={{ backgroundColor: '#fff3cd', color: '#856404', borderRadius: '4px', fontSize: '14px' }}>
                        Học viên cần xuất hoá đơn VAT lưu ý điền đủ thông tin để xuất hoá đơn sau khi thanh toán xong
                      </div>
                      <div className="d-flex mb-3 align-items-start" style={{ gap: '10px' }}>
                        <input type="radio" name="invoice" id="noInvoice" checked={!requiresInvoice} onChange={() => setRequiresInvoice(false)} style={{ marginTop: '5px', cursor: 'pointer', width: '16px', height: '16px' }} />
                        <span className="d-none"></span>
                        <label htmlFor="noInvoice" style={{ cursor: 'pointer', margin: 0, textTransform: 'uppercase', fontSize: '15px' }}>
                          Không yêu cầu
                          <span className="text-muted" style={{ textTransform: 'none', display: 'block', marginTop: '5px' }}>Hóa đơn sẽ được xuất dựa trên thông tin đơn hàng của bạn</span>
                        </label>
                      </div>
                      <div className="d-flex mb-3 align-items-start" style={{ gap: '10px' }}>
                        <input type="radio" name="invoice" id="yesInvoice" checked={requiresInvoice} onChange={() => setRequiresInvoice(true)} style={{ marginTop: '5px', cursor: 'pointer', width: '16px', height: '16px' }} />
                        <span className="d-none"></span>
                        <label htmlFor="yesInvoice" style={{ cursor: 'pointer', margin: 0, textTransform: 'uppercase', fontSize: '15px' }}>
                          Xuất hóa đơn
                        </label>
                      </div>
                      
                      {requiresInvoice && (
                        <div className="invoice-form-fields p-3" style={{backgroundColor: '#f8f9fa', borderRadius: '8px'}}>
                          <div className="form-group mb-3">
                            <label>Mã số thuế <span className="text-danger">*</span></label>
                            <input type="text" className="form-control" placeholder="VD: 0123456789" value={invoiceData.taxCode} onChange={e => setInvoiceData({...invoiceData, taxCode: e.target.value})} required />
                          </div>
                          <div className="form-group mb-3">
                            <label>Tên công ty <span className="text-danger">*</span></label>
                            <input type="text" className="form-control" placeholder="VD: Công ty TNHH ABC" value={invoiceData.companyName} onChange={e => setInvoiceData({...invoiceData, companyName: e.target.value})} required />
                          </div>
                          <div className="form-group mb-3">
                            <label>Địa chỉ <span className="text-danger">*</span></label>
                            <input type="text" className="form-control" placeholder="VD: 123 Đường ABC, Quận XYZ, TP.HCM" value={invoiceData.companyAddress} onChange={e => setInvoiceData({...invoiceData, companyAddress: e.target.value})} required />
                          </div>
                          <div className="form-group mb-0">
                            <label>Email nhận hóa đơn <span className="text-danger">*</span></label>
                            <input type="email" className="form-control" placeholder="nguyenminhnguyet@gmail.com" value={invoiceData.invoiceEmail} onChange={e => setInvoiceData({...invoiceData, invoiceEmail: e.target.value})} required />
                            <small className="text-muted mt-1 d-block">Hóa đơn sẽ được gửi qua email này sau khi xuất thành công</small>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-center">
                      <button 
                        type="submit"
                        className="btn btn-maincolor btn-lg px-5" 
                        disabled={submitting}
                      >
                        {submitting ? (
                          <><span className="spinner-border spinner-border-sm mr-2"></span> Đang kết nối VNPay...</>
                        ) : (
                          <><i className="fa fa-lock mr-2"></i> Trả tiền qua VNPay</>
                        )}
                      </button>
                      <p className="text-muted small mt-3">
                        <i className="fa fa-shield mr-1"></i> Thanh toán an toàn qua cổng VNPay
                      </p>
                    </div>
                  </div>
                </form>
              )}

              {/* STEP 4: Status */}
              {step === STEPS.STATUS && order && (
                <div className="checkout-card bordered p-4 p-lg-5 text-center">
                  {order.status === 'AWAITING_CONFIRM' && (
                    <>
                      <div className="mb-4">
                        <i className="fa fa-clock-o" style={{ fontSize: '60px', color: '#17a2b8' }}></i>
                      </div>
                      <h4 className="mb-3">Awaiting Confirmation</h4>
                      <p className="text-muted mb-4">
                        {t('checkout.status.awaitingMsg')}
                      </p>
                      <p className="mb-3">
                        <span className={`badge ${statusBadge?.className}`} style={{ fontSize: '14px', padding: '8px 16px' }}>
                          {statusBadge?.label}
                        </span>
                      </p>
                      <div className="d-flex justify-content-center" style={{ gap: '12px' }}>
                        <button className="btn btn-outline-dark" onClick={handleRefreshStatus}>
                          <i className="fa fa-refresh mr-1"></i> Check Status
                        </button>
                        <Link to={ROUTES.PROGRAM_DETAIL(slug)} className="btn btn-outline-maincolor">
                          <i className="fa fa-arrow-left mr-1"></i> {t('checkout.status.viewCourse')}
                        </Link>
                      </div>
                    </>
                  )}

                  {order.status === 'CONFIRMED' && (
                    <>
                      <div className="mb-4">
                        <i className="fa fa-check-circle" style={{ fontSize: '80px', color: '#28a745' }}></i>
                      </div>
                      <h3 className="mb-3" style={{ color: '#28a745' }}>🎉 Payment Confirmed!</h3>
                      <p className="text-muted mb-4">{t('checkout.status.confirmedMsg')}</p>
                      <Link to={ROUTES.PROGRAM_DETAIL(slug)} className="btn btn-maincolor btn-lg px-5">
                        <i className="fa fa-play-circle mr-2"></i> {t('checkout.status.viewCourse')}
                      </Link>
                    </>
                  )}

                  {order.status === 'REJECTED' && (
                    <>
                      <div className="mb-4">
                        <i className="fa fa-times-circle" style={{ fontSize: '60px', color: '#dc3545' }}></i>
                      </div>
                      <h4 className="mb-3" style={{ color: '#dc3545' }}>Thanh toán thất bại</h4>
                      <p className="text-muted mb-2">
                        {order.adminNote || 'Đơn hàng đã bị hủy hoặc thanh toán thất bại qua cổng VNPay.'}
                      </p>
                      <button className="btn btn-maincolor mt-3" onClick={handleVnpayPayment} disabled={submitting}>
                        {submitting ? '...' : <><i className="fa fa-refresh mr-1"></i> Thử lại (Pay over VNPay)</>}
                      </button>
                    </>
                  )}

                  {order.status === 'PENDING' && (
                    <>
                      <div className="mb-4">
                        <i className="fa fa-hourglass-half" style={{ fontSize: '60px', color: '#ffc107' }}></i>
                      </div>
                      <h4 className="mb-3">Thanh toán đang chờ</h4>
                      <div className="d-flex justify-content-center" style={{ gap: '15px' }}>
                        <button className="btn btn-maincolor" onClick={handleVnpayPayment} disabled={submitting}>
                          {submitting ? '...' : <><i className="fa fa-arrow-right mr-1"></i> Thanh toán qua VNPay ngay</>}
                        </button>
                        <button className="btn btn-outline-dark" onClick={handleCancel} disabled={submitting}>
                          <i className="fa fa-times mr-1"></i> Hủy đơn hàng
                        </button>
                      </div>
                    </>
                  )}

                  <div className="mt-4 p-4 text-left" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <ul className="list-unstyled mb-0" style={{ fontSize: '14px', lineHeight: '1.8' }}>
                      <li><strong style={{ display: 'inline-block', width: '120px' }}>{t('checkout.status.orderCode')}:</strong> {order.orderCode}</li>
                      <li><strong style={{ display: 'inline-block', width: '120px' }}>{t('checkout.total')}:</strong> {formatPrice(order.amount)}</li>
                      <li><strong style={{ display: 'inline-block', width: '120px' }}>Ngày tạo:</strong> {new Date(order.createdAt).toLocaleString()}</li>
                      {order.paymentMethod && (
                        <li>
                          <strong style={{ display: 'inline-block', width: '120px' }}>Phương thức:</strong> 
                          {order.paymentMethod === 'VNPAY' ? t('checkout.vnpay.title') : t('checkout.manual.title')}
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      <style>{`
        .checkout-steps {
          gap: 0;
        }
        .checkout-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          flex: 1;
        }
        .checkout-step:not(:last-child)::after {
          content: '';
          position: absolute;
          top: 18px;
          left: 55%;
          width: 90%;
          height: 2px;
          background: #e0e0e0;
        }
        .checkout-step.active:not(:last-child)::after {
          background: var(--colorMain, #c19a5b);
        }
        .step-number {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          background: #e0e0e0;
          color: #999;
          position: relative;
          z-index: 2;
          transition: all 0.3s ease;
        }
        .checkout-step.active .step-number {
          background: var(--colorMain, #c19a5b);
          color: #fff;
        }
        .checkout-step.current .step-number {
          box-shadow: 0 0 0 4px rgba(193, 154, 91, 0.25);
        }
        .step-label {
          font-size: 12px;
          margin-top: 6px;
          color: #999;
          font-weight: 500;
        }
        .checkout-step.active .step-label {
          color: #333;
          font-weight: 600;
        }
        .checkout-card {
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        }
        .payment-method-card:hover {
          border-color: var(--colorMain, #c19a5b) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        
        /* Switch styles */
        .switch {
          position: relative;
          display: inline-block;
          width: 40px;
          height: 20px;
        }
        .switch input { 
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          -webkit-transition: .4s;
          transition: .4s;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          -webkit-transition: .4s;
          transition: .4s;
        }
        input:checked + .slider {
          background-color: var(--colorMain, #c19a5b);
        }
        input:focus + .slider {
          box-shadow: 0 0 1px var(--colorMain, #c19a5b);
        }
        input:checked + .slider:before {
          -webkit-transform: translateX(20px);
          -ms-transform: translateX(20px);
          transform: translateX(20px);
        }
        .slider.round {
          border-radius: 34px;
        }
        .slider.round:before {
          border-radius: 50%;
        }
      `}
      </style>
    </>
  );
};

export default Checkout;
