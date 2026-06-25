import React from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useSiteConfig } from '../../context/SiteConfigContext';
import SocialIconLink from '../Shared/SocialIconLink';

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
                <h3>{t('about.heading') || 'Lịch sử YumSaigon'}</h3>
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
              <SocialIconLink platform="facebook" href={siteConfig.socials?.facebook} title="facebook" />
              <SocialIconLink platform="instagram" href={siteConfig.socials?.instagram} title="instagram" />
              <SocialIconLink platform="tiktok" href={siteConfig.socials?.tiktok} title="tiktok" />
              <SocialIconLink platform="youtube" href={siteConfig.socials?.youtube} title="youtube" />
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
