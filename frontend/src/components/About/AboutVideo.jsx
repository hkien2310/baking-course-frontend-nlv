import React from 'react';
import { useTranslation } from '../../i18n/LanguageContext';

const AboutVideo = ({ achievements }) => {
  const { t } = useTranslation();
  return (
    <section className="ls ms s-pt-lg-100 s-pb-lg-75 c-my-0 video-part right-part-bg text-center text-md-left" id="about">
      <div className="cover-image s-cover-left"></div>
      <div className="row align-items-center">
        <div className="col-12 col-lg-6 order-lg-1">
          <a href="images/video-image.jpg" className="photoswipe-link" data-iframe="https://www.youtube.com/embed/mcixldqDIEQ">
            <img src={`${import.meta.env.BASE_URL}images/video-image.jpg`} alt="" />
            <div className="video-text">
              <h5>
                <span>{t('home.about.watch') || 'Watch'}</span>
                <span className=" iframe-link"></span>
                <span>{t('home.about.video') || 'Video'}</span>
              </h5>
            </div>
          </a>
        </div>
        <div className="col-12 col-lg-5 order-lg-2 animate" data-animation="slideInRight">
          <div className="d-none d-lg-block divider-55"></div>
          <div className="item-content">
            <h6 className="fs-14 color-main">{t('about.video.subtitle') || 'Thành tựu của chúng tôi'}</h6>
            <h3>{t('about.video.title') || 'Xin chào, Chào mừng bạn đến với YumSaigon!'}</h3>
            <div className="d-none d-lg-block divider-50"></div>
            {achievements.map((item, index) => (
              <div key={index} className="media">
                <div className="icon-styled color-main2">
                  <i className={`fa ${item.icon}`}></i>
                </div>
                <div className="media-body">
                  <h5>{item.title}</h5>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="d-none d-lg-block divider-20"></div>
    </section>
  );
};

export default AboutVideo;
