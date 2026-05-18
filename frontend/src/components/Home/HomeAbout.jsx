import React, { useEffect } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useSiteConfig } from '../../context/SiteConfigContext';

const FALLBACK_ACHIEVEMENTS = [
	{ icon: 'fa-trophy', title: 'Đạt Hơn 50 Giải Thưởng Nấu Ăn', desc: 'Chứng nhận chất lượng xuất sắc, mang về các giải thưởng lớn nhỏ tại các cuộc thi làm bánh và nấu ăn trong nước cũng như quốc tế.' },
	{ icon: 'fa-group', title: '27 Đầu Bếp - Chuyên Gia Đào Tạo', desc: 'Đội ngũ giảng viên giàu kinh nghiệm, tận tâm hướng dẫn và đồng hành cùng học viên từ những bước cơ bản nhất.' },
	{ icon: 'fa-hourglass-half', title: 'Cam Kết Việc Làm Nhanh Chóng', desc: 'Hỗ trợ định hướng nghề nghiệp, giới thiệu học viên đến các môi trường làm việc chuyên nghiệp ngay sau khi tốt nghiệp.' },
];

const HomeAbout = () => {
	const { t } = useTranslation();
	const { siteConfig } = useSiteConfig();

	useEffect(() => {
		// Custom logic to force Photoswipe to close when tapping background on mobile
		// This bypasses Photoswipe's default tapAction:'toggleControls' and avoids main.js caching issues
		let touchStartY = 0;
		let touchStartX = 0;

		const handleTouchStart = (e) => {
			if (e.touches.length > 0) {
				touchStartX = e.touches[0].clientX;
				touchStartY = e.touches[0].clientY;
			}
		};

		const handleTouchEnd = (e) => {
			const pswp = document.querySelector('.pswp');
			if (!pswp || !pswp.classList.contains('pswp--open')) return;

			// Ignore taps on the top UI bar (close, share, etc.)
			if (e.target.closest('.pswp__ui')) return;

			if (e.changedTouches.length > 0) {
				const endX = e.changedTouches[0].clientX;
				const endY = e.changedTouches[0].clientY;
				
				// If movement is less than 10px, it's considered a tap (not a swipe)
				if (Math.abs(endX - touchStartX) < 10 && Math.abs(endY - touchStartY) < 10) {
					const closeBtn = document.querySelector('.pswp__button--close');
					if (closeBtn) {
						// Trigger close
						closeBtn.click();
						
						// Guarantee iframe stops playing immediately
						setTimeout(() => {
							const iframes = pswp.querySelectorAll('iframe');
							iframes.forEach(iframe => {
								iframe.src = '';
								iframe.remove();
							});
						}, 100);
					}
				}
			}
		};

		document.addEventListener('touchstart', handleTouchStart, { passive: true });
		document.addEventListener('touchend', handleTouchEnd, { passive: true });

		return () => {
			document.removeEventListener('touchstart', handleTouchStart);
			document.removeEventListener('touchend', handleTouchEnd);
		};
	}, []);

	const achievements = siteConfig.about?.achievements?.length > 0
		? siteConfig.about.achievements
		: FALLBACK_ACHIEVEMENTS;

	let videoUrl = siteConfig.about?.videoUrl || '';
	
	// Format Google Drive URLs
	if (videoUrl.includes('drive.google.com/file/d/') && videoUrl.includes('/view')) {
		videoUrl = videoUrl.replace(/\/view.*/, '/preview');
	}
	
	// Format YouTube URLs to proper embed format to prevent X-Frame-Options blocking
	if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
		let videoId = '';
		if (videoUrl.includes('youtu.be/')) {
			videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
		} else if (videoUrl.includes('v=')) {
			videoId = videoUrl.split('v=')[1].split('&')[0];
		} else if (videoUrl.includes('/embed/')) {
			videoId = videoUrl.split('/embed/')[1].split('?')[0];
		} else if (videoUrl.includes('/shorts/')) {
			videoId = videoUrl.split('/shorts/')[1].split('?')[0];
		}
		
		if (videoId) {
			videoUrl = `https://www.youtube.com/embed/${videoId}`;
		}
	}

	// Format Vimeo URLs to proper embed format to prevent X-Frame-Options blocking
	if (videoUrl.includes('vimeo.com')) {
		const vimeoMatch = videoUrl.match(/vimeo\.com\/(\d+)/);
		if (vimeoMatch) {
			videoUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&title=0&byline=0&portrait=0`;
		}
	}

	const videoCover = siteConfig.about?.videoCover || '';

	return (
		<section className="ls ms s-pt-lg-100 s-pb-lg-75 c-my-0 video-part right-part-bg text-center text-md-left" id="about">
			<div className="cover-image s-cover-left"></div>
			<div className="row align-items-center">
				<div className="col-12 col-lg-6 order-lg-1">
					{(videoCover || videoUrl) && (
						<a href={videoCover} className="photoswipe-link" data-iframe={videoUrl} data-autoplay="true">
							<img src={videoCover} alt="YUM Saigon About Video" style={{ width: '100%', objectFit: 'cover' }} />
							<div className="video-text">
								<h5>
									<span>{t('home.about.watch')}</span>
									<span className=" iframe-link"></span>
									<span>{t('home.about.video')}</span>
								</h5>
							</div>
						</a>
					)}
				</div>
				<div className="col-12 col-lg-6 order-lg-2 animate" data-animation="slideInRight">
					<div className="d-none d-lg-block divider-90"></div>
					<div className="item-content">
						<h6 className="fs-14 color-main">{t('home.about.subtitle')}</h6>
						<h3>{t('home.about.title')}</h3>
						<div className="icon-image">
							<img src={`${import.meta.env.BASE_URL}images/icon-3.png`} alt="" />
						</div>
						<div className="d-none d-lg-block divider-50"></div>
						{achievements.map((item, idx) => (
							<div className="media" key={idx}>
								<div className="icon-styled color-main2">
									<i className={`fa ${item.icon || 'fa-star'}`}></i>
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
			<div className="d-none d-lg-block divider-50"></div>
		</section>
	);
};

export default HomeAbout;
