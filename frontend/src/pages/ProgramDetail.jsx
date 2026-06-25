import { useInitOnLoaded } from '../hooks/useInitOnLoaded';
import './ProgramDetail.css';
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PageTitle from '../components/Shared/PageTitle';
import PageLoading from '../components/Shared/PageLoading';
import UniversalVideoPlayer from '../components/Shared/Video/UniversalVideoPlayer';
import { getProgramBySlug, submitStudentWork, uploadImage, getMe, getApprovedStudentWorks } from '../services/api';
import { toast } from 'react-toastify';
import { formatPrice, formatStudentCount, calcDiscountPercent } from '../utils/formatters';
import { parseHtmlWithVideos } from '../utils/videoParser';
import { ROUTES } from '../constants/routes';
import { useTranslation } from '../i18n/LanguageContext';
import Input from '../components/Shared/Input';
import LessonCollapse from '../components/Shared/LessonCollapse';
import CourseQA from '../components/Course/CourseQA';
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
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitData, setSubmitData] = useState({ studentName: '', description: '' });
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserName, setCurrentUserName] = useState('');
  const [submitImage, setSubmitImage] = useState(null);
  const [submitImagePreview, setSubmitImagePreview] = useState('');
  const [submittingWork, setSubmittingWork] = useState(false);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('info'); // info, curriculum, studentWorks
  const [studentWorks, setStudentWorks] = useState([]);
  const [loadingWorks, setLoadingWorks] = useState(false);
  const [studentWorksPage, setStudentWorksPage] = useState(1);
  const [hasMoreStudentWorks, setHasMoreStudentWorks] = useState(false);
  const [loadingMoreWorks, setLoadingMoreWorks] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  // Resize listener for responsive behavior
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toEmbedUrl = (url) => {
    if (!url) return '';
    // YouTube: watch?v=ID or youtu.be/ID → /embed/ID
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    if (ytMatch) return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&disablekb=1`;
    // Already a youtube embed URL → append params
    const ytEmbedMatch = url.match(/(?:youtube\.com|youtube-nocookie\.com)\/embed\/([\w-]+)/);
    if (ytEmbedMatch) return `https://www.youtube-nocookie.com/embed/${ytEmbedMatch[1]}?rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&disablekb=1`;
    // Vimeo: vimeo.com/ID → player.vimeo.com/video/ID
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?title=0&byline=0&portrait=0`;

    // Google Drive Folder
    const gDriveFolderMatch = url.match(/drive\.google\.com\/drive\/folders\/([\w-]+)/);
    if (gDriveFolderMatch) return `https://drive.google.com/embeddedfolderview?id=${gDriveFolderMatch[1]}#grid`;

    // Google Drive File (view/preview)
    const gDriveFileMatch = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
    if (gDriveFileMatch) return `https://drive.google.com/file/d/${gDriveFileMatch[1]}/preview`;

    // Google Drive Open format
    const gDriveOpenMatch = url.match(/drive\.google\.com\/open\?id=([\w-]+)/);
    if (gDriveOpenMatch) return `https://drive.google.com/file/d/${gDriveOpenMatch[1]}/preview`;

    // Return as-is for other formats
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

    // Fetch current user name for auto-fill in submit modal
    getMe()
      .then(data => {
        if (data) setCurrentUser(data);
        if (data?.fullName) setCurrentUserName(data.fullName);
      })
      .catch(() => { }); // Silent fail — user might not be logged in
  }, [slug]);

  useEffect(() => {
    if (program && program.id) {
      setLoadingWorks(true);
      setStudentWorksPage(1);
      getApprovedStudentWorks(1, 4, program.id)
        .then(res => {
          setStudentWorks(res.data || []);
          setHasMoreStudentWorks(res.currentPage < res.totalPages);
        })
        .catch(err => console.error("Failed to fetch student works", err))
        .finally(() => setLoadingWorks(false));
    }
  }, [program?.id]);

  const loadMoreStudentWorks = async () => {
    if (!program || !program.id || loadingMoreWorks) return;
    setLoadingMoreWorks(true);
    const nextPage = studentWorksPage + 1;
    try {
      const res = await getApprovedStudentWorks(nextPage, 4, program.id);
      setStudentWorks(prev => {
        const combined = [...prev, ...(res.data || [])];
        const unique = combined.filter((item, index, self) =>
          self.findIndex(t => t.id === item.id) === index
        );
        return unique;
      });
      setStudentWorksPage(res.currentPage);
      setHasMoreStudentWorks(res.currentPage < res.totalPages);
    } catch (err) {
      console.error("Failed to load more student works", err);
    } finally {
      setLoadingMoreWorks(false);
    }
  };

  // Initialize student name when modal opens
  useEffect(() => {
    if (showSubmitModal) {
      setSubmitData({
        studentName: currentUserName || currentUser?.fullName || currentUser?.username || '',
        description: ''
      });
      setSubmitImage(null);
      setSubmitImagePreview('');
    }
  }, [showSubmitModal, currentUser, currentUserName]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh tối đa là 5MB.');
        return;
      }
      setSubmitImage(file);
      setSubmitImagePreview(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSubmitData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitWork = async (e) => {
    e.preventDefault();
    if (!submitData.studentName.trim()) {
      toast.error('Vui lòng nhập tên người nộp.');
      return;
    }
    if (!submitImage) {
      toast.error('Vui lòng tải lên hình ảnh sản phẩm.');
      return;
    }
    if (!submitData.description.trim()) {
      toast.error('Vui lòng nhập mô tả hoặc cảm nhận sản phẩm.');
      return;
    }

    setSubmittingWork(true);
    try {
      // 1. Upload image
      const uploadRes = await uploadImage(submitImage);
      const imgPath = uploadRes.url;

      // 2. Submit student work
      await submitStudentWork({
        studentName: submitData.studentName,
        imageUrl: imgPath,
        description: submitData.description,
        programId: program.id
      });

      toast.success('Nộp bài thành công! Bài của bạn sẽ được duyệt trước khi hiển thị.');
      setShowSubmitModal(false);
    } catch (err) {
      console.error("Submit student work failed", err);
      const errMsg = err.response?.data?.error || 'Có lỗi xảy ra khi nộp sản phẩm.';
      toast.error(errMsg);
    } finally {
      setSubmittingWork(false);
    }
  };

  useInitOnLoaded(loading);

  if (loading) {
    return (
      <>
        <PageTitle
          title={t('programDetail.title') || 'Chi Tiết Khóa Học'}
          breadcrumbs={[
            { label: t('header.home'), link: '/' },
            { label: t('header.programs') || 'Khóa Học', link: ROUTES.PROGRAM },
            { label: '...' }
          ]}
        />
        <PageLoading />
      </>
    );
  }

  if (!program) {
    return (
      <div className="text-center" style={{ padding: '150px 0' }}>
        <h2>{t('programDetail.notFound')}</h2>
      </div>
    );
  }

  const isAdmin = localStorage.getItem('role') === 'ADMIN';
  const hasPurchased = program.hasPurchased === true || isAdmin;
  const orderStatus = program.orderStatus;
  const premiumContent = program.premiumContent;

  // Determine CTA button state
  const getCTAButton = () => {
    if (hasPurchased) {
      return (
        <button className="btn btn-success btn-block" disabled style={{ borderRadius: '50px' }}>
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
          style={{ borderRadius: '50px' }}
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
          style={{ borderRadius: '50px' }}
        >
          <i className="fa fa-shopping-cart"></i> MUA KHÓA HỌC NÀY
        </button>
      );
    }
    return (
      <a href={`/?session=${selectedSessionId}#contacts`} className="btn-enroll" style={{ borderRadius: '50px' }}>
        {t('programDetail.enrollFree')}
      </a>
    );
  };

  const imgSrc = (src) => imageUrl(src, `${import.meta.env.BASE_URL}images/gallery/09.jpg`);

  const LessonContent = ({ video, index }) => {
    const hasVideo = video.url && video.url !== '.' && video.url !== '/';
    return (
      <div className="premium-lesson-detail">
        {hasVideo && (
          <div className="video-wrapper mb-4" onContextMenu={e => e.preventDefault()} style={{ borderRadius: '8px' }}>
            <UniversalVideoPlayer url={video.url} />
          </div>
        )}

        {/* Guides / Content */}
        {video.guides && (
          <div className="guide-content p-3 mb-4" style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
            <div className="quill-content" dangerouslySetInnerHTML={{ __html: video.guides }} />
          </div>
        )}

        {video.resources?.length > 0 && (
          <div className="mb-0">
            <h6 className="font-weight-bold mb-2" style={{ fontSize: '12px', color: '#555' }}>
              <i className="fa fa-paperclip mr-2"></i>Tài liệu đính kèm
            </h6>
            {video.resources.map((res, rIdx) => (
              <a href={res.url} target="_blank" rel="noopener noreferrer" className="resource-card mb-2 p-2" key={rIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee', textDecoration: 'none', color: '#333' }}>
                <div className="resource-icon" style={{ width: '30px', height: '30px', fontSize: '14px', background: 'rgba(193,154,91,0.1)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c19a5b' }}><i className="fa fa-file-pdf-o"></i></div>
                <div className="resource-info" style={{ flex: 1 }}>
                  <h6 style={{ fontSize: '13px', margin: 0, fontWeight: 600 }}>{res.title || `Tài liệu ${rIdx + 1}`}</h6>
                </div>
                <i className="fa fa-download" style={{ color: '#c19a5b' }}></i>
              </a>
            ))}
          </div>
        )}
      </div>
    );
  };

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
                {/* Main Tabs Navigation */}
                <div className="pro-max-tabs-container mt-4 mb-4">
                  <div className="pro-max-tabs">
                    <button
                      className={`pro-max-tab ${activeTab === 'info' ? 'active' : ''}`}
                      onClick={() => setActiveTab('info')}
                    >
                      Giới thiệu
                    </button>
                    <button
                      className={`pro-max-tab ${activeTab === 'curriculum' ? 'active' : ''}`}
                      onClick={() => setActiveTab('curriculum')}
                    >
                      Nội dung khóa học
                    </button>
                    <button
                      className={`pro-max-tab ${activeTab === 'studentWorks' ? 'active' : ''}`}
                      onClick={() => setActiveTab('studentWorks')}
                    >
                      Sản phẩm học viên
                    </button>
                    {hasPurchased && (
                      <button
                        className={`pro-max-tab ${activeTab === 'qna' ? 'active' : ''}`}
                        onClick={() => setActiveTab('qna')}
                      >
                        Hỏi Đáp
                      </button>
                    )}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="pro-max-tab-content">
                  {activeTab === 'info' && (
                    <div className="fade-in">
                      {premiumContent?.introVideoUrl && (
                        <div className="video-wrapper mb-4" onContextMenu={e => e.preventDefault()} style={{ borderRadius: '8px' }}>
                          <UniversalVideoPlayer url={premiumContent.introVideoUrl} />
                        </div>
                      )}
                      <div className="content-preview">
                        {parseHtmlWithVideos(program.description?.replace(/\n/g, '<br/>') || t('common.noDescription') || 'Chưa có thông tin mô tả.')}
                      </div>
                    </div>
                  )}

                  {activeTab === 'curriculum' && (
                    <div className="fade-in">
                      {premiumContent?.videos?.length > 0 ? (
                        hasPurchased ? (
                          /* ═══ PURCHASED: Responsive Layout ═══ */
                          isMobile ? (
                            /* MOBILE: Inline Accordion Player */
                            <div className="mobile-lessons-accordion mt-2">
                              {premiumContent.videos.map((video, i) => (
                                <LessonCollapse
                                  key={i}
                                  index={i}
                                  title={video.title}
                                  isFree={video.isFree}
                                  isOpen={activeVideoIndex === i}
                                  onToggle={() => setActiveVideoIndex(activeVideoIndex === i ? -1 : i)}
                                  mode="client"
                                >
                                  <LessonContent video={video} index={i} />
                                </LessonCollapse>
                              ))}
                            </div>
                          ) : (
                            /* DESKTOP: 2-Column Layout */
                            <div className="row mt-2">
                              {/* Left Main — Video + Content */}
                              <div className="col-lg-8 col-md-7 mb-4 mb-md-0">
                                {(() => {
                                  const activeVideo = premiumContent.videos[activeVideoIndex];
                                  if (!activeVideo) return null;
                                  return <LessonContent video={activeVideo} index={activeVideoIndex} />;
                                })()}
                              </div>

                              {/* Right Sidebar — Lesson List (Collapse) */}
                              <div className="col-lg-4 col-md-5">
                                <div style={{ position: 'sticky', top: '20px' }}>
                                  <h6 className="font-weight-bold mb-3" style={{ fontSize: '14px', color: '#555' }}>
                                    <i className="fa fa-list mr-2"></i>Danh sách bài giảng
                                  </h6>
                                  <div id="curriculum-sidebar-accordion" role="tablist">
                                    {premiumContent.videos.map((video, i) => (
                                      <div
                                        key={i}
                                        className={`p-3 mb-2 d-flex align-items-center ${activeVideoIndex === i ? 'active' : ''}`}
                                        onClick={() => setActiveVideoIndex(i)}
                                        style={{
                                          background: activeVideoIndex === i ? 'rgba(193,154,91,0.05)' : '#fff',
                                          border: `1px solid ${activeVideoIndex === i ? '#c19a5b' : '#eee'}`,
                                          borderRadius: '10px',
                                          cursor: 'pointer',
                                          transition: 'all 0.2s ease'
                                        }}
                                      >
                                        <div style={{ width: '24px', height: '24px', background: activeVideoIndex === i ? '#c19a5b' : '#f1f1f1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: activeVideoIndex === i ? '#fff' : '#999', marginRight: '12px' }}>{i + 1}</div>
                                        <div style={{ flex: 1, fontSize: '14px', fontWeight: 600, color: activeVideoIndex === i ? '#333' : '#666' }}>{video.title}</div>
                                        {activeVideoIndex === i && <i className="fa fa-play-circle" style={{ color: '#c19a5b' }}></i>}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        ) : (
                          /* ═══ NOT PURCHASED: Single-Column Collapse ═══ */
                          <div id="curriculum-accordion" className="mt-2" role="tablist">
                            {premiumContent.videos.map((video, i) => {
                              const canAccess = video.isFree;
                              return (
                                <LessonCollapse
                                  key={i}
                                  index={i}
                                  title={video.title}
                                  isFree={video.isFree}
                                  isOpen={activeVideoIndex === i}
                                  onToggle={() => setActiveVideoIndex(activeVideoIndex === i ? -1 : i)}
                                  mode="client"
                                >
                                  {canAccess ? (
                                    <LessonContent video={video} index={i} />
                                  ) : (
                                    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px', minHeight: '220px' }}>
                                      {/* Fake Blurred Skeleton */}
                                      <div style={{ filter: 'blur(5px)', opacity: 0.5, pointerEvents: 'none', userSelect: 'none', padding: '16px' }}>
                                        <div style={{ height: '180px', borderRadius: '8px', background: 'linear-gradient(135deg, #2c2c2c 0%, #444 100%)' }}></div>
                                        <div className="mt-3" style={{ height: '14px', width: '55%', background: '#bbb', borderRadius: '4px' }}></div>
                                        <div className="mt-2" style={{ height: '12px', width: '100%', background: '#ddd', borderRadius: '4px' }}></div>
                                        <div className="mt-2" style={{ height: '12px', width: '85%', background: '#ddd', borderRadius: '4px' }}></div>
                                        <div className="mt-2" style={{ height: '12px', width: '92%', background: '#ddd', borderRadius: '4px' }}></div>
                                      </div>

                                      {/* Gradient Overlay + CTA Card */}
                                      <div className="d-flex flex-column justify-content-center align-items-center" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.85) 60%, rgba(255,255,255,0.95) 100%)' }}>
                                        <div className="text-center" style={{ padding: '20px 28px' }}>
                                          <i className="fa fa-lock" style={{ fontSize: '28px', color: '#c19a5b' }}></i>
                                          <p className="text-muted mt-2 mb-3" style={{ fontSize: '13px', lineHeight: '1.5' }}>Mua khóa học để mở khóa bài giảng này</p>
                                          <button
                                            className="btn btn-maincolor"
                                            style={{ borderRadius: '25px', padding: '8px 28px', fontWeight: '600', fontSize: '14px' }}
                                            onClick={(e) => {
                                              e.preventDefault();
                                              const widget = document.querySelector('.enrollment-widget');
                                              if (widget) { widget.scrollIntoView({ behavior: 'smooth' }); }
                                              else { navigate(ROUTES.CHECKOUT(slug)); }
                                            }}
                                          >
                                            <i className="fa fa-shopping-cart mr-2"></i>Mua khóa học
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </LessonCollapse>
                              );
                            })}
                          </div>
                        )
                      ) : (
                        <p className="text-muted">{t('programDetail.curriculumEmpty')}</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'studentWorks' && (
                    <div className="student-works-section fade-in">
                      {loadingWorks ? (
                        <div className="text-center py-5">
                          <span className="spinner-border text-primary"></span>
                        </div>
                      ) : studentWorks.length > 0 ? (
                        <div className="mb-4">
                          <div
                            className="d-flex align-items-stretch"
                            style={{
                              overflowX: 'auto',
                              paddingBottom: '20px',
                              gap: '24px',
                              scrollSnapType: 'x mandatory',
                              WebkitOverflowScrolling: 'touch'
                            }}
                          >
                            {studentWorks.map((work, idx) => (
                              <div
                                className="bento-card"
                                key={work.id || idx}
                                style={{
                                  minWidth: '280px',
                                  maxWidth: '280px',
                                  flexShrink: 0,
                                  scrollSnapAlign: 'start'
                                }}
                              >
                                <div className="bento-card-image-wrapper">
                                  <img src={imageUrl(work.imageUrl, `${import.meta.env.BASE_URL}images/gallery/09.jpg`)} alt={work.studentName} className="bento-card-image" loading="lazy" />
                                </div>
                                <div className="bento-card-content">
                                  <h6 className="bento-card-title">{work.studentName}</h6>
                                  <p className="bento-card-desc">{work.description}</p>
                                </div>
                              </div>
                            ))}
                            {hasMoreStudentWorks && (
                              <div
                                className="d-flex align-items-center justify-content-center"
                                style={{
                                  minWidth: '200px',
                                  flexShrink: 0,
                                  scrollSnapAlign: 'start',
                                  background: '#fff',
                                  border: '2px dashed #c19a5b',
                                  borderRadius: '16px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  opacity: loadingMoreWorks ? 0.7 : 1
                                }}
                                onClick={loadMoreStudentWorks}
                                onMouseEnter={e => { e.currentTarget.style.background = '#fff8f0'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                              >
                                <div className="text-center" style={{ color: '#c19a5b', padding: '20px' }}>
                                  {loadingMoreWorks ? (
                                    <span className="spinner-border spinner-border-sm mb-2"></span>
                                  ) : (
                                    <i className="fa fa-arrow-right mb-2" style={{ fontSize: '24px' }}></i>
                                  )}
                                  <h6 style={{ color: '#c19a5b', margin: 0 }}>Xem thêm</h6>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-5 mb-4 empty-state-card">
                          <i className="fa fa-picture-o mb-3" style={{ fontSize: '48px', color: '#eee' }}></i>
                          <p className="text-muted">Chưa có sản phẩm nào được chia sẻ từ các học viên lớp này.</p>
                          {!hasPurchased && <p className="small text-muted opacity-75">Hãy tham gia khóa học để trở thành người đầu tiên khoe thành quả nhé!</p>}
                        </div>
                      )}

                      {/* Submit Student Work CTA */}
                      {hasPurchased && (
                        <div className="mb-4 p-4" style={{ background: 'linear-gradient(135deg, #fff8f0, #fff)', border: '2px dashed var(--colorMain, #c19a5b)', borderRadius: '12px', textAlign: 'center' }}>
                          <i className="fa fa-camera" style={{ fontSize: '36px', color: 'var(--colorMain)' }}></i>
                          {studentWorks.length === 0 ? (
                            <>
                              <h5 className="mt-2 mb-1">Chưa có sản phẩm nào</h5>
                              <p className="text-muted small mb-3">Hãy là người đầu tiên chia sẻ thành quả học tập của bạn nhé!</p>
                            </>
                          ) : (
                            <>
                              <h5 className="mt-2 mb-1">Nộp sản phẩm của bạn</h5>
                              <p className="text-muted small mb-3">Chia sẻ thành quả học tập của bạn để được trưng bày trên trang "Sản phẩm của học viên"</p>
                            </>
                          )}
                          <button className="btn btn-maincolor" onClick={() => setShowSubmitModal(true)}>
                            <i className="fa fa-upload mr-1"></i> Trả bài khóa học
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'qna' && hasPurchased && (
                    <div className="qna-section fade-in">
                      <CourseQA programId={program.id} isAdmin={currentUser?.role === 'ADMIN'} />
                    </div>
                  )}
                </div>






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
                          <br />
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

      {/* Submit Work Modal */}
      {showSubmitModal && (
        <div className="admin-modal-overlay" onClick={() => !submittingWork && setShowSubmitModal(false)} style={{ zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px', backdropFilter: 'blur(5px)', background: 'rgba(0,0,0,0.4)' }}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '550px', background: '#fff', borderRadius: '16px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', border: 'none' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="m-0 font-weight-bold" style={{ color: '#333' }}>Nộp Sản Phẩm Học Viên</h4>
              <button 
                type="button" 
                className="close" 
                onClick={() => !submittingWork && setShowSubmitModal(false)}
                style={{ fontSize: '28px', border: 'none', background: 'none', cursor: 'pointer', outline: 'none' }}
                disabled={submittingWork}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmitWork}>
              <div className="form-group mb-3">
                <label className="font-weight-bold mb-1" style={{ fontSize: '14px', color: '#555' }}>Tên hiển thị học viên <span className="text-danger">*</span></label>
                <input 
                  type="text" 
                  name="studentName"
                  className="form-control" 
                  placeholder="Nhập tên hiển thị của bạn..."
                  value={submitData.studentName}
                  onChange={handleInputChange}
                  required
                  disabled={submittingWork}
                  style={{ borderRadius: '8px', padding: '10px 12px', border: '1px solid #ddd' }}
                />
              </div>

              <div className="form-group mb-3">
                <label className="font-weight-bold mb-1" style={{ fontSize: '14px', color: '#555' }}>Hình ảnh sản phẩm thành quả <span className="text-danger">*</span></label>
                
                {!submitImagePreview ? (
                  <div 
                    onClick={() => !submittingWork && document.getElementById('student-work-file').click()}
                    style={{ 
                      border: '2px dashed #c19a5b', 
                      borderRadius: '12px', 
                      padding: '30px 20px', 
                      textAlign: 'center', 
                      cursor: 'pointer', 
                      background: '#fffbf7',
                      transition: 'all 0.2s ease'
                    }}
                    className="upload-dropzone"
                  >
                    <i className="fa fa-cloud-upload mb-2" style={{ fontSize: '36px', color: '#c19a5b' }}></i>
                    <p className="m-0 font-weight-bold" style={{ fontSize: '14px', color: '#8b7355' }}>Nhấp để chọn ảnh sản phẩm</p>
                    <small className="text-muted">Định dạng JPG, PNG, WEBP (Tối đa 5MB)</small>
                  </div>
                ) : (
                  <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eee' }}>
                    <img 
                      src={submitImagePreview} 
                      alt="Preview" 
                      style={{ width: '100%', maxHeight: '250px', objectFit: 'cover' }}
                    />
                    {!submittingWork && (
                      <button 
                        type="button" 
                        onClick={() => { setSubmitImage(null); setSubmitImagePreview(''); }}
                        style={{ 
                          position: 'absolute', 
                          top: '10px', 
                          right: '10px', 
                          background: 'rgba(255,255,255,0.9)', 
                          border: 'none', 
                          borderRadius: '50%', 
                          width: '32px', 
                          height: '32px', 
                          minWidth: '32px',
                          minHeight: '32px',
                          padding: '0',
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          cursor: 'pointer',
                          color: '#ff4d4f'
                        }}
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    )}
                  </div>
                )}

                <input 
                  type="file" 
                  id="student-work-file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  disabled={submittingWork}
                />
              </div>

              <div className="form-group mb-4">
                <label className="font-weight-bold mb-1" style={{ fontSize: '14px', color: '#555' }}>Cảm nhận & Mô tả sản phẩm <span className="text-danger">*</span></label>
                <textarea 
                  name="description"
                  className="form-control" 
                  rows="4"
                  placeholder="Chia sẻ một chút về quá trình làm bánh, mùi vị, hoặc cảm nghĩ của bạn..."
                  value={submitData.description}
                  onChange={handleInputChange}
                  required
                  disabled={submittingWork}
                  style={{ borderRadius: '8px', padding: '10px 12px', border: '1px solid #ddd', resize: 'none' }}
                ></textarea>
              </div>

              <div className="d-flex gap-3">
                <button 
                  type="button" 
                  className="btn btn-light w-50" 
                  onClick={() => setShowSubmitModal(false)}
                  disabled={submittingWork}
                  style={{ borderRadius: '8px', padding: '12px', fontWeight: '600' }}
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  className="btn btn-maincolor w-50"
                  disabled={submittingWork}
                  style={{ borderRadius: '8px', padding: '12px', fontWeight: '600', background: 'var(--colorMain, #c19a5b)', color: '#fff', border: 'none' }}
                >
                  {submittingWork ? (
                    <>
                      <i className="fa fa-spinner fa-spin mr-1"></i> Đang gửi bài...
                    </>
                  ) : (
                    <>
                      <i className="fa fa-paper-plane mr-1"></i> Nộp sản phẩm
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ProgramDetail;
