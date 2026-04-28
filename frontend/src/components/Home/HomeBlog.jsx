import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useTranslation } from '../../i18n/LanguageContext';

const imgSrc = (path) => {
	if (!path) return `${import.meta.env.BASE_URL}images/gallery/09.jpg`;
	if (path.startsWith('http') || path.startsWith(import.meta.env.BASE_URL) || path.startsWith("/uploads/")) return path;
	return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
};

const HomeBlog = ({ posts = [] }) => {
	const { t } = useTranslation();
	const [activeFilter, setActiveFilter] = useState('*');
	const carouselContainerRef = useRef(null);
	const navigate = useNavigate();

	// Extract unique categories from posts, ignore missing
	const categories = [...new Set(posts.map(post => post.category).filter(Boolean))];

	// Filter posts based on active tab
	const filteredPosts = activeFilter === '*'
	  ? posts
	  : posts.filter(post => {
		  const catClass = post.category ? `.${post.category.toLowerCase().replace(/\s+/g, '-')}` : '';
		  return catClass === activeFilter;
		});

	// Re-initialize Owl Carousel when items change
	useEffect(() => {
	  if (!window.jQuery || posts.length === 0) return;
	  
	  // Delay to ensure React finishes DOM painting
	  const timer = setTimeout(() => {
		const $el = window.jQuery(carouselContainerRef.current).find('.owl-carousel');
		
		// Destroy previous instance completely to avoid artifacts
		if ($el.hasClass('owl-loaded')) {
		  $el.trigger('destroy.owl.carousel').removeClass('owl-loaded owl-hidden').find('.owl-stage-outer').children().unwrap();
		}

		$el.owlCarousel({
		  loop: true,
		  margin: 30,
		  nav: true,
		  autoplay: false,
		  dots: false,
		  themeClass: 'owl-theme',
		  center: false,
		  navText: ['<i class="fa fa-angle-left">','<i class="fa fa-angle-right">'],
		  items: 4,
		  responsive: {
			0: { items: 1 },
			767: { items: 2 },
			992: { items: 2 },
			1200: { items: 3 }
		  }
		});

		// Trigger fade animation to simulate original filter effect
		$el.find('.owl-item').addClass('scaleAppear');
		
		// Unfreeze container height to restore responsiveness
		if (carouselContainerRef.current) {
			carouselContainerRef.current.style.height = 'auto';
		}

	  }, 50);

	  return () => clearTimeout(timer);
	}, [filteredPosts, posts.length]);
	
	// Intercept React Router SPA navigation gracefully
	useEffect(() => {
		const el = carouselContainerRef.current;
		if (!el) return;
	
		const handleCarouselClick = (e) => {
		  const aClick = e.target.closest('a');
		  if (aClick && aClick.getAttribute('href')) {
			const href = aClick.getAttribute('href');
			if (href.startsWith('#')) return;
			const baseUrl = import.meta.env.BASE_URL || '/';
			if (href.startsWith(baseUrl)) {
			  e.preventDefault();
			  const targetPath = href.substring(baseUrl.length - 1);
			  navigate(targetPath);
			}
		  }
		};
		el.addEventListener('click', handleCarouselClick);
		return () => el.removeEventListener('click', handleCarouselClick);
	}, [navigate]);

	const handleFilterClick = (e, filterVal) => {
	  e.preventDefault();
	  if (activeFilter === filterVal) return;
	  
	  // Freeze height to prevent visual jump while unmounting and remounting carousel
	  if (carouselContainerRef.current) {
		  carouselContainerRef.current.style.height = `${carouselContainerRef.current.offsetHeight}px`;
	  }
	  setActiveFilter(filterVal);
	};

	return (
		<section className="ls s-py-40 s-py-lg-130 blog-carousel animate" data-animation="fadeInUp" id="blog">
			<div className="container">
				<div className="divider-25"></div>
				<div className="row">
					<div className="col-sm-12 text-center">
						<div className="section-heading">
							<h6 className="small-text color-main">{t('home.blog.subtitle')}</h6>
							<h3>{t('home.blog.title')}</h3>
						</div>
						<div className="d-block d-md-none divider-20"></div>
						<div className="row justify-content-center">
							<div className="col-md-10 col-xl-6">
								<div className="filters gallery-filters small-text text-lg-right">
									<a href="#all" onClick={(e) => handleFilterClick(e, '*')} className={activeFilter === '*' ? "active selected" : ""}>{t('home.blog.allCategories')}</a>
									{categories.map(cat => {
										const filterClass = `.${cat.toLowerCase().replace(/\s+/g, '-')}`;
										return (
											<a key={filterClass} href={`#${filterClass}`} onClick={(e) => handleFilterClick(e, filterClass)} className={activeFilter === filterClass ? "active selected" : ""}>{cat}</a>
										);
									})}
								</div>
							</div>
						</div>
						
						{/* Wrapping everything in a stable div for our custom jQuery manipulation layer */}
						<div ref={carouselContainerRef}>
							{/* Note: data-filters is REMOVED to disable buggy main.js override. key={activeFilter} forces React to unmount completely. */}
							<div key={activeFilter} className="owl-carousel carousel-nav">
								{filteredPosts.map((post) => {
									const catClass = post.category ? post.category.toLowerCase().replace(/\s+/g, '-') : '';
									return (
										<article key={post.id} className={`vertical-item text-center content-padding padding-small bordered post type-post status-publish format-standard has-post-thumbnail ${catClass}`}>
											<div className="item-media post-thumbnail">
												<img src={imgSrc(post.thumbnail)} alt={post.title} />
												<div className="media-links">
													<Link className="abs-link" to={ROUTES.POST_DETAIL(post.slug)}></Link>
												</div>
												<div className="entry-meta small-text bg-dark-transpatent">
													<span className="byline">
														<span className="posted-on">
														<span className="screen-reader-text">Posted on</span>
														<Link to={ROUTES.POST_DETAIL(post.slug)} rel="bookmark">
															<i className="fa fa-calendar color-main2"></i>
															<time dateTime={post.dateIso || post.createdAt} className="entry-date published updated">{new Date(post.createdAt || post.dateIso || new Date()).toLocaleDateString('vi-VN')}</time>
														</Link>
													</span>
													<span className="category-links links-maincolor">
														<span className="screen-reader-text">Categories</span>
														<Link to={ROUTES.POST_DETAIL(post.slug)} rel="category tag">
															<i className="fa fa-tags color-main2"></i>
															{post.category || 'Uncategorized'}
														</Link>
													</span>
													<span className="author vcard">
														<Link className="url fn n" to={ROUTES.POST_DETAIL(post.slug)}>
															<i className="fa fa-user color-main2"></i>
															{post.authorName || 'Admin'}
														</Link>
													</span>
													</span>
												</div>
											</div>
	
											<div className="item-content">
												<header className="entry-header">
													<h4 className="entry-title">
														<Link to={ROUTES.POST_DETAIL(post.slug)} rel="bookmark">
															{post.title}
														</Link>
													</h4>
												</header>
	
												<div className="entry-content">
													<p>{post.desc}</p>
												</div>
											</div>
	
											<div className="text-center blog-btn ">
												<Link to={ROUTES.POST_DETAIL(post.slug)} className="btn btn-outline-maincolor">{t('common.viewMore')}</Link>
											</div>
										</article>
									);
								})}
							</div>
						</div>
						<div className="divider-30 d-none d-xl-block"></div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default HomeBlog;
