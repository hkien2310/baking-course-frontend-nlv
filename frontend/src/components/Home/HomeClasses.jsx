import React, { useEffect, useRef } from 'react';
import ProgramCard from '../Shared/ProgramCard';
import { useTranslation } from '../../i18n/LanguageContext';

const HomeClasses = ({ classes }) => {
  const { t } = useTranslation();
  const carouselRef = useRef(null);

  if (!classes || classes.length === 0) return null;


	return (
		<section className="ls s-py-40 s-py-lg-130 program program-carousel animate" data-animation="fadeInUp" id="classes">
			<div className="container">
				<div className="divider-25"></div>
				<div className="row">
					<div className="col-sm-12 text-center">
						<div className="section-heading">
							{t('home.classes.subtitle') && <h6 className="small-text color-main2">{t('home.classes.subtitle')}</h6>}
							<h3>{t('home.classes.title')}</h3>
							<img className="image-wrap" src={`${import.meta.env.BASE_URL}images/icon-main.png`} alt="" />
						</div>
						<div className="d-none d-lg-block divider-60"></div>
						<div ref={carouselRef} className="owl-carousel carousel-nav" data-responsive-lg="3" data-responsive-md="2" data-responsive-sm="2" data-responsive-xs="1" data-nav="true" data-loop="true">
              {classes.map((cls) => (
                <ProgramCard key={cls.id} cls={cls} />
              ))}
						</div>
						<div className="divider-30 d-none d-xl-block"></div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default HomeClasses;
