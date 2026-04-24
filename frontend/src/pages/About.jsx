import { useInitOnLoaded } from '../hooks/useInitOnLoaded';
import React, { useState, useEffect } from 'react';
import PageTitle from '../components/Shared/PageTitle';
import AboutHistory from '../components/About/AboutHistory';
import { useTranslation } from '../i18n/LanguageContext';
import AboutVideo from '../components/About/AboutVideo';
import TestimonialsSlider from '../components/Shared/TestimonialsSlider';
import { getTestimonials } from '../services/api';
import { useSiteConfig } from '../context/SiteConfigContext';

const About = () => {
  const { siteConfig } = useSiteConfig();
  const { t } = useTranslation();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTestimonials()
      .then(data => {
        setTestimonials(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch testimonials", err);
        setLoading(false);
      });
  }, []);

  useInitOnLoaded(loading);

  if (loading) {
    return (
      <div className="text-center" style={{ padding: '150px 0' }}>
        <h2>{t('common.loading') || 'Đang tải dữ liệu...'}</h2>
        <div className="spinner-border" role="status"></div>
      </div>
    );
  }

  return (
    <>
      <PageTitle 
        title={t('about.title') || 'Về Chúng Tôi'}
        breadcrumbs={[{ label: t('header.home'), link: '/' }, { label: t('about.title') || 'Về Chúng Tôi' }]}
      />

			<AboutHistory history={siteConfig.about} />
			
			<AboutVideo achievements={siteConfig.about.achievements} />

			<TestimonialsSlider testimonials={testimonials} />

			{/* SVG line at bottom as per template layout */}
			<div className="gt3_svg_line bottom-line" style={{position: 'relative', marginTop: '-41px', zIndex: 3}}>
				<svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="308px" height="41px" viewBox="0 0 308.000000 41.000000" preserveAspectRatio="xMidYMid meet">
					<g transform="translate(0.000000,41.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
			<path d="M1280 395 c-174 -30 -287 -70 -558 -199 -271 -129 -410 -171 -617 -185 -61 -5 585 -8 1435 -8 850 0 1498 3 1440 7 -212 15 -344 54 -625 187 -285 135 -382 169 -560 198 -111 18 -409 18 -515 0z"/>
		</g>
				</svg>
			</div>
    </>
  );
};

export default About;
