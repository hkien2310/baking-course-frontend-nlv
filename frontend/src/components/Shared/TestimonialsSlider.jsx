import React, { useRef } from 'react';
import { imageUrl } from '../../utils/imageUrl';

const TestimonialsSlider = ({ works = [] }) => {
  const carouselRef = useRef(null);

  if (!works || works.length === 0) return null;

return (
	<section className="ls ms s-pt-lg-130 s-pb-lg-130 c-gutter-100 c-my-0 left-part-bg testimonials-section text-center text-md-left" id="san-pham-hoc-vien">
		<div ref={carouselRef} className="owl-carousel owl-nav-bottom" data-responsive-lg="1" data-responsive-md="1" data-responsive-sm="1" data-responsive-xs="1" data-nav="true" data-loop="true" data-margin="0">
{works.map((work, index) => (
			<div key={work.id} className="owl-section-item" style={{ display: 'flex', minHeight: '100%' }}>
				<div 
className="cover-image s-cover-right" 
style={{ 
backgroundImage: `url(${imageUrl(work.imageUrl, `${import.meta.env.BASE_URL}images/gallery/09.jpg`)})`,
backgroundPosition: 'center',
backgroundSize: 'cover',
height: '100%'
}}
>
					<img 
src={imageUrl(work.imageUrl, `${import.meta.env.BASE_URL}images/gallery/09.jpg`)} 
alt={work.studentName} 
style={{ display: 'none' }}
/>
				</div>
				<div className="container" style={{ display: 'flex', alignItems: 'center' }}>
					<div className="row w-100">
						<div className="col-lg-6 order-lg-2">
						</div>
						<div className={`col-lg-6 order-lg-1 ${index === 0 ? 'animate' : ''}`} data-animation={index === 0 ? "slideInLeft" : ""}>
							<div className="d-none d-lg-block divider-120"></div>
							<div className="item-content" style={{ marginLeft: 0 }}>
								<header>
									<div className="icon-image">
										<img src={`${import.meta.env.BASE_URL}images/icon-4.png`} alt="" />
									</div>
									<h6 className="small-text color-main2">
										Đánh giá
									</h6>
									<h3>
										Sản phẩm của học viên
									</h3>
								</header>
								<p>
									{work.description}
								</p>
								<h4 className="text-left">{work.studentName}</h4>
								<h6 className="small-text text-left color-main">{work.program?.title}</h6>
							</div>
							<div className="d-none d-lg-block divider-120"></div>
						</div>
					</div>
				</div>
			</div>
))}
		</div>
<style dangerouslySetInnerHTML={{ __html: `
#san-pham-hoc-vien .owl-stage { display: flex; }
#san-pham-hoc-vien .owl-item { display: flex; flex: 1 0 auto; }
#san-pham-hoc-vien .owl-section-item { width: 100%; }
`}} />
...
			<div className="gt3_svg_line bottom-line">
				<svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="308px" height="41px" viewBox="0 0 308.000000 41.000000" preserveAspectRatio="xMidYMid meet">
					<g transform="translate(0.000000,41.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
						<path d="M1280 395 c-174 -30 -287 -70 -558 -199 -271 -129 -410 -171 -617 -185 -61 -5 585 -8 1435 -8 850 0 1498 3 1440 7 -212 15 -344 54 -625 187 -285 135 -382 169 -560 198 -111 18 -409 18 -515 0z"/>
					</g>
				</svg>
			</div>
		</section>
	);
};

export default TestimonialsSlider;
