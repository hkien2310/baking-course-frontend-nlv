import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import PageTitle from '../components/Shared/PageTitle';
import { getOrderById } from '../services/api';
import { formatPrice } from '../utils/formatters';
import { ROUTES } from '../constants/routes';
import { useTranslation } from '../i18n/LanguageContext';

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const urlStatus = searchParams.get('status'); // from VNPay return redirect
  const { t } = useTranslation();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const pollRef = useRef(null);

  const MAX_POLLS = 20; // 20 × 3s = 60 seconds
  const POLL_INTERVAL = 3000;

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    // Initial fetch
    getOrderById(orderId)
      .then(data => {
        setOrder(data);
        setLoading(false);

        // If payment looks successful but order not yet confirmed, start polling
        if (urlStatus === 'success' && data.status !== 'CONFIRMED') {
          setPolling(true);
        }
      })
      .catch(err => {
        console.error('Failed to fetch order:', err);
        setLoading(false);
      });

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [orderId, urlStatus]);

  // Auto-poll for order status updates (IPN may arrive after return URL)
  useEffect(() => {
    if (!polling || !orderId) return;

    pollRef.current = setInterval(async () => {
      try {
        const updated = await getOrderById(orderId);
        setOrder(updated);
        setPollCount(prev => prev + 1);

        if (updated.status === 'CONFIRMED' || pollCount >= MAX_POLLS) {
          setPolling(false);
          clearInterval(pollRef.current);
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    }, POLL_INTERVAL);

    return () => clearInterval(pollRef.current);
  }, [polling, orderId, pollCount]);

  // Determine display state
  const getDisplayState = () => {
    if (!orderId) return 'no-order';
    if (!order) return 'not-found';

    if (order.status === 'CONFIRMED') return 'success';
    if (urlStatus === 'success' && order.status === 'PENDING') return 'pending-confirmation';
    if (urlStatus === 'cancelled') return 'cancelled';
    if (urlStatus === 'failed') return 'failed';
    if (order.status === 'PENDING') return 'pending';
    return 'unknown';
  };

  const displayState = getDisplayState();
  const programSlug = order?.program?.slug;

  if (loading) {
    return (
      <div className="text-center" style={{ padding: '150px 0' }}>
        <h2>{t('common.loading')}</h2>
        <div className="spinner-border" role="status"></div>
      </div>
    );
  }

  return (
    <>
      <PageTitle 
        title={t('payment.resultTitle') || 'Kết quả giao dịch'}
        breadcrumbs={[{ label: t('header.home') || 'Trang chủ', link: '/' }, { label: t('payment.resultTitle') || 'Kết quả giao dịch' }]}
      />

      <section className="ls s-py-60 s-py-lg-100">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="checkout-card bordered p-4 p-lg-5 text-center" style={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>

                {/* SUCCESS */}
                {displayState === 'success' && (
                  <>
                    <div className="mb-4">
                      <i className="fa fa-check-circle" style={{ fontSize: '80px', color: '#28a745' }}></i>
                    </div>
                    <h3 className="mb-3" style={{ color: '#28a745' }}>{t('payment.success.title')}</h3>
                    <p className="mb-1">
                      {t('payment.success.courseActivated', { title: order?.program?.title })}
                    </p>
                    <p className="text-muted mb-4">{t('payment.success.accessNow')}</p>
                    {programSlug && (
                      <Link to={ROUTES.PROGRAM_DETAIL(programSlug)} className="btn btn-maincolor btn-lg px-5">
                        <i className="fa fa-play-circle mr-2"></i> {t('payment.success.viewCourse')}
                      </Link>
                    )}
                  </>
                )}

                {/* PENDING CONFIRMATION (IPN hasn't arrived yet) */}
                {displayState === 'pending-confirmation' && (
                  <>
                    <div className="mb-4">
                      <div className="spinner-border text-warning" role="status" style={{ width: '60px', height: '60px', borderWidth: '4px' }}></div>
                    </div>
                    <h4 className="mb-3">{t('payment.pending.title')}</h4>
                    <p className="text-muted mb-2">
                      {t('payment.pending.processing')}
                    </p>
                    {polling && (
                      <p className="small text-muted mb-4">
                        <i className="fa fa-refresh fa-spin mr-1"></i>
                        {t('payment.pending.autoCheck', { current: pollCount, max: MAX_POLLS })}
                      </p>
                    )}
                    {!polling && pollCount >= MAX_POLLS && (
                      <div className="alert alert-info small mt-3">
                        <i className="fa fa-info-circle mr-1"></i>
                        {t('payment.pending.timeoutMsg')}
                        <br />{t('payment.pending.checkAccount', { link: '' })} <Link to={ROUTES.MY_ACCOUNT}>{t('payment.pending.myAccount')}</Link>
                      </div>
                    )}
                    {programSlug && (
                      <Link to={ROUTES.PROGRAM_DETAIL(programSlug)} className="btn btn-outline-maincolor mt-3">
                        <i className="fa fa-arrow-left mr-1"></i> {t('payment.pending.backToCourse')}
                      </Link>
                    )}
                  </>
                )}

                {/* CANCELLED */}
                {displayState === 'cancelled' && (
                  <>
                    <div className="mb-4">
                      <i className="fa fa-ban" style={{ fontSize: '60px', color: '#6c757d' }}></i>
                    </div>
                    <h4 className="mb-3" style={{ color: '#6c757d' }}>{t('payment.cancelled.title')}</h4>
                    <p className="text-muted mb-4">
                      {t('payment.cancelled.description')}
                    </p>
                    {programSlug && (
                      <div className="d-flex justify-content-center" style={{ gap: '12px' }}>
                        <Link to={ROUTES.CHECKOUT(programSlug)} className="btn btn-maincolor">
                          <i className="fa fa-refresh mr-1"></i> {t('payment.cancelled.retry')}
                        </Link>
                        <Link to={ROUTES.PROGRAM_DETAIL(programSlug)} className="btn btn-outline-secondary">
                          {t('payment.cancelled.goBack')}
                        </Link>
                      </div>
                    )}
                  </>
                )}

                {/* FAILED */}
                {displayState === 'failed' && (
                  <>
                    <div className="mb-4">
                      <i className="fa fa-times-circle" style={{ fontSize: '60px', color: '#dc3545' }}></i>
                    </div>
                    <h4 className="mb-3" style={{ color: '#dc3545' }}>{t('payment.failed.title')}</h4>
                    <p className="text-muted mb-4">
                      {t('payment.failed.description')}
                    </p>
                    {programSlug && (
                      <div className="d-flex justify-content-center" style={{ gap: '12px' }}>
                        <Link to={ROUTES.CHECKOUT(programSlug)} className="btn btn-maincolor">
                          <i className="fa fa-refresh mr-1"></i> {t('payment.failed.retry')}
                        </Link>
                        <Link to={ROUTES.PROGRAM_DETAIL(programSlug)} className="btn btn-outline-secondary">
                          {t('payment.failed.goBack')}
                        </Link>
                      </div>
                    )}
                  </>
                )}

                {/* NO ORDER / NOT FOUND */}
                {(displayState === 'no-order' || displayState === 'not-found') && (
                  <>
                    <div className="mb-4">
                      <i className="fa fa-question-circle" style={{ fontSize: '60px', color: '#6c757d' }}></i>
                    </div>
                    <h4 className="mb-3">{t('payment.notFound.title')}</h4>
                    <p className="text-muted mb-4">{t('payment.notFound.description')}</p>
                    <Link to={ROUTES.PROGRAM} className="btn btn-maincolor">
                      <i className="fa fa-book mr-1"></i> {t('payment.notFound.viewCourses')}
                    </Link>
                  </>
                )}

                {/* GENERIC PENDING */}
                {displayState === 'pending' && (
                  <>
                    <div className="mb-4">
                      <i className="fa fa-hourglass-half" style={{ fontSize: '60px', color: '#ffc107' }}></i>
                    </div>
                    <h4 className="mb-3">{t('payment.pendingOrder.title')}</h4>
                    <p className="text-muted mb-4">{t('payment.pendingOrder.description')}</p>
                    {programSlug && (
                      <Link to={ROUTES.CHECKOUT(programSlug)} className="btn btn-maincolor">
                        <i className="fa fa-arrow-right mr-1"></i> {t('payment.pendingOrder.continuePay')}
                      </Link>
                    )}
                  </>
                )}

                {/* Order details footer */}
                {order && (
                  <div className="mt-5 text-left" style={{ backgroundColor: '#fafafa', borderRadius: '12px', border: '1px solid #eee', padding: '24px 30px' }}>
                    <ul className="list-unstyled mb-0" style={{ fontSize: '15px', color: '#444' }}>
                      <li className="d-flex justify-content-between mb-3 pb-3" style={{ borderBottom: '1px dashed #e8e8e8' }}>
                        <span style={{ color: '#88929e' }}>{t('payment.orderInfo.code') || 'Mã đơn hàng'}</span>
                        <strong style={{ color: '#222' }}>{order.orderCode}</strong>
                      </li>
                      <li className="d-flex justify-content-between mb-3 pb-3" style={{ borderBottom: '1px dashed #e8e8e8' }}>
                        <span style={{ color: '#88929e' }}>{t('payment.orderInfo.amount') || 'Tổng thanh toán'}</span>
                        <strong style={{ color: 'var(--color-main)', fontSize: '16px' }}>{formatPrice(order.amount)}</strong>
                      </li>
                      <li className="d-flex justify-content-between mb-3 pb-3" style={{ borderBottom: '1px dashed #e8e8e8' }}>
                        <span style={{ color: '#88929e' }}>Phương thức</span>
                        <strong style={{ color: '#222' }}>
                          {order.paymentMethod === 'VNPAY' ? 'VNPay' : (order.paidViaWebhook ? 'Chuyển khoản' : 'Thủ công')}
                        </strong>
                      </li>
                      {order.paidAt && (
                        <li className="d-flex justify-content-between">
                          <span style={{ color: '#88929e' }}>{t('payment.orderInfo.paidAt') || 'Thời gian giao dịch'}</span>
                          <strong style={{ color: '#222' }}>{new Date(order.paidAt).toLocaleString('vi-VN')}</strong>
                        </li>
                      )}
                    </ul>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PaymentResult;
