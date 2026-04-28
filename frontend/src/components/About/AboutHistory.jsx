import React from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { getSocialIconClass, getSocialLinkClass } from '../../utils/socialIcon';

const AboutHistory = ({ history }) => {
  const { siteConfig } = useSiteConfig();
  const { t } = useTranslation();
  return (
    <section className="ls s-py-75 s-py-lg-130 about">
      <div className="container">
        <div className="d-none d-lg-block divider-30"></div>
        <div className="row c-gutter-60">
          <div className="col-lg-6">
            <div className="item-content">
              <div className="section-heading">
                <h6 className="small-text color-main2">{t('about.subtitle') || 'Về chúng tôi'}</h6>
                <h3>{t('about.heading') || 'Lịch sử Muka'}</h3>
              </div>
            </div>
            {history.historyParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <ul className="list-styled style-2">
              {history.historyFeatures.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
            <div className="widget_social_icons mt-4">
              <span className="mr-3 font-weight-bold">Kết nối với chúng tôi:</span>
              {siteConfig.socials?.facebook && <a href={siteConfig.socials.facebook} className={`fa ${getSocialIconClass('facebook')} bg-icon border-icon mr-2 ${getSocialLinkClass('facebook')}`} title="facebook" target="_blank" rel="noopener noreferrer"></a>}
              {siteConfig.socials?.instagram && <a href={siteConfig.socials.instagram} className={`fa ${getSocialIconClass('instagram')} bg-icon border-icon mr-2 ${getSocialLinkClass('instagram')}`} title="instagram" target="_blank" rel="noopener noreferrer"></a>}
              {siteConfig.socials?.tiktok && <a href={siteConfig.socials.tiktok} className={`fa ${getSocialIconClass('tiktok')} bg-icon border-icon mr-2 ${getSocialLinkClass('tiktok')}`} title="tiktok" target="_blank" rel="noopener noreferrer"></a>}
              {siteConfig.socials?.youtube && siteConfig.socials.youtube !== '#' && <a href={siteConfig.socials.youtube} className={`fa ${getSocialIconClass('youtube')} bg-icon border-icon mr-2 ${getSocialLinkClass('youtube')}`} title="youtube" target="_blank" rel="noopener noreferrer"></a>}
            </div>
          </div>
          <div className="col-lg-6 border-none">
            <img src={`${import.meta.env.BASE_URL}images/about.jpg`} alt="" />
          </div>
        </div>
        <div className="d-none d-lg-block divider-15"></div>
      </div>
    </section>
  );
};

export default AboutHistory;
