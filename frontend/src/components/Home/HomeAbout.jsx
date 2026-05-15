import React from 'react';
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

	const achievements = siteConfig.about?.achievements?.length > 0
		? siteConfig.about.achievements
		: FALLBACK_ACHIEVEMENTS;

	let videoUrl = siteConfig.about?.videoUrl || '';
	if (videoUrl.includes('drive.google.com/file/d/') && videoUrl.includes('/view')) {
		videoUrl = videoUrl.replace(/\/view.*/, '/preview');
	}
	const videoCover = siteConfig.about?.videoCover || '';

	return (
		<section className="ls ms s-pt-lg-100 s-pb-lg-75 c-my-0 video-part right-part-bg text-center text-md-left" id="about">
			<div className="cover-image s-cover-left"></div>
			<div className="row align-items-center">
				<div className="col-12 col-lg-6 order-lg-1">
					{(videoCover || videoUrl) && (
						<a href={videoCover} className="photoswipe-link" data-iframe={videoUrl}>
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
				<div className="col-12 col-lg-6 order-lg-2  animate" data-animation="slideInRight">
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
