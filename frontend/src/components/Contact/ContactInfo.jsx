import React from 'react';
import { siteConfig } from '../../config/siteConfig';
import { useTranslation } from '../../i18n/LanguageContext';

const ContactInfo = () => {
  const { t } = useTranslation();
  return (
    <div className="col-lg-4 animate" data-animation="scaleAppear">
      <h4 className="contact-info">{t('contact.infoTitle') || 'Contact Info'}</h4>

      <p className="icon-inline">
        <span className="icon-styled color-main2 fs-14">
          <i className="fa fa-map-marker"></i>
        </span>
        <span>{siteConfig.contact.address}</span>
      </p>

      <p className="icon-inline">
        <span className="icon-styled color-main2 fs-14">
          <i className="fa fa-phone"></i>
        </span>
        <span>{siteConfig.contact.phone}</span>
      </p>

      <p className="icon-inline contact-link with-border">
        <span className="icon-styled color-main2 fs-14">
          <i className="fa fa-envelope"></i>
        </span>
        <span>
          <a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a>
        </span>
      </p>

      <p className="icon-inline contact-link">
        <span className="icon-styled color-main2 fs-14">
          <i className="fa fa-internet-explorer"></i>
        </span>
        <span>
          <a href="#">{siteConfig.contact.website}</a>
        </span>
      </p>

      <p className="icon-inline">
        <span className="icon-styled color-main2 fs-14">
          <i className="fa fa-clock-o"></i>
        </span>
        <span>{t('contact.hours') || 'Weekdays: 9 am - 7 pm'}</span>
      </p>

      <div className="widget_social_icons mt-4">
        {siteConfig.socials?.facebook && <a href={siteConfig.socials.facebook} className="fa fa-facebook bg-icon border-icon mr-2" title="facebook" target="_blank" rel="noopener noreferrer"></a>}
        {siteConfig.socials?.instagram && <a href={siteConfig.socials.instagram} className="fa fa-instagram bg-icon border-icon mr-2" title="instagram" target="_blank" rel="noopener noreferrer"></a>}
        {siteConfig.socials?.tiktok && <a href={siteConfig.socials.tiktok} className="fa fa-paper-plane bg-icon border-icon mr-2" title="tiktok" target="_blank" rel="noopener noreferrer"></a>}
        {siteConfig.socials?.youtube && siteConfig.socials.youtube !== '#' && <a href={siteConfig.socials.youtube} className="fa fa-youtube-play bg-icon border-icon mr-2" title="youtube" target="_blank" rel="noopener noreferrer"></a>}
      </div>
    </div>
  );
};

export default ContactInfo;
