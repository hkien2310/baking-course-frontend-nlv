import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { ROUTES } from '../../constants/routes';
import { useTranslation } from '../../i18n/LanguageContext';
import { getPosts, submitContact } from '../../services/api';
import { toast } from 'react-toastify';
import Input from '../Shared/Input';
import { imageUrl } from '../../utils/imageUrl';
import SocialIconLink from '../Shared/SocialIconLink';

const Footer = () => {
  const { siteConfig } = useSiteConfig();
  const { t } = useTranslation();
  const [recentPosts, setRecentPosts] = useState([]);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Helper for image src
  const imgSrc = (src) => imageUrl(src, `${import.meta.env.BASE_URL}images/gallery/09.jpg`);

  useEffect(() => {
    getPosts().then(res => {
      const posts = res?.data || res || [];
      setRecentPosts(posts.slice(0, 3));
    }).catch(console.error);
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      await submitContact({
        fullName: 'Subscriber',
        email: email,
        subject: 'Đăng ký nhận bản tin (Newsletter)',
        message: 'Yêu cầu đăng ký nhận tin tức mới qua email.'
      });
      toast.success(t('footer.subscribeSuccess') || 'Cảm ơn bạn đã đăng ký!');
      setEmail('');
    } catch (err) {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
    }
    setSubmitting(false);
  };

  return (
    <>
      <footer className="page_footer ds s-pt-90 s-pb-15 s-pt-lg-130 s-pb-lg-75 c-gutter-60 s-parallax">
        <div className="s-pt-60 s-pb-60 s-py-lg-60 cs cs2 s-parallax s-overlay discount text-center text-lg-left">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-8">
                <h3>{t('footer.discountTitle')}</h3>
                <h6 className="small-text">{t('footer.discountSub')}</h6>
              </div>
              <div className="col-lg-4 text-center text-lg-right">
                <Link to={ROUTES.CONTACT} className="btn btn-lightcolor">{t('footer.discountCta')}</Link>
              </div>
            </div>
          </div>
          <div className="divider-10"></div>
        </div>

        <div className="container">
          <div className="row">
            <div className="divider-30 d-none d-xl-block"></div>

            <div className="col-md-12 col-lg-4 animate text-left" data-animation="fadeInUp">
              <div className="widget widget_icons_list footer-list">
                <div className="text-left">
                  <Link to={ROUTES.HOME} className="logo logo-footer">
                    <img src={`${import.meta.env.BASE_URL}images/logo_yum_saigon.png`} alt="" style={{ maxWidth: '120px', marginRight: '15px' }} />
                    <span className="logo-text color-darkgrey">{siteConfig.logoText}<strong className="color-main">{siteConfig.logoDot}</strong></span>
                  </Link>
                </div>
                <p className="after-logo">{siteConfig.description}</p>
                <p className="icon-inline" style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <span className="icon-styled color-main2" style={{ width: '30px', flexShrink: 0, textAlign: 'left' }}><i className="fa fa-building"></i></span>
                  <span style={{ fontWeight: 600, wordBreak: 'break-word', paddingTop: '2px' }}>{siteConfig.contact?.legalName || 'CÔNG TY TNHH YUM SAIGON'}</span>
                </p>
                <p className="icon-inline" style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <span className="icon-styled color-main2" style={{ width: '30px', flexShrink: 0, textAlign: 'left' }}><i className="fa fa-id-card"></i></span>
                  <span style={{ wordBreak: 'break-word', paddingTop: '2px' }}>Mã số thuế: {siteConfig.contact?.taxCode || '0314500740'}</span>
                </p>
                <p className="icon-inline" style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <span className="icon-styled color-main2" style={{ width: '30px', flexShrink: 0, textAlign: 'left' }}><i className="fa fa-map-marker"></i></span>
                  <span style={{ wordBreak: 'break-word', paddingTop: '2px' }}>{siteConfig.contact.address}</span>
                </p>
                <p className="icon-inline" style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <span className="icon-styled color-main2" style={{ width: '30px', flexShrink: 0, textAlign: 'left' }}><i className="fa fa-phone"></i></span>
                  <span style={{ wordBreak: 'break-word', paddingTop: '2px' }}>{siteConfig.contact.phone}</span>
                </p>
                <p className="icon-inline" style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <span className="icon-styled color-main2" style={{ width: '30px', flexShrink: 0, textAlign: 'left' }}><i className="fa fa-envelope"></i></span>
                  <span style={{ wordBreak: 'break-word', paddingTop: '2px' }}><a className="border-bottom" href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a></span>
                </p>
                <p className="icon-inline" style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <span className="icon-styled color-main2" style={{ width: '30px', flexShrink: 0, textAlign: 'left' }}><i className="fa fa-globe"></i></span>
                  <span style={{ wordBreak: 'break-word', paddingTop: '2px' }}><Link to={ROUTES.HOME}>{siteConfig.contact.website}</Link></span>
                </p>
                <div className="widget_social_icons mt-4">
                  <SocialIconLink platform="facebook" href={siteConfig.socials?.facebook} title="facebook" />
                  <SocialIconLink platform="instagram" href={siteConfig.socials?.instagram} title="instagram" />
                  <SocialIconLink platform="tiktok" href={siteConfig.socials?.tiktok} title="tiktok" />
                  <SocialIconLink platform="youtube" href={siteConfig.socials?.youtube} title="youtube" />
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-4 animate" data-animation="fadeInUp">
              <div className="widget widget_recent_posts">
                <h3 className="widget-title">{t('footer.recentPosts')}</h3>
                <ul className="list-unstyled">
                  {recentPosts.length > 0 ? recentPosts.map(post => (
                    <li key={post.slug} className="media">
                      <Link className="media-image" to={ROUTES.POST_DETAIL(post.slug)}>
                        <img src={imgSrc(post.thumbnail)} alt={post.title} />
                      </Link>
                      <div className="media-body">
                        <p><Link to={ROUTES.POST_DETAIL(post.slug)}>{post.title}</Link></p>
                        <h6 className="item-meta"><i className="fa fa-calendar color-main"></i>{post.dateString || post.dateIso || post.createdAt ? new Date(post.dateString || post.dateIso || post.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</h6>
                      </div>
                    </li>
                  )) : (
                    <li className="media">
                      <div className="media-image" aria-hidden="true" style={{ width: '80px', height: '80px', borderRadius: '10px', background: 'linear-gradient(90deg, #f2f2f2 25%, #fafafa 50%, #f2f2f2 75%)', backgroundSize: '200% 100%', animation: 'pageLoadingShimmer 1.4s ease-in-out infinite' }}></div>
                      <div className="media-body" aria-hidden="true">
                        <p style={{ width: '90%', height: '14px', marginBottom: '10px', borderRadius: '999px', background: 'linear-gradient(90deg, #f2f2f2 25%, #fafafa 50%, #f2f2f2 75%)', backgroundSize: '200% 100%', animation: 'pageLoadingShimmer 1.4s ease-in-out infinite' }}></p>
                        <h6 className="item-meta" style={{ width: '55%', height: '12px', borderRadius: '999px', background: 'linear-gradient(90deg, #f2f2f2 25%, #fafafa 50%, #f2f2f2 75%)', backgroundSize: '200% 100%', animation: 'pageLoadingShimmer 1.4s ease-in-out infinite' }}></h6>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <div className="col-md-6 col-lg-4 animate text-center text-lg-left" data-animation="fadeInUp">
              <div className="widget widget_mailchimp footer_mailchimp">
                <h3 className="widget-title">{siteConfig.footer.newsletterTitle}</h3>
                <p>{siteConfig.footer.newsletterDescription}</p>
                <form className="newsletter-custom-form" onSubmit={handleSubscribe}>
                  <Input
                    id="mailchimp_email"
                    name="email"
                    type="email"
                    inputClassName="newsletter_email ds"
                    placeholder={t('footer.emailPlaceholder') || 'Nhập địa chỉ Email'}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    wrapperClassName="mb-3"
                  />
                  <button type="submit" className="btn btn-maincolor" disabled={submitting}>
                    {submitting ? (t('common.sending') || 'Đang gửi...') : t('footer.subscribe')}
                  </button>
                </form>
              </div>
            </div>
            <div className="divider-20 d-none d-xl-block"></div>
          </div>
        </div>
      </footer>

      {/* Policy Links Bar */}
      <section className="ds s-py-20" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-12 text-center">
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 20px' }}>
                <Link to={`${ROUTES.POLICIES}#privacy`} style={{ color: '#999', fontSize: '13px', textDecoration: 'none' }}>Chính sách bảo mật</Link>
                <span style={{ color: '#555' }}>|</span>
                <Link to={`${ROUTES.POLICIES}#terms`} style={{ color: '#999', fontSize: '13px', textDecoration: 'none' }}>Điều khoản sử dụng</Link>
                <span style={{ color: '#555' }}>|</span>
                <Link to={`${ROUTES.POLICIES}#payment`} style={{ color: '#999', fontSize: '13px', textDecoration: 'none' }}>Chính sách thanh toán</Link>
                <span style={{ color: '#555' }}>|</span>
                <Link to={`${ROUTES.POLICIES}#refund`} style={{ color: '#999', fontSize: '13px', textDecoration: 'none' }}>Chính sách đổi trả</Link>
                <span style={{ color: '#555' }}>|</span>
                <Link to={`${ROUTES.POLICIES}#delivery`} style={{ color: '#999', fontSize: '13px', textDecoration: 'none' }}>Chính sách giao nhận</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page_copyright ds s-py-25 s-py-lg-5 s-parallax s-overlay footer-overlay">
        <div className="container">
          <div className="row align-items-center">
            <div className="divider-20 d-none d-lg-block"></div>
            <div className="col-md-12 text-center">
              <p>&copy; {t('footer.copyright', { year: siteConfig.copyrightYear }) || `Bản quyền ${siteConfig.copyrightYear} Mọi Quyền Được Bảo Lưu`}</p>
            </div>
            <div className="divider-20 d-none d-lg-block"></div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Footer;
