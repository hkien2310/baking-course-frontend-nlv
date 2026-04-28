import React from 'react';
import { useTranslation } from '../../i18n/LanguageContext';

const HomeAbout = () => {
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
								<span>{t('home.about.watch')}</span>
								<span className=" iframe-link"></span>
								<span>{t('home.about.video')}</span>
							</h5>
						</div>
					</a>
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
						<div className="media">
							<div className="icon-styled color-main2">
								<i className="fa fa-trophy"></i>
							</div>
							<div className="media-body">
								<h5>
									Đạt Hơn 50 Giải Thưởng Nấu Ăn
								</h5>
								<p>
									Chứng nhận chất lượng xuất sắc, mang về các giải thưởng lớn nhỏ tại các cuộc thi làm bánh và nấu ăn trong nước cũng như quốc tế.
								</p>
							</div>
						</div>
						<div className="media">
							<div className="icon-styled color-main2">
								<i className="fa fa-group"></i>
							</div>
							<div className="media-body">
								<h5>
									27 Đầu Bếp - Chuyên Gia Đào Tạo
								</h5>
								<p>
									Đội ngũ giảng viên giàu kinh nghiệm, tận tâm hướng dẫn và đồng hành cùng học viên từ những bước cơ bản nhất.
								</p>
							</div>
						</div>
						<div className="media">
							<div className="icon-styled color-main2">
								<i className="fa fa-hourglass-half"></i>
							</div>
							<div className="media-body">
								<h5>
									Cam Kết Việc Làm Nhanh Chóng
								</h5>
								<p>
									Hỗ trợ định hướng nghề nghiệp, giới thiệu học viên đến các môi trường làm việc chuyên nghiệp ngay sau khi tốt nghiệp.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="d-none d-lg-block divider-50"></div>
		</section>
	);
};

export default HomeAbout;
