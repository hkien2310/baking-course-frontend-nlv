import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import Button from '../Shared/Button';

const HomeSlider = ({ slides }) => {
  const { t } = useTranslation();
  const sliderRef = useRef(null);

  useEffect(() => {
    if (!slides || slides.length === 0) return;

    // Wait for DOM to be ready, then re-initialize jQuery plugins
    const timer = setTimeout(() => {
      const $ = window.jQuery;
      if (!$) return;

      const $slider = $(sliderRef.current).find('.flexslider');

      // Initialize countdown timers for each slide
      slides.forEach((slide, index) => {
        const targetDate = slide.saleEndDate;
        
        if (targetDate && $.fn.countdown) {
          const countdownId = index === 0 ? '#flex-countdown' : `#flex-countdown${index + 1}`;
          const $counter = $(countdownId);
          if ($counter.length) {
            $counter.countdown('destroy');
            const dateObj = new Date(targetDate);
            // Format: March 29, 2018 10:00:00
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            const dateString = `${monthNames[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()} ${dateObj.getHours()}:${dateObj.getMinutes()}:${dateObj.getSeconds()}`;
            
            $counter.data('date', dateString);
            $counter.countdown({
              until: dateObj,
              format: 'DHMS',
              labels: ['Năm', 'Tháng', 'Tuần', 'Ngày', 'Giờ', 'Phút', 'Giây'],
              labels1: ['Năm', 'Tháng', 'Tuần', 'Ngày', 'Giờ', 'Phút', 'Giây'],
            });
          }
        }
      });

      // Re-initialize flexslider if not already initialized
      if ($slider.length && $.fn.flexslider && !$slider.data('flexslider')) {
        $slider.flexslider({
          animation: "fade",
          pauseOnHover: true,
          useCSS: true,
          controlNav: false,
          directionNav: true,
          prevText: "",
          nextText: "",
          smoothHeight: false,
          slideshowSpeed: 7000,
          animationSpeed: 600,
          start: function(slider) {
            slider.find('.intro_layers').children().css({'visibility': 'hidden'});
            slider.find('.flex-active-slide .intro_layers').children().each(function(i) {
              var self = $(this);
              var animationClass = self.data('animation') || 'fadeInRight';
              setTimeout(function() {
                self.addClass("animated " + animationClass);
              }, i * 250);
            });
          },
          after: function(slider) {
            slider.find('.flex-active-slide .intro_layers').children().each(function(i) {
              var self = $(this);
              var animationClass = self.data('animation') || 'fadeInRight';
              setTimeout(function() {
                self.addClass("animated " + animationClass);
              }, i * 250);
            });
          },
          before: function(slider) {
            slider.find('.intro_layers').children().each(function() {
              $(this).removeClass().addClass('intro_layer').css({'visibility': 'hidden'});
            });
          }
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [slides]);

  if (!slides || slides.length === 0) {
    return null;
  }

  return (
    <section className="page_slider" ref={sliderRef}>
      <div className="flexslider" data-nav="true" data-dots="false">
        <ul className="slides">
          {slides.map((slide, index) => (
            <li key={slide.id || index} className={`ds text-center ${index === 1 ? 'slide02' : index === 2 ? 'slide03' : ''}`} style={{ position: 'relative', width: '100%', aspectRatio: '16/9', minHeight: '400px', maxHeight: '90vh' }}>
              <img 
                src={slide.thumbnail || `/images/slide0${index + 1}.jpg`} 
                alt={slide.title} 
                style={{ objectFit: 'cover', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}
              />
              <div 
                className="flexslider-overlay" 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 1 }}
              ></div>
              <div className="container-fluid" style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', alignItems: 'center', paddingBottom: '80px' }}>
                <div className="row w-100">
                  <div className="col-md-12">
                    <div className="intro_layers_wrapper">
                      <div className="intro_layers">
                        <div className="intro_layer" data-animation="fadeInUp">
                          <h6 className="intro_after_featured_word color-main">
                            {slide.saleEndDate ? 'Ưu đãi Flash Sale' : 'Khóa học tiêu biểu'}
                          </h6>
                        </div>
                        <div className="intro_layer" data-animation="fadeInUp">
                          <div className="d-inline-block">
                            <h2 className="intro_featured_word">
                              {slide.title}
                            </h2>
                          </div>
                        </div>
                        {(() => {
                          const targetDate = slide.saleEndDate;
                          if (!targetDate) return null;
                          return (
                            <div className="intro_layer flex-countdown" data-animation="fadeInUp">
                              <div
                                id={index === 0 ? 'flex-countdown' : `flex-countdown${index + 1}`}
                                data-date={(() => {
                                  const dateObj = new Date(targetDate);
                                  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                                  return `${monthNames[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()} ${dateObj.getHours()}:${dateObj.getMinutes()}:${dateObj.getSeconds()}`;
                                })()}
                              ></div>
                            </div>
                          );
                        })()}
                        <div className="intro_layer flex-btn mt-3" data-animation="fadeInUp">
                          <div className="d-flex justify-content-center flex-wrap" style={{ gap: '15px' }}>
                            <Button to={`/program/${slide.slug}`} variant="main">{t('home.slider.enrollNow')}</Button>
                            <Button to="/contact#contact-form-section" variant="outline">{t('home.slider.ourFeedback')}</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="gt3_svg_line">
        <svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="308px" height="41px" viewBox="0 0 308.000000 41.000000" preserveAspectRatio="xMidYMid meet">
          <g transform="translate(0.000000,41.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
            <path d="M1280 395 c-174 -30 -287 -70 -558 -199 -271 -129 -410 -171 -617 -185 -61 -5 585 -8 1435 -8 850 0 1498 3 1440 7 -212 15 -344 54 -625 187 -285 135 -382 169 -560 198 -111 18 -409 18 -515 0z" />
          </g>
        </svg>
      </div>
    </section>
  );
};

export default HomeSlider;
