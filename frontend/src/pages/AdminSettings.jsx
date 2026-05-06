import React, { useState, useEffect } from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';
import { updateSiteConfig } from '../services/api';
import { toast } from 'react-toastify';
import AdminLoadingBlock from '../components/Admin/AdminLoadingBlock';
import AdminButton from '../components/admin/Shared/AdminButton';

const AdminSettings = () => {
  const { siteConfig, updateConfig, loading: configLoading } = useSiteConfig();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (siteConfig && !configLoading) {
      setFormData(JSON.parse(JSON.stringify(siteConfig)));
    }
  }, [siteConfig, configLoading]);

  const handleChange = (e, section, field, index, subField) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev };
      
      if (section && field && index !== undefined && subField) {
        newData[section][field][index][subField] = value;
      } else if (section && field && index !== undefined) {
        newData[section][field][index] = value;
      } else if (section && field) {
        newData[section][field] = value;
      } else {
        newData[name] = value;
      }
      
      return newData;
    });
  };

  const handleAddArrayItem = (section, field, defaultItem) => {
    setFormData(prev => {
      const newData = { ...prev };
      if (!newData[section][field]) newData[section][field] = [];
      newData[section][field].push(defaultItem);
      return newData;
    });
  };

  const handleRemoveArrayItem = (section, field, index) => {
    setFormData(prev => {
      const newData = { ...prev };
      newData[section][field].splice(index, 1);
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateSiteConfig(formData);
      updateConfig(res.config || formData);
      toast.success("Cập nhật cấu hình thành công!", { icon: "🎉" });
    } catch (error) {
      toast.error("Lỗi khi lưu cấu hình!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (configLoading || !formData) return <AdminLoadingBlock rows={4} />;

  return (
    <div className="admin-settings-modern">
      <div className="settings-header">
        <div>
          <h2 className="settings-title">Cấu hình Website</h2>
          <p className="settings-subtitle">Quản lý nội dung, thông tin liên hệ và cài đặt hiển thị</p>
        </div>
        <AdminButton
          variant="primary"
          onClick={handleSubmit}
          disabled={loading}
          loading={loading}
          icon="save"
          label="Lưu Thay Đổi"
          loadingLabel="Đang lưu..."
          className="btn-save-main"
        />
      </div>

      <div className="settings-layout">
        {/* TAB NAVIGATION */}
        <div className="settings-sidebar">
          <ul className="settings-nav">
            <li className={activeTab === 'general' ? 'active' : ''} onClick={() => setActiveTab('general')}>
              <i className="fa fa-globe"></i> Thông tin chung
            </li>
            <li className={activeTab === 'contact' ? 'active' : ''} onClick={() => setActiveTab('contact')}>
              <i className="fa fa-address-book"></i> Liên hệ & Maps
            </li>
            <li className={activeTab === 'social' ? 'active' : ''} onClick={() => setActiveTab('social')}>
              <i className="fa fa-share-alt"></i> Mạng xã hội
            </li>
            <li className={activeTab === 'footer' ? 'active' : ''} onClick={() => setActiveTab('footer')}>
              <i className="fa fa-columns"></i> Footer
            </li>
            <li className={activeTab === 'about' ? 'active' : ''} onClick={() => setActiveTab('about')}>
              <i className="fa fa-building"></i> Trang Giới Thiệu
            </li>
          </ul>
        </div>

        {/* TAB CONTENT */}
        <div className="settings-content">
          <form onSubmit={handleSubmit}>
            
            {/* --- TAB: GENERAL --- */}
            <div className={`tab-pane ${activeTab === 'general' ? 'active' : ''}`}>
              <div className="settings-card">
                <h3 className="card-heading">Thông tin nhận diện</h3>
                <div className="form-group-modern">
                  <label>Tên Website</label>
                  <input className="input-modern" name="name" value={formData.name || ''} onChange={e => handleChange(e)} placeholder="VD: YUM Saigon" />
                </div>
                <div className="form-group-modern">
                  <label>Logo Text</label>
                  <input className="input-modern" name="logoText" value={formData.logoText || ''} onChange={e => handleChange(e)} />
                </div>
                <div className="form-group-modern">
                  <label>Dấu chấm Logo (Màu nhấn)</label>
                  <input className="input-modern" name="logoDot" value={formData.logoDot || ''} onChange={e => handleChange(e)} placeholder="VD: ." />
                </div>
                <div className="form-group-modern">
                  <label>Mô tả ngắn (Hiển thị ở Footer và dùng cho SEO)</label>
                  <textarea className="input-modern" name="description" value={formData.description || ''} onChange={e => handleChange(e)} rows="4" />
                </div>
              </div>
            </div>

            {/* --- TAB: CONTACT --- */}
            <div className={`tab-pane ${activeTab === 'contact' ? 'active' : ''}`}>
              <div className="settings-card">
                <h3 className="card-heading">Liên hệ & Địa chỉ</h3>
                <div className="row">
                  <div className="col-md-6 form-group-modern">
                    <label>Số điện thoại</label>
                    <input className="input-modern" value={formData.contact?.phone || ''} onChange={e => handleChange(e, 'contact', 'phone')} />
                  </div>
                  <div className="col-md-6 form-group-modern">
                    <label>Email liên hệ</label>
                    <input className="input-modern" value={formData.contact?.email || ''} onChange={e => handleChange(e, 'contact', 'email')} />
                  </div>
                </div>
                <div className="form-group-modern">
                  <label>Địa chỉ công ty</label>
                  <input className="input-modern" value={formData.contact?.address || ''} onChange={e => handleChange(e, 'contact', 'address')} />
                </div>
                <div className="row">
                  <div className="col-md-6 form-group-modern">
                    <label>Website URL</label>
                    <input className="input-modern" value={formData.contact?.website || ''} onChange={e => handleChange(e, 'contact', 'website')} />
                  </div>
                  <div className="col-md-6 form-group-modern">
                    <label>Giờ làm việc</label>
                    <input className="input-modern" value={formData.contact?.workingHours || ''} onChange={e => handleChange(e, 'contact', 'workingHours')} placeholder="VD: T2-T7: 8:00 - 17:00" />
                  </div>
                </div>
                <div className="form-group-modern">
                  <label>Google Maps Embed (src link của thẻ iframe)</label>
                  <input className="input-modern" value={formData.contact?.googleMapsUrl || ''} onChange={e => handleChange(e, 'contact', 'googleMapsUrl')} />
                  <small className="help-text text-muted mt-2 d-block">Vào Google Maps {'->'} Chia sẻ {'->'} Nhúng bản đồ {'->'} Copy link trong thuộc tính src=""</small>
                </div>
              </div>
            </div>

            {/* --- TAB: SOCIAL --- */}
            <div className={`tab-pane ${activeTab === 'social' ? 'active' : ''}`}>
              <div className="settings-card">
                <h3 className="card-heading">Mạng xã hội</h3>
                <div className="form-group-modern social-input">
                  <i className="fa fa-facebook icon-fb"></i>
                  <input className="input-modern" value={formData.socials?.facebook || ''} onChange={e => handleChange(e, 'socials', 'facebook')} placeholder="https://facebook.com/..." />
                </div>
                <div className="form-group-modern social-input">
                  <i className="fa fa-instagram icon-ig"></i>
                  <input className="input-modern" value={formData.socials?.instagram || ''} onChange={e => handleChange(e, 'socials', 'instagram')} placeholder="https://instagram.com/..." />
                </div>
                <div className="form-group-modern social-input">
                  <i className="fa fa-youtube-play icon-yt"></i>
                  <input className="input-modern" value={formData.socials?.youtube || ''} onChange={e => handleChange(e, 'socials', 'youtube')} placeholder="https://youtube.com/..." />
                </div>
                <div className="form-group-modern social-input">
                  <i className="fa fa-music icon-tk"></i>
                  <input className="input-modern" value={formData.socials?.tiktok || ''} onChange={e => handleChange(e, 'socials', 'tiktok')} placeholder="https://tiktok.com/..." />
                </div>
              </div>
            </div>

            {/* --- TAB: FOOTER --- */}
            <div className={`tab-pane ${activeTab === 'footer' ? 'active' : ''}`}>
              <div className="settings-card">
                <h3 className="card-heading">Cấu hình Footer</h3>
                <div className="form-group-modern">
                  <label>Tiêu đề Đăng ký Bản tin (Newsletter)</label>
                  <input className="input-modern" value={formData.footer?.newsletterTitle || ''} onChange={e => handleChange(e, 'footer', 'newsletterTitle')} />
                </div>
                <div className="form-group-modern">
                  <label>Mô tả Bản tin</label>
                  <textarea className="input-modern" value={formData.footer?.newsletterDescription || ''} onChange={e => handleChange(e, 'footer', 'newsletterDescription')} rows="2" />
                </div>
                <div className="form-group-modern">
                  <label>Năm Bản quyền (Copyright Year)</label>
                  <input className="input-modern" type="number" name="copyrightYear" value={formData.copyrightYear || ''} onChange={e => handleChange(e)} style={{ maxWidth: '150px' }} />
                </div>
              </div>
            </div>

            {/* --- TAB: ABOUT --- */}
            <div className={`tab-pane ${activeTab === 'about' ? 'active' : ''}`}>
              
              <div className="settings-card mb-4">
                <h3 className="card-heading">1. Lịch sử hình thành</h3>
                <p className="help-text mb-3">Các đoạn văn hiển thị ở nửa đầu trang Giới Thiệu.</p>
                {formData.about?.historyParagraphs?.map((p, idx) => (
                  <div key={idx} className="array-item-card">
                    <div className="d-flex">
                      <div className="drag-handle"><i className="fa fa-bars"></i></div>
                      <textarea className="input-modern flex-grow-1" value={p} onChange={e => handleChange(e, 'about', 'historyParagraphs', idx)} rows="3" />
                      <button type="button" className="btn-delete" onClick={() => handleRemoveArrayItem('about', 'historyParagraphs', idx)}>
                        <i className="fa fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" className="btn-add-item" onClick={() => handleAddArrayItem('about', 'historyParagraphs', '')}>
                  <i className="fa fa-plus-circle mr-1"></i> Thêm đoạn văn
                </button>
              </div>

              <div className="settings-card mb-4">
                <h3 className="card-heading">2. Đặc điểm nổi bật</h3>
                <p className="help-text mb-3">Danh sách (bullet points) nằm ngay dưới phần lịch sử.</p>
                {formData.about?.historyFeatures?.map((f, idx) => (
                  <div key={idx} className="array-item-card">
                    <div className="d-flex align-items-center">
                      <div className="drag-handle"><i className="fa fa-check-circle text-success"></i></div>
                      <input className="input-modern flex-grow-1" value={f} onChange={e => handleChange(e, 'about', 'historyFeatures', idx)} />
                      <button type="button" className="btn-delete" onClick={() => handleRemoveArrayItem('about', 'historyFeatures', idx)}>
                        <i className="fa fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" className="btn-add-item" onClick={() => handleAddArrayItem('about', 'historyFeatures', '')}>
                  <i className="fa fa-plus-circle mr-1"></i> Thêm đặc điểm
                </button>
              </div>

              <div className="settings-card">
                <h3 className="card-heading">3. Thành tựu / Điểm nhấn</h3>
                <p className="help-text mb-3">Các khối Icon hiển thị phía dưới trang Giới Thiệu.</p>
                <div className="row">
                  {formData.about?.achievements?.map((ach, idx) => (
                    <div key={idx} className="col-lg-6 mb-3">
                      <div className="achievement-card">
                        <button type="button" className="btn-delete-absolute" onClick={() => handleRemoveArrayItem('about', 'achievements', idx)}>
                          <i className="fa fa-times"></i>
                        </button>
                        <div className="form-group-modern">
                          <label>Tiêu đề</label>
                          <input className="input-modern" value={ach.title} onChange={e => handleChange(e, 'about', 'achievements', idx, 'title')} />
                        </div>
                        <div className="form-group-modern mb-0">
                          <label>Mô tả ngắn</label>
                          <textarea className="input-modern" value={ach.desc} onChange={e => handleChange(e, 'about', 'achievements', idx, 'desc')} rows="2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" className="btn-add-item" onClick={() => handleAddArrayItem('about', 'achievements', { icon: 'fa-star', title: 'Tiêu đề mới', desc: 'Mô tả mới' })}>
                  <i className="fa fa-plus-circle mr-1"></i> Thêm khối thành tựu
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>

      <style>{`
        .admin-settings-modern {
          background: #f8f9fe;
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 30px;
          border-radius: 12px;
          min-height: 0;
        }
        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .settings-title {
          font-size: 24px;
          font-weight: 700;
          color: #2d3e50;
          margin: 0 0 5px 0;
        }
        
        .settings-subtitle {
          color: #8898aa;
          margin: 0;
          font-size: 14px;
        }
        .btn-save-main {
          background: #fc834b !important;
          color: white !important;
          border: none;
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 600;
          box-shadow: 0 4px 6px rgba(252, 131, 75, .2), 0 1px 3px rgba(0, 0, 0, .08);
          transition: all 0.15s ease;
        }
        .btn-save-main:hover {
          background: #e86e30 !important;
          transform: translateY(-1px);
          box-shadow: 0 7px 14px rgba(252, 131, 75, .3), 0 3px 6px rgba(0, 0, 0, .08);
        }
        
        .settings-layout {
          display: flex;
          gap: 30px;
          align-items: stretch;
          flex: 1;
          min-height: 0;
        }
        
        .settings-sidebar {
          width: 250px;
          flex-shrink: 0;
        }
        .settings-nav {
          list-style: none;
          padding: 0;
          margin: 0;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }
        .settings-nav li {
          padding: 16px 20px;
          cursor: pointer;
          font-weight: 600;
          color: #525f7f;
          border-left: 3px solid transparent;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
        }
        .settings-nav li i {
          width: 24px;
          font-size: 16px;
          color: #adb5bd;
          transition: all 0.2s ease;
        }
        .settings-nav li:hover {
          background: #fcfcfc;
          color: #2d3e50;
        }
        .settings-nav li.active {
          background: #fff5f0;
          color: #fc834b;
          border-left-color: #fc834b;
        }
        .settings-nav li.active i {
          color: #fc834b;
        }
        
        .settings-content {
          flex-grow: 1;
          min-width: 0;
          height: 100%;
          overflow-y: auto;
          padding-right: 15px;
        }
        
        .tab-pane {
          display: none;
          animation: fadeIn 0.3s ease;
        }
        .tab-pane.active {
          display: block;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .settings-card {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
          border: 1px solid #f0f1f5;
        }
        .card-heading {
          font-size: 18px;
          font-weight: 700;
          color: #2d3e50;
          margin-bottom: 24px;
          padding-bottom: 15px;
          border-bottom: 1px solid #f6f9fc;
        }
        
        .form-group-modern {
          margin-bottom: 20px;
        }
        .form-group-modern label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #525f7f;
          margin-bottom: 8px;
          letter-spacing: 0.1px;
          text-transform: none !important;
        }
        .admin-settings-modern input,
        .admin-settings-modern textarea,
        .admin-settings-modern select,
        .admin-settings-modern option,
        .admin-settings-modern .input-modern,
        .admin-settings-modern .form-control,
        .admin-settings-modern .custom-select,
        .admin-settings-modern .help-text,
        .admin-settings-modern small,
        .admin-settings-modern p,
        .admin-settings-modern h3,
        .admin-settings-modern h6,
        .admin-settings-modern button,
        .admin-settings-modern .btn,
        .admin-settings-modern .settings-nav li {
          text-transform: none !important;
          font-variant: normal;
        }
        .admin-settings-modern input::placeholder,
        .admin-settings-modern textarea::placeholder,
        .admin-settings-modern .input-modern::placeholder {
          text-transform: none !important;
        }
        .input-modern {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          color: #2d3e50;
          transition: all 0.2s ease;
          background-color: #fff;
          box-shadow: 0 1px 2px rgba(0,0,0,0.01);
          text-transform: none !important;
        }
        .input-modern:focus {
          outline: none;
          border-color: #fc834b;
          box-shadow: 0 0 0 3px rgba(252, 131, 75, 0.15);
        }
        
        .social-input {
          position: relative;
        }
        .social-input i {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 18px;
        }
        .social-input .input-modern {
          padding-left: 45px;
        }
        .icon-fb { color: #1877F2; }
        .icon-ig {
          background: linear-gradient(135deg, #feda75 0%, #fa7e1e 22%, #d62976 50%, #962fbf 78%, #4f5bd5 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }
        .icon-yt { color: #FF0000; }
        .icon-tk { color: #010101; }
        
        /* Array Items */
        .array-item-card {
          background: #fcfcfc;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 12px;
          transition: all 0.2s ease;
        }
        .array-item-card:hover {
          border-color: #dee2e6;
          box-shadow: 0 2px 5px rgba(0,0,0,0.02);
        }
        .drag-handle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          color: #adb5bd;
          margin-right: 10px;
        }
        .btn-delete {
          background: #fff0f0;
          color: #f5365c;
          border: 1px solid #ffdbdb;
          border-radius: 6px;
          width: 40px;
          margin-left: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-delete:hover {
          background: #f5365c;
          color: white;
        }
        .btn-add-item {
          background: transparent;
          color: #fc834b;
          border: 2px dashed #fc834b;
          border-radius: 8px;
          padding: 10px 20px;
          font-weight: 600;
          font-size: 14px;
          width: 100%;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-add-item:hover {
          border-color: #e86e30;
          background: #fff5f0;
          color: #e86e30;
        }
        
        .achievement-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 20px;
          position: relative;
          height: 100%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }
        .btn-delete-absolute {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #fff0f0;
          color: #f5365c;
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-delete-absolute:hover {
          background: #f5365c;
          color: white;
        }
        
        @media (max-width: 992px) {
          .settings-layout {
            flex-direction: column;
          }
          .settings-sidebar {
            width: 100%;
          }
          .settings-nav {
            display: flex;
            overflow-x: auto;
          }
          .settings-nav li {
            border-left: none;
            border-bottom: 3px solid transparent;
            white-space: nowrap;
          }
          .settings-nav li.active {
            border-left-color: transparent;
            border-bottom-color: #fc834b;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminSettings;
