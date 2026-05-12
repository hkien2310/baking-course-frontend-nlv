import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PageTitle from '../components/Shared/PageTitle';
import ContactForm from '../components/Contact/ContactForm';
import ContactInfo from '../components/Contact/ContactInfo';
import { useSiteConfig } from '../context/SiteConfigContext';
import { useTranslation } from '../i18n/LanguageContext';

const Contact = () => {
	const { siteConfig } = useSiteConfig();
	const { t } = useTranslation();
	const location = useLocation();

	useEffect(() => {
		if (location.hash === '#contact-form-section') {
			setTimeout(() => {
				const element = document.getElementById('contact-form-section');
				if (element) {
					// Use standard DOM scroll behavior
					element.scrollIntoView({ behavior: 'smooth', block: 'start' });
				}
			}, 300); // slight delay for DOM mount
		}
	}, [location]);

	return (
		<>
			<PageTitle
				title={t('contact.title') || 'Liên Hệ'}
				breadcrumbs={[{ label: t('header.home'), link: '/' }, { label: t('contact.title') || 'Liên Hệ' }]}
			/>

			<section className="ls ms page_map" data-draggable="true" data-scrollwheel="true" style={{ position: 'relative', minHeight: '500px' }}>
				<iframe
					src={siteConfig.contact.googleMapsUrl}
					width="100%"
					height="100%"
					style={{ position: 'absolute', top: 0, left: 0, border: 0, zIndex: 0, width: '100%', height: '100%' }}
					allowFullScreen=""
					aria-hidden="false"
					tabIndex="0"
					title="YUM Saigon Location"
				></iframe>
				<div className="marker" style={{ zIndex: 1 }}>
					<div className="marker-address">{siteConfig.contact.address}</div>
					<div className="marker-title">{t('contact.mainLocation') || 'ĐỊA ĐIỂM CHÍNH'}</div>
					<div className="marker-description">
						<img src={`${import.meta.env.BASE_URL}images/logo_yum_saigon.png`} alt="" />
						<ul className="list-unstyled">
							<li>
								<span className="icon-inline">
									<span className="icon-styled color-main"><i className="fa fa-map-marker"></i></span>
									<span>{siteConfig.contact.address}</span>
								</span>
							</li>
							<li>
								<span className="icon-inline">
									<span className="icon-styled color-main"><i className="fa fa-phone"></i></span>
									<span>{siteConfig.contact.phone}</span>
								</span>
							</li>
							<li>
								<span className="icon-inline">
									<span className="icon-styled color-main"><i className="fa fa-envelope"></i></span>
									<span>{siteConfig.contact.email}</span>
								</span>
							</li>
						</ul>
					</div>
					<img className="marker-icon" src={`${import.meta.env.BASE_URL}images/map_marker_icon.png`} alt="" />
				</div>
			</section>

			<section id="contact-form-section" className="ls s-pt-50 s-pb-130 c-gutter-60 contacts">
				<div className="container">
					<div className="row">
						<div className="divider-20 d-none d-xl-block"></div>

						<ContactForm />
						<ContactInfo />

						<div className="divider-30 d-none d-xl-block"></div>
					</div>
				</div>
			</section>
		</>
	);
};

export default Contact;
