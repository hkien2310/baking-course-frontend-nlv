import { useInitOnLoaded } from '../hooks/useInitOnLoaded';
import './ProgramDetail.css';
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PageTitle from '../components/Shared/PageTitle';
import { getProgramBySlug } from '../services/api';
import { toast } from 'react-toastify';
import { formatPrice, formatStudentCount, calcDiscountPercent } from '../utils/formatters';
import { ROUTES } from '../constants/routes';
import { useTranslation } from '../i18n/LanguageContext';
import Input from '../components/Shared/Input';
import { imageUrl } from '../utils/imageUrl';

const VI_DAYS = {
  MONDAY: 'Thứ 2',
  TUESDAY: 'Thứ 3',
  WEDNESDAY: 'Thứ 4',
  THURSDAY: 'Thứ 5',
  FRIDAY: 'Thứ 6',
  SATURDAY: 'Thứ 7',
  SUNDAY: 'Chủ Nhật'
};

const ProgramDetail = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [premiumTab, setPremiumTab] = useState('videos');

  // Convert regular YouTube/Vimeo URLs to embeddable format + strip overlays
  const toEmbedUrl = (url) => {
    if (!url) return '';
    // YouTube: watch?v=ID or youtu.be/ID → /embed/ID
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    if (ytMatch) return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&disablekb=1`;
    // Already a youtube embed URL → append params
    const ytEmbedMatch = url.match(/youtube\.com\/embed\/([\w-]+)/);
    if (ytEmbedMatch) return `https://www.youtube-nocookie.com/embed/${ytEmbedMatch[1]}?rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&disablekb=1`;
    // Vimeo: vimeo.com/ID → player.vimeo.com/video/ID
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?title=0&byline=0&portrait=0`;
    // Google Drive or other → return as-is
    return url;
  };

  useEffect(() => {
    getProgramBySlug(slug)
      .then(data => {
        setProgram(data);
        
        // Auto-select first upcoming session if exists
        if (data.classSessions && data.classSessions.length > 0) {
          const upcoming = data.classSessions.filter(s => new Date(s.startDate) >= new Date());
          if (upcoming.length > 0) {
            setSelectedSessionId(upcoming[0].id);
          } else {
            setSelectedSessionId(data.classSessions[0].id);
          }
        }
        
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch Program details", err);
        setLoading(false);
      });
  }, [slug]);

  useInitOnLoaded(loading);

  if (loading) {
    return (
      <div className="text-center" style={{ padding: '150px 0' }}>
        <h2>{t('programDetail.loading')}</h2>
        <div className="spinner-border" role="status"></div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="text-center" style={{ padding: '150px 0' }}>
        <h2>{t('programDetail.notFound')}</h2>
      </div>
    );
  }

  const hasPurchased = program.hasPurchased === true;
  const orderStatus = program.orderStatus;
  const premiumContent = program.premiumContent;

  // Determine CTA button state
  const getCTAButton = () => {
    if (hasPurchased) {
      return (
        <button className="btn btn-success btn-block" disabled>
          <i className="fa fa-check-circle mr-1"></i> {t('programDetail.owned')}
        </button>
      );
    }
    const checkoutUrl = selectedSessionId 
      ? `${ROUTES.CHECKOUT(slug)}?session=${selectedSessionId}`
      : ROUTES.CHECKOUT(slug);

    if (orderStatus === 'PENDING' || orderStatus === 'AWAITING_CONFIRM') {
      return (
        <button 
          className="btn-enroll btn-warning" 
          onClick={() => navigate(checkoutUrl)}
        >
          <i className="fa fa-clock-o"></i> TIẾP TỤC THANH TOÁN
        </button>
      );
    }
    if (program.price && program.price > 0) {
      const buyPrice = program.salePrice && program.price > program.salePrice ? program.salePrice : program.price;
      return (
        <button 
          className="btn-enroll" 
          onClick={() => navigate(checkoutUrl)}
        >
          <i className="fa fa-shopping-cart"></i> MUA KHÓA HỌC NÀY
        </button>
      );
    }
    return (
      <a href={`/?session=${selectedSessionId}#contacts`} className="btn-enroll">
        {t('programDetail.enrollFree')}
      </a>
    );
  };

  const imgSrc = (src) => imageUrl(src, `${import.meta.env.BASE_URL}images/gallery/09.jpg`);

  return (
    <>
      <PageTitle 
        title={t('programDetail.title') || 'Chi Tiết Khóa Học'}
        breadcrumbs={[
          { label: t('header.home'), link: '/' }, 
          { label: t('header.programs') || 'Khóa Học', link: ROUTES.PROGRAM }, 
          { label: program.title }
        ]}
      />
      
      <section className="ls s-pt-75 s-pb-0 s-py-lg-100 c-gutter-60 program-single">
        <div className="container">
          <div className="row">
            <main className={`${hasPurchased ? 'col-12' : 'col-lg-7 col-xl-8'} vertical-item content-padding`}>
              <div className="item-media">
                {program.thumbnail && (
                  <img src={imgSrc(program.thumbnail)} alt={program.title} />
                )}
                
                <div className="content-absolute bg-maincolor-transparent text-left ds">
                  <div className="d-inline">
                    <span>
                      <i className="fa fa-users color-light"></i>
                      {program.students || 0}
                    </span>
                    <span>
                      <i className="fa fa-comments color-light"></i>
                      {program.reviews || 0}
                    </span>
                    <span>
                      <i className="fa fa-money color-light"></i>
                      {formatPrice(program.salePrice && program.price > program.salePrice ? program.salePrice : program.price)}
                    </span>
                  </div>
                </div>
              </div>
                
              <div className="item-content bordered">
                <h4>{program.title}</h4>
                <div className="content-preview mt-4" dangerouslySetInnerHTML={{ __html: program.description?.replace(/\n/g, '<br/>') || t('common.noDescription') || 'Chưa có thông tin mô tả.' }} />

                <div>
                  <div className="row c-mb-5 c-mb-lg-25 mt-4">
                    <div className="col-md-6">
                      <h5>{t('programDetail.willLearn')}</h5>
                      
                      {program.learningGoals && program.learningGoals.map((g, i) => (
                        <React.Fragment key={i}>
                          <span className="small-text fs-14">{g.skill}</span>
                          <div className="progress">
                            <div className={`progress-bar ${i % 2 === 0 ? 'bg-maincolor' : 'bg-maincolor2'}`} role="progressbar" style={{ width: `${g.percent}%` }} aria-valuenow={g.percent} aria-valuemin="0" aria-valuemax="100">
                              <span>{g.percent}%</span>
                            </div>
                          </div>
                        </React.Fragment>
                      ))}
                      
                      {(!program.learningGoals || program.learningGoals.length === 0) && (
                        <p className="text-muted">{t('programDetail.learningGoalsEmpty')}</p>
                      )}
                    </div>
                    
                    <div className="col-md-6">
                      <h5>{t('programDetail.classIncludes')}</h5>
                      <ul className="list-styled">
                        {program.classIncludes && program.classIncludes.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                      {(!program.classIncludes || program.classIncludes.length === 0) && (
                        <p className="text-muted">{t('programDetail.classIncludesEmpty')}</p>
                      )}
                    </div>
                  </div>

                  <h4 className="mt-5 mb-4">{t('programDetail.curriculum')}</h4>
                  <div id="accordion01" role="tablist">
                    {program.curriculum && program.curriculum.map((mod, i) => (
                      <div className="card" key={i}>
                        <div className="card-header" role="tab" id={`collapse${i}_header`}>
                          <h5>
                            <a data-toggle="collapse" href={`#collapse${i}`} aria-expanded={i === 0 ? "true" : "false"} aria-controls={`collapse${i}`} className={i === 0 ? "" : "collapsed"}>
                              {mod.title}
                            </a>
                          </h5>
                        </div>
                        <div id={`collapse${i}`} className={`collapse ${i === 0 ? 'show' : ''}`} role="tabpanel" aria-labelledby={`collapse${i}_header`} data-parent="#accordion01">
                          <div className="card-body">
                            {mod.content}
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!program.curriculum || program.curriculum.length === 0) && (
                      <p className="text-muted">{t('programDetail.curriculumEmpty')}</p>
                    )}
                  </div>
                </div>

                {/* Premium Content — with tabs, displayed after purchase */}
                {hasPurchased && premiumContent && (
                  <div className="mt-5">
                    <h4 className="mb-4">Nội dung khóa học</h4>

                    {/* Tabs */}
                    <div className="premium-tabs mb-4">
                      {premiumContent.videos?.length > 0 && (
                        <button
                          className={`premium-tab ${premiumTab === 'videos' ? 'active' : ''}`}
                          onClick={() => setPremiumTab('videos')}
                        >
                          <i className="fa fa-play-circle mr-1"></i> Video Bài Giảng
                        </button>
                      )}
                      {premiumContent.resources?.length > 0 && (
                        <button
                          className={`premium-tab ${premiumTab === 'resources' ? 'active' : ''}`}
                          onClick={() => setPremiumTab('resources')}
                        >
                          <i className="fa fa-file-pdf-o mr-1"></i> Tài Liệu
                        </button>
                      )}
                      {premiumContent.guides && (
                        <button
                          className={`premium-tab ${premiumTab === 'guides' ? 'active' : ''}`}
                          onClick={() => setPremiumTab('guides')}
                        >
                          <i className="fa fa-book mr-1"></i> Hướng Dẫn
                        </button>
                      )}
                    </div>

                    {/* Videos Panel */}
                    {premiumTab === 'videos' && premiumContent.videos?.length > 0 && (
                      <div>
                        {premiumContent.videos.map((video, i) => (
                          <div className="video-card mb-4" key={i}>
                            <div className="video-wrapper" onContextMenu={e => e.preventDefault()}>
                              <iframe 
                                src={toEmbedUrl(video.url)} 
                                title={video.title || `Lesson ${i + 1}`} 
                                allowFullScreen
                              ></iframe>
                            </div>
                            <div className="video-info">
                              <span className="video-num">{t('premium.lessonNum', { num: i + 1 })}</span>
                              <h6>{video.title || t('premium.lessonFallback', { num: i + 1 })}</h6>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Resources Panel */}
                    {premiumTab === 'resources' && premiumContent.resources?.length > 0 && (
                      <div>
                        {premiumContent.resources.map((res, i) => (
                          <a href={res.url} target="_blank" rel="noopener noreferrer" className="resource-card mb-3" key={i}>
                            <div className="resource-icon">
                              <i className="fa fa-file-pdf-o"></i>
                            </div>
                            <div className="resource-info">
                              <h6>{res.title || `Resource ${i + 1}`}</h6>
                              <small>{t('premium.downloadHint')}</small>
                            </div>
                            <i className="fa fa-download resource-dl"></i>
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Guides Panel */}
                    {premiumTab === 'guides' && premiumContent.guides && (
                      <div className="guide-content">
                        <div dangerouslySetInnerHTML={{ __html: premiumContent.guides.replace(/\n/g, '<br/>') }} />
                      </div>
                    )}
                  </div>
                )}

                {/* Lock Overlay for Non-Purchasers */}
                {!hasPurchased && program.price > 0 && (
                  <div className="premium-lock mt-5">
                    <div className="premium-lock-inner">
                      {/* FOMO Preview — show blurred content hints */}
                      <div className="premium-lock-preview">
                        <div className="lock-preview-item"><i className="fa fa-play-circle"></i> {t('premium.lock.previewVideos')}</div>
                        <div className="lock-preview-item"><i className="fa fa-file-pdf-o"></i> {t('premium.lock.previewResources')}</div>
                        <div className="lock-preview-item"><i className="fa fa-book"></i> {t('premium.lock.previewGuides')}</div>
                      </div>

                      <div className="premium-lock-content">
                        <div className="lock-icon-wrap">
                          <i className="fa fa-lock"></i>
                        </div>
                        <h4>{t('premium.lock.title')}</h4>
                        <p>{t('premium.lock.description')}</p>
                        <button 
                          className="btn btn-maincolor btn-lg lock-cta"
                          onClick={() => navigate(ROUTES.CHECKOUT(slug))}
                        >
                          <i className="fa fa-shopping-cart mr-2"></i> {t('premium.lock.unlock', { price: formatPrice(program.salePrice && program.price > program.salePrice ? program.salePrice : program.price) })}
                        </button>
                      </div>
                    </div>
                  </div>
                )}


              </div>
            </main>

            {!hasPurchased && (
            <aside className="col-lg-5 col-xl-4">
              <div className="bg-maincolor2 widget-search p-30 mb-60 mt-5 mt-lg-0">
                <div className="widget widget_search">
                  <h5>{t('programDetail.search') || 'Tìm kiếm trên Website'}</h5>
                  <p>{t('programDetail.searchDesc') || 'Tìm kiếm thêm tin tức và ưu đãi hấp dẫn'}</p>
                  <form role="search" className="search-form" onSubmit={(e) => {
                    e.preventDefault();
                    const val = e.target.search.value;
                    if (val) navigate(`${ROUTES.PROGRAM}?search=${encodeURIComponent(val)}`);
                  }}>
                    <label htmlFor="search-form-widget">
                      <span className="screen-reader-text">Search for:</span>
                    </label>
                    <div className="d-flex position-relative">
                      <Input 
                        type="search" 
                        id="search-form-widget" 
                        inputClassName="search-field" 
                        placeholder={t('programDetail.searchPlaceholder') || 'Nhập từ khóa...'} 
                        defaultValue="" 
                        name="search"
                        wrapperClassName="w-100"
                      />
                      <button type="submit" className="search-submit" style={{ position: 'absolute', right: 0, top: 0, height: '100%', border: 'none', background: 'transparent', padding: '0 15px' }}>
                        <span className="screen-reader-text">{t('programDetail.searchPlaceholder') || 'Nhập từ khóa...'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="enrollment-widget widget_categories">
                <h3 className="widget-title">
                  {t('programDetail.getCourse') || 'Đăng ký khóa học'}
                </h3>
                <p>{t('programDetail.joinStudents', { count: program.students || 0 }) || `Cùng ${program.students || 0} học viên đã đăng ký trải nghiệm tuyệt vời này.`}</p>
                
                <div className="price-container mt-4">
                  {program.salePrice && program.price > program.salePrice ? (
                    <>
                      <div className="d-flex align-items-center justify-content-center" style={{ gap: '10px', marginBottom: '4px' }}>
                        <span className="price-original" style={{ margin: 0 }}>
                          {formatPrice(program.price)}
                        </span>
                        {calcDiscountPercent(program.price, program.salePrice) && (
                          <span className="discount-badge sale-badge" style={{ margin: 0 }}>
                            -{calcDiscountPercent(program.price, program.salePrice)}%
                          </span>
                        )}
                      </div>
                      <span className="price-sale">
                        {formatPrice(program.salePrice)}
                      </span>
                    </>
                  ) : (
                    <span className="price-sale">
                      {formatPrice(program.price)}
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  {getCTAButton()}
                  {orderStatus === 'REJECTED' && (
                    <div className="mt-3 text-center">
                      <small className="text-danger">
                        <i className="fa fa-exclamation-triangle mr-1"></i>
                        {t('programDetail.rejectedMsg') || 'Thanh toán trước đó bị từ chối.'} 
                        <br/>
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate(ROUTES.CHECKOUT(slug)); }} className="color-main font-weight-bold"> {t('programDetail.tryAgain') || 'Thử lại'}</a>
                      </small>
                    </div>
                  )}
                  
                  <div className="secure-payment">
                    <i className="fa fa-lock"></i> Thanh toán an toàn & bảo mật 100%
                  </div>
                  
                  <div className="features-list">
                    <div className="feature-item"><i className="fa fa-check-circle"></i> Truy cập không giới hạn trọn đời</div>
                    <div className="feature-item"><i className="fa fa-check-circle"></i> Hỗ trợ hỏi đáp 1-1 với giảng viên</div>
                    <div className="feature-item"><i className="fa fa-check-circle"></i> Tài liệu công thức chuẩn định lượng</div>
                  </div>
                </div>
              </div>
            </aside>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default ProgramDetail;
