import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import './Checkout.css';
import { toast } from 'react-toastify';
import PageTitle from '../components/Shared/PageTitle';
import PageLoading from '../components/Shared/PageLoading';
import { getProgramBySlug, getPaymentConfig, createOrder, getOrderById, submitOrderProof, cancelOrder, uploadImage, createVnpayPaymentUrl, getMyOrders, getLoyaltyConfig, validatePromoCode, previewOrder } from '../services/api';
import { getMe } from '../services/api';
import { formatPrice, getOrderStatusBadge } from '../utils/formatters';
import { ROUTES } from '../constants/routes';
import { useTranslation } from '../i18n/LanguageContext';

const getImgSrc = (src) => {
  if (!src) return `${import.meta.env.BASE_URL}images/gallery/09.jpg`;
  if (src.startsWith('http') || src.startsWith(import.meta.env.BASE_URL)) return src;
  return `${import.meta.env.BASE_URL}${src.replace(/^\//, '')}`;
};

const STEPS = {
  SUMMARY: 1,
  STATUS: 2
};

const stripHtml = (html) => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
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
  // Loyalty
  const [loyaltyConfig, setLoyaltyConfig] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  // Discount selection
  const [appliedDiscounts, setAppliedDiscounts] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [promoValidated, setPromoValidated] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [priceBreakdown, setPriceBreakdown] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [lastAppliedParams, setLastAppliedParams] = useState(null);

  // Derived state: check if current inputs match what was last applied to the price breakdown
  const currentParams = JSON.stringify({
    appliedDiscounts: appliedDiscounts.sort(),
    promoCode: appliedDiscounts.includes('PROMO') ? promoCode : null,
    pointsToUse: appliedDiscounts.includes('POINTS') ? pointsToUse : 0,
  });
  const isPriceApplied = lastAppliedParams === currentParams;
  
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
        const [prog, config, me] = await Promise.all([
          getProgramBySlug(slug),
          getLoyaltyConfig(),
          getMe(),
        ]);
        setProgram(prog);
        setLoyaltyConfig(config);
        setUserInfo({ memberTier: me.memberTier || 'NONE', points: me.points || 0, totalSpent: me.totalSpent || 0 });

        // Initial price calculation locally to avoid flickering/blocking loading state
        const subTotal = (prog.salePrice !== null && prog.salePrice !== undefined && prog.price > prog.salePrice) 
          ? prog.salePrice 
          : prog.price;
        const vatAmount = Math.round(subTotal * 0.08);
        
        // Local points earned calculation
        let pointsEarned = 0;
        if (config?.points?.earnPer && subTotal > 0) {
          pointsEarned = Math.floor(subTotal / config.points.earnPer) * config.points.earnRate;
        }

        setPriceBreakdown({
          originalPrice: prog.price,
          subTotal,
          saleDiscount: prog.price - subTotal,
          promoCodeDiscount: 0,
          tierDiscount: 0,
          pointsDiscount: 0,
          pointsUsed: 0,
          finalPrice: subTotal,
          vatAmount,
          totalPayment: subTotal + vatAmount,
          pointsEarned,
          memberTier: me.memberTier,
          userPoints: me.points
        });

        // Optional: fetch real preview in background without showing loading
        const initialParams = JSON.stringify({
          appliedDiscounts: [],
          promoCode: null,
          pointsToUse: 0
        });
        setLastAppliedParams(initialParams);

        previewOrder({
          programId: prog.id,
          appliedDiscounts: [],
          promoCode: null,
          pointsToUse: 0
        }).then(res => setPriceBreakdown(res)).catch(() => {});

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
        if (err.response?.status === 401) {
          toast.error('Vui lòng đăng nhập lại.');
          navigate(ROUTES.LOGIN);
          return;
        }
        console.error('Checkout init error:', err);
        toast.error(t('checkout.toast.orderCreateFailed') || 'Failed to load checkout information.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [slug, navigate, t]);

  const handleApplyDiscounts = async () => {
    if (!program?.id) return;
    setPreviewLoading(true);
    try {
      const params = {
        programId: program.id,
        appliedDiscounts,
        promoCode: appliedDiscounts.includes('PROMO') ? promoCode : null,
        pointsToUse: appliedDiscounts.includes('POINTS') ? (pointsToUse || 0) : 0,
      };
      const result = await previewOrder(params);
      setPriceBreakdown(result);
      setLastAppliedParams(JSON.stringify({
        appliedDiscounts: appliedDiscounts.sort(),
        promoCode: params.promoCode,
        pointsToUse: params.pointsToUse,
      }));
      toast.success('Đã cập nhật bảng giá ưu đãi!');
    } catch (err) {
      console.error('Preview error:', err);
      toast.error(err.response?.data?.error || 'Không thể áp dụng ưu đãi.');
      setPriceBreakdown(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    if (requiresInvoice) {
      const { taxCode, companyName, companyAddress, invoiceEmail } = invoiceData;
      if (!taxCode?.trim() || !companyName?.trim() || !companyAddress?.trim() || !invoiceEmail?.trim()) {
        toast.error('Vui lòng điền đầy đủ thông tin xuất hóa đơn (Mã số thuế, Tên công ty, Địa chỉ và Email).');
        const section = document.querySelector('.invoice-section');
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(invoiceEmail.trim())) {
        toast.error('Email nhận hóa đơn không hợp lệ.');
        const section = document.querySelector('.invoice-section');
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      const taxCodeRegex = /^[0-9\-]{10,14}$/;
      if (!taxCodeRegex.test(taxCode.trim())) {
        toast.error('Mã số thuế không hợp lệ (cần 10-14 ký tự số hoặc dấu gạch ngang).');
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
        ...invoiceData,
        appliedDiscounts,
        promoCode: appliedDiscounts.includes('PROMO') ? promoCode : null,
        pointsToUse: appliedDiscounts.includes('POINTS') ? pointsToUse : 0,
      });
      
      // Update local state in background
      setOrder(res.order);
      setStep(STEPS.STATUS);

      if (res.isFree) {
        toast.success('Đăng ký khóa học thành công!');
        setSubmitting(false);
        return;
      }
      
      // Directly initiate payment redirect
      const vnpayRes = await createVnpayPaymentUrl(res.order.id);
      if (vnpayRes.paymentUrl) {
        window.location.assign(vnpayRes.paymentUrl);
      } else {
        throw new Error('Không nhận được liên kết thanh toán.');
      }
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
      <>
        <PageTitle 
          title={t('checkout.pageTitle') || 'Thanh Toán'}
          breadcrumbs={[
            { label: t('header.home') || 'Trang Chủ', link: '/' },
            { label: t('header.programs') || 'Khóa Học', link: ROUTES.PROGRAM },
            { label: '...' }
          ]}
        />
        <PageLoading />
      </>
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



              {/* STEP 1: Order Summary */}
              {step === STEPS.SUMMARY && (
                <form className="checkout-form" onSubmit={(e) => { e.preventDefault(); handleCreateOrder(); }}>
                  <div className="checkout-card bordered p-4 p-lg-5">
                    <h4 className="mb-4"><i className="fa fa-shopping-cart color-main mr-2"></i> {t('checkout.orderSummary')}</h4>
                    
                    <div className="d-flex align-items-start mb-4" style={{ gap: '20px' }}>
                      {program.thumbnail && (
                        <img 
                          src={getImgSrc(program.thumbnail)} 
                          alt={program.title} 
                          style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                      )}
                      <div>
                        <h5 className="mb-1">{program.title}</h5>
                        {program.chief && <p className="small-text color-main mb-1">{t('programDetail.instructor') || 'Giảng viên'}: {program.chief.name}</p>}
                        <p className="text-muted small mb-0">{stripHtml(program.description)?.substring(0, 120)}...</p>
                      </div>
                    </div>

                    <div className="divider-15"></div>

                    {/* ── LOYALTY DISCOUNT SECTION ── */}
                    {loyaltyConfig && (
                      <div className="loyalty-discount-section mb-4" style={{ background: '#f8f9fa', borderRadius: 10, padding: '16px 20px' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--greyColor)', marginBottom: 12 }}>
                          <i className="fa fa-gift mr-2" style={{ color: 'var(--colorMain)' }} />Ưu đãi thanh toán
                        </div>

                        {/* Render discount options theo discountOrder */}
                        {loyaltyConfig.discountOrder.filter(t => loyaltyConfig.enabledTypes.includes(t)).map(type => {
                          const isSelected = appliedDiscounts.includes(type);
                          const InputTag = loyaltyConfig.discountMode === 'SINGLE' ? 'input' : 'input';
                          const inputType = loyaltyConfig.discountMode === 'SINGLE' ? 'radio' : 'checkbox';
                          const handleToggle = (e) => {
                            if (e) e.preventDefault(); // Ngăn label click event trigger 2 lần
                            if (loyaltyConfig.discountMode === 'SINGLE') {
                              setAppliedDiscounts([type]); // SINGLE mode không cho click để tắt
                              if (type !== 'PROMO') setPromoValidated(null);
                            } else {
                              if (isSelected) {
                                setAppliedDiscounts(prev => prev.filter(t2 => t2 !== type));
                                if (type === 'PROMO') setPromoValidated(null);
                              } else {
                                setAppliedDiscounts(prev => [...prev, type]);
                              }
                            }
                          };

                          return (
                            <div 
                              key={type} 
                              className={`loyalty-option-card ${isSelected ? 'selected' : ''}`}
                              onClick={handleToggle}
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === ' ' || e.key === 'Enter') {
                                  e.preventDefault();
                                  handleToggle(e);
                                }
                              }}
                            >
                              <input 
                                type={inputType} 
                                className="sr-only" 
                                checked={isSelected} 
                                tabIndex={-1} 
                                readOnly 
                                aria-hidden="true"
                              />
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div 
                                  className="loyalty-option-radio" 
                                  style={{ borderRadius: inputType === 'radio' ? '50%' : 4 }}
                                >
                                  {isSelected && <i className="fa fa-check" style={{ color: '#fff', fontSize: 10 }} />}
                                </div>
                                <div style={{ flex: 1 }}>
                                  {type === 'PROMO' && (
                                    <div className="loyalty-option-title" style={{ fontWeight: 600, fontSize: 14, color: 'var(--darkgreyColor)' }}>🏷️ Mã giảm giá</div>
                                  )}
                                  {type === 'TIER' && (
                                    <div className="loyalty-option-title" style={{ fontWeight: 600, fontSize: 14, color: 'var(--darkgreyColor)' }}>
                                      🎖️ Giảm giá hạng thành viên
                                      {userInfo?.memberTier !== 'NONE' && (
                                        <span style={{ 
                                          marginLeft: 8, 
                                          fontSize: 11, 
                                          padding: '2px 8px', 
                                          borderRadius: 12, 
                                          backgroundColor: loyaltyConfig?.tiers?.find(t => t.name === userInfo.memberTier)?.color || 'var(--colorMain)',
                                          color: '#fff'
                                        }}>
                                          {userInfo.memberTier} — {loyaltyConfig.tiers.find(t => t.name === userInfo?.memberTier)?.discountPercent || 0}%
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  {type === 'POINTS' && (
                                    <div className="loyalty-option-title" style={{ fontWeight: 600, fontSize: 14, color: 'var(--darkgreyColor)' }}>💰 Dùng điểm tích lũy <span style={{ fontWeight: 400, color: '#888', fontSize: 12 }}>(Có: {(userInfo?.points || 0).toLocaleString()} điểm)</span></div>
                                  )}
                                </div>
                              </div>

                              <div style={{ paddingLeft: 32 }}>
                                {type === 'PROMO' && isSelected && (
                                  <div style={{ marginTop: 12 }}>
                                    <input 
                                      className="form-control" 
                                      style={{ height: 42 }} 
                                      placeholder="Nhập mã giảm giá..." 
                                      value={promoCode} 
                                      onClick={e => e.stopPropagation()}
                                      onChange={e => { setPromoCode(e.target.value.toUpperCase()); }} 
                                    />
                                  </div>
                                )}

                                {type === 'TIER' && userInfo?.memberTier === 'NONE' && (
                                  <div style={{ fontSize: 13, color: '#aaa', marginTop: 4 }}>Bạn chưa đạt hạng thành viên (Cần nâng hạng để nhận ưu đãi)</div>
                                )}

                                {type === 'POINTS' && isSelected && userInfo?.points > 0 && (
                                  <div style={{ marginTop: 12 }}>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                      <input 
                                        className="form-control" 
                                        type="number" min={0} max={userInfo.points} step={1}
                                        style={{ width: '100%', height: 42 }}
                                        value={pointsToUse} 
                                        placeholder="Số điểm muốn dùng..."
                                        onClick={e => e.stopPropagation()}
                                        onKeyDown={e => {
                                          if (e.key === '.' || e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault();
                                        }}
                                        onChange={e => {
                                          if (e.target.value === "") {
                                            setPointsToUse("");
                                            return;
                                          }
                                          const val = parseInt(e.target.value, 10);
                                          if (!isNaN(val)) {
                                            setPointsToUse(Math.min(val, userInfo.points));
                                          }
                                        }} 
                                      />
                                    </div>
                                  </div>
                                )}
                                {type === 'POINTS' && (!userInfo?.points || userInfo.points === 0) && (
                                  <div style={{ fontSize: 13, color: '#aaa', marginTop: 4 }}>Bạn chưa có điểm tích lũy</div>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Nút Áp dụng tập trung */}
                        <div className="mt-3">
                          <button 
                            type="button"
                            className={`btn ${isPriceApplied ? 'btn-success' : 'btn-outline-maincolor'} w-100`}
                            style={{ height: 45, fontWeight: 600, borderStyle: isPriceApplied ? 'solid' : 'dashed', borderColor: isPriceApplied ? '#28a745' : 'var(--colorMain)' }}
                            onClick={handleApplyDiscounts}
                            disabled={previewLoading || (appliedDiscounts.length === 0)}
                          >
                            {previewLoading ? (
                              <><span className="spinner-border spinner-border-sm mr-2" />Đang tính...</>
                            ) : isPriceApplied ? (
                              <><i className="fa fa-check-circle mr-2" />Đã áp dụng ưu đãi</>
                            ) : (
                              <><i className="fa fa-calculator mr-2" />Áp dụng ưu đãi & Cập nhật giá</>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ── PRICE SUMMARY (from BE) ── */}
                    <div className="summary-list" style={{ 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '8px', 
                      padding: '20px', 
                      position: 'relative', 
                      border: '1px solid #eee',
                      opacity: isPriceApplied ? 1 : 0.7,
                      transition: 'opacity 0.3s ease'
                    }}>
                      {!isPriceApplied && (
                        <div style={{ 
                          position: 'absolute', 
                          top: -10, 
                          left: '50%', 
                          transform: 'translateX(-50%)', 
                          background: '#fff3cd', 
                          color: '#856404', 
                          fontSize: '11px', 
                          padding: '2px 10px', 
                          borderRadius: '10px',
                          border: '1px solid #ffeeba',
                          whiteSpace: 'nowrap',
                          fontWeight: 600,
                          zIndex: 1
                        }}>
                          <i className="fa fa-exclamation-triangle mr-1" /> Vui lòng nhấn "Áp dụng" để cập nhật giá mới
                        </div>
                      )}
                      {previewLoading && (
                        <div style={{ position: 'absolute', top: 10, right: 16 }}>
                          <span className="spinner-border spinner-border-sm text-muted" />
                        </div>
                      )}
                      {priceBreakdown ? (
                        <>
                          <div className="d-flex justify-content-between mb-2"><span>Tạm tính</span><span>{formatPrice(priceBreakdown.originalPrice)}</span></div>
                          {priceBreakdown.saleDiscount > 0 && <div className="d-flex justify-content-between mb-2" style={{ color: 'var(--colorMain)' }}><span>Giảm giá khuyến mại</span><span>- {formatPrice(priceBreakdown.saleDiscount)}</span></div>}
                          {priceBreakdown.promoCodeDiscount > 0 && <div className="d-flex justify-content-between mb-2" style={{ color: 'var(--colorMain)' }}><span>Mã giảm giá ({promoCode})</span><span>- {formatPrice(priceBreakdown.promoCodeDiscount)}</span></div>}
                          {priceBreakdown.tierDiscount > 0 && <div className="d-flex justify-content-between mb-2" style={{ color: 'var(--colorMain)' }}><span>Giảm giá hạng {priceBreakdown.memberTier === 'NONE' ? 'Thành viên' : priceBreakdown.memberTier}</span><span>- {formatPrice(priceBreakdown.tierDiscount)}</span></div>}
                          {priceBreakdown.pointsDiscount > 0 && <div className="d-flex justify-content-between mb-2" style={{ color: 'var(--colorMain)' }}><span>Dùng {priceBreakdown.pointsUsed.toLocaleString()} điểm</span><span>- {formatPrice(priceBreakdown.pointsDiscount)}</span></div>}

                          <div className="divider-15" style={{ borderTop: '1px solid #ddd' }}></div>

                          <div className="d-flex justify-content-between mb-2 mt-3"><span style={{ fontSize: '15px', fontWeight: '500', color: '#666' }}>Tổng sau giảm giá</span><span style={{ fontSize: '16px', fontWeight: '600' }}>{formatPrice(priceBreakdown.finalPrice)}</span></div>
                          <div className="d-flex justify-content-between mb-2"><span>VAT (8%)</span><span>{formatPrice(priceBreakdown.vatAmount)}</span></div>
                          <div className="d-flex justify-content-between align-items-center mt-3" style={{ background: 'rgba(193,154,91,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(193,154,91,0.1)' }}>
                            <span style={{ fontSize: '18px', fontWeight: '600' }}>Tiền thanh toán</span>
                            <span style={{ fontSize: '24px', fontWeight: '700', color: 'var(--colorMain)' }}>{formatPrice(priceBreakdown.totalPayment)}</span>
                          </div>
                          {priceBreakdown.pointsEarned > 0 && <div className="d-flex justify-content-between mt-2" style={{ fontSize: 12, color: '#888' }}><span>Điểm tích được sau đơn này</span><span>+{priceBreakdown.pointsEarned.toLocaleString()} điểm</span></div>}
                        </>
                      ) : (
                        <div className="text-center text-muted py-3">
                          <span className="spinner-border spinner-border-sm mr-2" /> Đang tính giá...
                        </div>
                      )}
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
                        disabled={submitting || !isPriceApplied}
                      >
                        {submitting ? (
                          <><span className="spinner-border spinner-border-sm mr-2"></span> {(program.price === 0 || (priceBreakdown && priceBreakdown.totalPayment === 0)) ? 'Đang đăng ký...' : 'Đang kết nối VNPay...'}</>
                        ) : !isPriceApplied ? (
                          <><i className="fa fa-refresh mr-2"></i> Cập nhật giá trước khi thanh toán</>
                        ) : (
                          <>{(program.price === 0 || (priceBreakdown && priceBreakdown.totalPayment === 0)) ? <><i className="fa fa-pencil-square-o mr-2"></i> Đăng ký ngay</> : <><i className="fa fa-lock mr-2"></i> Trả tiền qua VNPay</>}</>
                        )}
                      </button>
                      <p className="text-muted small mt-3">
                        <i className="fa fa-shield mr-1"></i> {(program.price === 0 || (priceBreakdown && priceBreakdown.totalPayment === 0)) ? 'Đăng ký an toàn & nhanh chóng' : 'Thanh toán an toàn qua cổng VNPay'}
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
