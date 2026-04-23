import { useInitOnLoaded } from '../hooks/useInitOnLoaded';
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageTitle from '../components/Shared/PageTitle';
import { getChiefById, submitContact } from '../services/api';
import { ROUTES } from '../constants/routes';
import { toast } from 'react-toastify';
import { useTranslation } from '../i18n/LanguageContext';
import Input from '../components/Shared/Input';

const ChiefDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [chief, setChief] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getChiefById(id)
      .then(data => {
        // parse skills if stored as string
        let parsedSkills = [];
        if (data.skills) {
          try {
            parsedSkills = JSON.parse(data.skills);
          } catch (e) { console.error(e); }
        }
        setChief({ ...data, parsedSkills });
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch Chief details", err);
        setLoading(false);
      });
  }, [id]);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitContact({
        name: formData.name,
        email: formData.email,
        subject: `${t('chiefDetail.emailSubject') || 'Regarding Instructor:'} ${chief.name}`,
        message: formData.message
      });
      toast.success(t('chiefDetail.successMessage') || "Message sent successfully!");
      setFormData({ name: '', email: '', message: '' });
    } catch {
      toast.error(t('chiefDetail.errorMessage') || "Failed to send message. Please try again later.");
    }
    setSubmitting(false);
  };

  useInitOnLoaded(loading);

  if (loading) {
    return (
      <div className="text-center" style={{ padding: '150px 0' }}>
        <h2>{t('chiefDetail.loading') || 'Loading Instructor Profile...'}</h2>
        <div className="spinner-border" role="status"></div>
      </div>
    );
  }

  if (!chief) {
    return (
      <div className="text-center" style={{ padding: '150px 0' }}>
        <h2>{t('chiefDetail.notFound') || 'Instructor Not Found.'}</h2>
      </div>
    );
  }

  // highlights
  const highlights = chief.highlights ? chief.highlights.split('|').map(s => s.trim()).filter(Boolean) : [];

  const imgSrc = (src) => {
    if (!src) return `${import.meta.env.BASE_URL}images/team/single-profile.jpg`;
    if (src.startsWith('http') || src.startsWith(import.meta.env.BASE_URL)) return src;
    return `${import.meta.env.BASE_URL}${src.replace(/^\//, '')}`;
  };

  return (
    <>
      <PageTitle 
        title={t('chiefDetail.pageTitle') || 'Thông Tin Giảng Viên'}
        breadcrumbs={[
          { label: t('header.home'), link: '/' }, 
          { label: t('header.instructors') || 'Giảng Viên', link: ROUTES.CHIEFS }, 
          { label: chief.name }
        ]}
      />
      
      <section className="ls s-pt-75 s-pb-10 s-pt-lg-100 s-pb-lg-50 c-mb-30 chief-profile">
        <div className="container">
          <div className="row">
            <div className="d-none d-lg-block divider-60"></div>
            
            <div className="col-12">
              <div className="row c-gutter-60">
                <div className="col-md-5">
                  <div className="vertical-item content-absolute text-center">
                    <div className="item-media">
                      <img src={imgSrc(chief.image)} alt={chief.name} />
                    </div>
                    <div className="item-content bg-maincolor-transparent">
                      <h4>{chief.name}</h4>
                      <h6 className="small-text">{chief.role}</h6>
                      <p className="social-icons">
                        {chief.socialFb && <a href={chief.socialFb} className="fa fa-facebook color-light" title="facebook"></a>}
                        {chief.socialTw && <a href={chief.socialTw} className="fa fa-twitter color-light" title="twitter"></a>}
                        {chief.socialIn && <a href={chief.socialIn} className="fa fa-google-plus color-light" title="google"></a>}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-md-7 mt-4 mt-md-0">
                  {chief.bio && <p style={{ whiteSpace: 'pre-wrap' }}>{chief.bio}</p>}
                  {!chief.bio && (
                    <p>
                      {chief.name} {t('chiefDetail.defaultBio') || 'là một chuyên gia với nhiều năm kinh nghiệm. Với kiến thức sâu rộng, giảng viên luôn mang đến niềm đam mê cho mỗi khóa học.'}
                    </p>
                  )}

                  {highlights.length > 0 && (
                    <ul className="list-styled mt-4 mb-4">
                      {highlights.map((hl, i) => <li key={i}>{hl}</li>)}
                    </ul>
                  )}

                  {/* tabs start */}
                  <ul className="nav nav-tabs mt-40" role="tablist">
                    <li className="nav-item">
                      <a className="nav-link active" id="tab01" data-toggle="tab" href="#tab01_pane" role="tab" aria-controls="tab01_pane" aria-expanded="true">{t('chiefDetail.tabs.biography') || 'Tiểu sử'}</a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" id="tab02" data-toggle="tab" href="#tab02_pane" role="tab" aria-controls="tab02_pane">{t('chiefDetail.tabs.skills') || 'Kỹ năng'}</a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" id="tab03" data-toggle="tab" href="#tab03_pane" role="tab" aria-controls="tab03_pane">{t('chiefDetail.tabs.sendMessage') || 'Gửi tin nhắn'}</a>
                    </li>
                  </ul>

                  <div className="tab-content mb-40">
                    <div className="tab-pane fade show active" id="tab01_pane" role="tabpanel" aria-labelledby="tab01">
                      {chief.biography ? (
                        <div dangerouslySetInnerHTML={{ __html: chief.biography }} />
                      ) : (
                        <p>{t('chiefDetail.biographyPlaceholder') || `Thông tin tiểu sử của ${chief.name} sẽ sớm được cập nhật.`}</p>
                      )}
                      
                      <div className="mt-5">
                        <Link to={`${ROUTES.PROGRAM}?chiefId=${chief.id}`} className="btn btn-maincolor">{t('chiefDetail.viewClasses') || 'Xem Khóa Học'}</Link>
                      </div>
                    </div>

                    <div className="tab-pane fade" id="tab02_pane" role="tabpanel" aria-labelledby="tab02">
                      <p>
                        {t('chiefDetail.skillsIntro') || 'Giảng viên đã có chứng chỉ chuyên môn và nhiều năm trực tiếp đứng lớp truyền đạt kĩ thuật làm bánh chuẩn xác nhất.'}
                      </p>
                      {(!chief.parsedSkills || chief.parsedSkills.length === 0) ? (
                        <p>{t('chiefDetail.skillsPlaceholder') || 'Kỹ năng sẽ được cập nhật.'}</p>
                      ) : (
                        chief.parsedSkills.map((sk, index) => (
                          <React.Fragment key={index}>
                            <span className="small-text progress-title">{sk.name}</span>
                            <div className="progress">
                              <div className="progress-bar bg-maincolor" role="progressbar" data-transitiongoal={sk.percent} style={{ width: `${sk.percent}%` }} aria-valuenow={sk.percent} aria-valuemin="0" aria-valuemax="100">
                                <span>{sk.percent}%</span>
                              </div>
                            </div>
                          </React.Fragment>
                        ))
                      )}
                    </div>

                    <div className="tab-pane fade" id="tab03_pane" role="tabpanel" aria-labelledby="tab03">
                      <form className="c-mb-20 c-gutter-20" onSubmit={handleContactSubmit}>
                        <div className="row">
                          <div className="col-12">
                            <h5 className="mb-4">{t('chiefDetail.contactFormTitle') || 'Bạn muốn hỏi thêm thông tin? Gửi tin nhắn ngay.'}</h5>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6">
                            <Input 
                              wrapperClassName="has-placeholder mb-3"
                              label={t('form.fullName') || 'Họ và tên'}
                              type="text" 
                              placeholder={t('form.fullName') || 'Họ và tên'} 
                              value={formData.name} 
                              onChange={e => setFormData({...formData, name: e.target.value})} 
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <Input 
                              wrapperClassName="has-placeholder mb-3"
                              label={t('form.email') || 'Email'}
                              type="email" 
                              placeholder={t('form.email') || 'Địa chỉ Email'} 
                              value={formData.email} 
                              onChange={e => setFormData({...formData, email: e.target.value})} 
                              required
                            />
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-12">
                            <div className="form-group has-placeholder">
                              <label htmlFor="message">{t('form.message') || 'Nhắn nhủ'}</label>
                              <textarea rows="4" className="form-control" placeholder={t('form.messagePlaceholder') || 'Nội dung...'} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} required></textarea>
                            </div>
                          </div>
                        </div>
                        <div className="row mt-4">
                          <div className="col-12">
                            <button type="submit" className="btn btn-maincolor" disabled={submitting}>
                              {submitting ? (t('common.sending') || 'Đang gửi...') : (t('common.sendNow') || 'Gửi ngay')}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                  {/* tabs end */}

                  <blockquote className="bordered layout-2 mt-40">
                    <div>
                      <h6 className="small-text color-main2 margin-0">{t('chiefDetail.featuredReview.role')}</h6>
                      <h5>{t('chiefDetail.featuredReview.author')}</h5>
                    </div>
                    <p>{t('chiefDetail.featuredReview.text')}</p>
                  </blockquote>

                </div>
              </div>
            </div>
            
            <div className="d-none d-lg-block divider-60"></div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ChiefDetail;
