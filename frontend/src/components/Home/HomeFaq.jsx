import React from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { siteConfig } from '../../config/siteConfig';

const HomeFaq = () => {
  const { t } = useTranslation();
  return (
    <section className="s-pt-40 s-pb-50 s-py-lg-130 ds faq s-overlay bg-card" id="faq">
				<div className="container">
					<div className="divider-25"></div>
					<div className="row c-gutter-60">
						<div className="col-12 text-center">
							<div className="section-heading">
								<h6 className="small-text color-main2">{t('home.faq.subtitle')}</h6>
								<h3>{t('home.faq.title')}</h3>
								<img className="image-wrap" src={`${import.meta.env.BASE_URL}images/icon-main.png`} alt=""/>
							</div>
						</div>
						<div className="d-none d-lg-block divider-60"></div>
						<div className="col-md-6">
							<div id="accordion01" role="tablist">
								<div className="card">
									<div className="card-header" role="tab" id="collapse01_header">
										<h5>
											<a data-toggle="collapse" href="#collapse01" aria-expanded="true" aria-controls="collapse01">
												<i className="fa fa-pencil" aria-hidden="true"></i>
												Làm sao để đăng ký khóa học trên {siteConfig.name}?
											</a>
										</h5>
									</div>

									<div id="collapse01" className="collapse show" role="tabpanel" aria-labelledby="collapse01_header" data-parent="#accordion01">
										<div className="card-body">
											<p>
												Rất đơn giản, bạn chỉ cần tạo tài khoản, chọn khóa học mình yêu thích và nhấn nút "Đăng ký". Bạn có thể thanh toán qua VNPay hoặc chuyển khoản trực tiếp.
											</p>

										</div>
									</div>
								</div>

								<div className="card">
									<div className="card-header" role="tab" id="collapse02_header">
										<h5>
											<a className="collapsed" data-toggle="collapse" href="#collapse02" aria-expanded="false" aria-controls="collapse02">
												<i className="fa fa-pencil" aria-hidden="true"></i>
												Khóa học có thời hạn sử dụng không?
											</a>
										</h5>
									</div>
									<div id="collapse02" className="collapse" role="tabpanel" aria-labelledby="collapse02_header" data-parent="#accordion01">
										<div className="card-body">
											<p>
												Sau khi kích hoạt, bạn sẽ có quyền truy cập vĩnh viễn vào toàn bộ video bài giảng, tài liệu hướng dẫn và công thức.
											</p>
										</div>
									</div>
								</div>

								<div className="card">
									<div className="card-header" role="tab" id="collapse04_header">
										<h5>
											<a className="collapsed" data-toggle="collapse" href="#collapse04" aria-expanded="false" aria-controls="collapse04">
												<i className="fa fa-pencil" aria-hidden="true"></i>
												Tôi chưa biết gì về làm bánh, liệu có học được không?
											</a>
										</h5>
									</div>
									<div id="collapse04" className="collapse" role="tabpanel" aria-labelledby="collapse04_header" data-parent="#accordion01">
										<div className="card-body">
											<p>
												Hoàn toàn được! Các khóa học trên {siteConfig.name} được thiết kế từ cơ bản đến nâng cao. Giáo viên sẽ hướng dẫn từng bước chi tiết để bạn có thể thực hành thành công ngay từ lần đầu.
											</p>
										</div>
									</div>
								</div>

								<div className="card">
									<div className="card-header" role="tab" id="collapse05_header">
										<h5>
											<a className="collapsed" data-toggle="collapse" href="#collapse05" aria-expanded="false" aria-controls="collapse05">
												<i className="fa fa-pencil" aria-hidden="true"></i>
												Nếu mua nhầm, tôi có được hoàn tiền không?
											</a>
										</h5>
									</div>
									<div id="collapse05" className="collapse" role="tabpanel" aria-labelledby="collapse05_header" data-parent="#accordion01">
										<div className="card-body">
											<p>
												Chính sách của {siteConfig.name} cho phép hoàn tiền 100% trong vòng 7 ngày đầu tiên nếu bạn chưa xem quá 3 bài giảng và cảm thấy không phù hợp với khóa học.
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="col-md-6">
							<div className="ls page_map" style={{ position: 'relative' }}>
								<iframe 
									src={siteConfig.contact.googleMapsUrl} 
									width="100%" 
									height="100%" 
									style={{position: 'absolute', top: 0, left: 0, border: 0, zIndex: 0}} 
									allowFullScreen="" 
									aria-hidden="false" 
									tabIndex="0"
									title={`${siteConfig.name} Location`}
								></iframe>
								<div className="marker" style={{ zIndex: 1 }}>
									<div className="marker-address">{siteConfig.contact.address}</div>
									<div className="marker-title">{siteConfig.name}</div>
									<div className="marker-description">

										<ul className="list-unstyled">
											<li>
												<span className="icon-inline">
													<span className="icon-styled color-main">
														<i className="fa fa-map-marker"></i>
													</span>

													<span>
														{siteConfig.contact.address}
													</span>
												</span>
											</li>

											<li>
												<span className="icon-inline">
													<span className="icon-styled color-main">
														<i className="fa fa-clock-o"></i>
													</span>

													<span>
														{siteConfig.contact.workingHours || 'T2-T7: 8:00 - 17:00'}
													</span>
												</span>
											</li>
										</ul>
									</div>

									<img className="marker-icon" src={`${import.meta.env.BASE_URL}images/map_marker_icon2.png`} alt=""/>
								</div>

							</div>
						</div>
					</div>
					<div className="divider-20"></div>
				</div>
			</section>
  );
};

export default HomeFaq;
