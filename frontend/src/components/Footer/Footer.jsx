import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { ROUTES } from '../../constants/routes';
import { useTranslation } from '../../i18n/LanguageContext';
import { getPosts, submitContact } from '../../services/api';
import { toast } from 'react-toastify';
import Input from '../Shared/Input';
import { imageUrl } from '../../utils/imageUrl';

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
        name: 'Subscriber',
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

            <div className="col-md-12 col-lg-4 animate text-center text-lg-left" data-animation="fadeInUp">
              <div className="widget widget_icons_list footer-list">
                <div className="text-center">
                  <Link to={ROUTES.HOME} className="logo logo-footer">
                    <img src={`${import.meta.env.BASE_URL}images/logo_yum_saigon.png`} alt="" style={{ maxWidth: '120px', marginRight: '15px' }} />
                    <span className="logo-text color-darkgrey">{siteConfig.logoText}<strong className="color-main">{siteConfig.logoDot}</strong></span>
                  </Link>
                </div>
                <p className="after-logo">{siteConfig.description}</p>
                <p className="icon-inline">
                  <span className="icon-styled color-main2"><i className="fa fa-map-marker"></i></span>
                  <span>{siteConfig.contact.address}</span>
                </p>
                <p className="icon-inline">
                  <span className="icon-styled color-main2"><i className="fa fa-phone"></i></span>
                  <span>{siteConfig.contact.phone}</span>
                </p>
                <p className="icon-inline">
                  <span className="icon-styled color-main2"><i className="fa fa-envelope"></i></span>
                  <span><a className="border-bottom" href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a></span>
                </p>
                <p className="icon-inline">
                  <span className="icon-styled color-main2"><i className="fa fa-internet-explorer"></i></span>
                  <span><Link to={ROUTES.HOME}>{siteConfig.contact.website}</Link></span>
                </p>
                <div className="widget_social_icons mt-4">
                  {siteConfig.socials?.facebook && <a href={siteConfig.socials.facebook} className="fa fa-facebook bg-icon border-icon mr-2" title="facebook" target="_blank" rel="noopener noreferrer"></a>}
                  {siteConfig.socials?.instagram && <a href={siteConfig.socials.instagram} className="fa fa-instagram bg-icon border-icon mr-2" title="instagram" target="_blank" rel="noopener noreferrer"></a>}
                  {siteConfig.socials?.tiktok && <a href={siteConfig.socials.tiktok} className="fa fa-paper-plane bg-icon border-icon mr-2" title="tiktok" target="_blank" rel="noopener noreferrer"></a>}
                  {siteConfig.socials?.youtube && siteConfig.socials.youtube !== '#' && <a href={siteConfig.socials.youtube} className="fa fa-youtube-play bg-icon border-icon mr-2" title="youtube" target="_blank" rel="noopener noreferrer"></a>}
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
                        <h6 className="item-meta"><i className="fa fa-calendar color-main"></i>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'N/A'}</h6>
                      </div>
                    </li>
                  )) : (
                    <li>Đang tải...</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="col-md-6 col-lg-4 animate text-center text-lg-left" data-animation="fadeInUp">
              <div className="widget widget_mailchimp footer_mailchimp">
                <h3 className="widget-title">{siteConfig.footer.newsletterTitle}</h3>
                <p>{siteConfig.footer.newsletterDescription}</p>
                <form className="signup" onSubmit={handleSubscribe}>
                  <Input
                    id="mailchimp_email"
                    name="email"
                    type="email"
                    inputClassName="mailchimp_email ds"
                    placeholder={t('footer.emailPlaceholder') || 'Nhập địa chỉ Email'}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    wrapperClassName="mb-3"
                  />
                  <button type="submit" className="btn btn-maincolor" disabled={submitting}>
                    {submitting ? (t('common.sending') || 'Đang gửi...') : t('footer.subscribe')}
                  </button>
                  <div className="response"></div>
                </form>
              </div>
            </div>
            <div className="divider-20 d-none d-xl-block"></div>
          </div>
        </div>
      </footer>

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
