import { useInitOnLoaded } from '../hooks/useInitOnLoaded';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProgramBySlug, createProgram, updateProgram, getChiefs, getCategories } from '../services/api';
import { toast } from 'react-toastify';
import AdminImageUpload from '../components/Admin/AdminImageUpload';
import { AdminInput, AdminSelect, AdminTextarea } from '../components/Admin/Shared/AdminFormControls';
import { ROUTES } from '../constants/routes';
import { priceToDollars, dollarsToCents } from '../utils/formatters';
import './AdminDesign.css';
import AdminLoadingScreen from '../components/Admin/AdminLoadingScreen';

const AdminProgramEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  
  const [formData, setFormData] = useState({
    programType: 'VIDEO_COURSE', // [TEMPORARILY HIDDEN] Was 'LIVE_CLASS' — đổi mặc định sang Video khi ẩn tính năng lớp trực tiếp
    category: '',
    authorName: '', authorImage: '', chiefId: '',
    learningGoals: [], classIncludes: [], curriculum: [], classSessions: [],
    premiumContent: { videos: [], resources: [], guides: '' }
  });

  const [chiefsList, setChiefsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  const TABS = [
    { id: 0, label: 'Thông tin chung' },
    { id: 1, label: 'Nội dung & Hình ảnh' },
    { id: 2, label: 'Giáo trình (Curriculum)' },
    { id: 3, label: 'Nội dung Premium' }
  ];

  useEffect(() => {
    document.body.classList.add('admin-mode');
    
    getChiefs().then(res => {
      setChiefsList(res.data || res || []);
    }).catch(err => console.error("Failed to load chiefs", err));

    getCategories({ type: 'PROGRAM' }).then(res => {
      setCategoriesList(res.filter(c => c.isActive) || []);
    }).catch(err => console.error("Failed to load categories", err));

    if (isEditing) {
      // getProgramByIdOrSlug supports both
      getProgramBySlug(id)
        .then(prog => {
          setFormData({
            programType: prog.programType || 'VIDEO_COURSE', // [TEMPORARILY HIDDEN] Was 'LIVE_CLASS'
            title: prog.title || '',
            slug: prog.slug || '',
            category: prog.category || '',
            description: prog.description || '',
            price: prog.price != null ? priceToDollars(prog.price) : '',
            salePrice: prog.salePrice != null ? priceToDollars(prog.salePrice) : '',
            thumbnail: prog.thumbnail || '',
            isFeatured: prog.isFeatured || false,
            chiefId: prog.chiefId || '',
            authorName: prog.authorName || '',
            authorImage: prog.authorImage || '',
            learningGoals: Array.isArray(prog.learningGoals) ? prog.learningGoals.map(g => typeof g === 'string' ? { skill: g, percent: 50 } : g) : [],
            classIncludes: Array.isArray(prog.classIncludes) ? prog.classIncludes : [],
            curriculum: Array.isArray(prog.curriculum) ? prog.curriculum : [],
            classSessions: Array.isArray(prog.classSessions) ? prog.classSessions.map(cs => ({
              ...cs,
              startDate: cs.startDate ? new Date(cs.startDate).toISOString().slice(0, 16) : '',
              endDate: cs.endDate ? new Date(cs.endDate).toISOString().slice(0, 16) : '',
              enrollmentDeadline: cs.enrollmentDeadline ? new Date(cs.enrollmentDeadline).toISOString().slice(0, 16) : ''
            })) : [],
            students: prog.students || 0,
            reviews: prog.reviews || 0,
            premiumContent: prog.premiumContent || { videos: [], resources: [], guides: '' }
          });
          setLoading(false);
        })
        .catch(err => {
          toast.error("Lỗi khi tải dữ liệu khóa học");
          setLoading(false);
        });
    }

    return () => document.body.classList.remove('admin-mode');
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: formData.price ? dollarsToCents(formData.price) : null,
        salePrice: formData.salePrice ? dollarsToCents(formData.salePrice) : null
      };
      if (isEditing) {
        await updateProgram(id, payload);
        toast.success("Cập nhật khóa học thành công!");
      } else {
        await createProgram(payload);
        toast.success("Tạo khóa học thành công!");
      }
      navigate(ROUTES.ADMIN + "#programs");
    } catch (err) {
      toast.error("Lỗi lưu khóa học");
    }
  };

  // --- Dynamic Array Handlers --- //
  const handleArrayChange = (field, index, key, value) => {
    const updated = [...formData[field]];
    if (key) updated[index][key] = value;
    else updated[index] = value;
    setFormData({ ...formData, [field]: updated });
  };

  const removeArrayItem = (field, index) => {
    const updated = [...formData[field]];
    updated.splice(index, 1);
    setFormData({ ...formData, [field]: updated });
  };

  const addLearningGoal = () => {
    setFormData({ ...formData, learningGoals: [...formData.learningGoals, { skill: '', percent: 0 }] });
  };

  const addClassInclude = () => {
    setFormData({ ...formData, classIncludes: [...formData.classIncludes, ''] });
  };

  const addCurriculum = () => {
    setFormData({ ...formData, curriculum: [...formData.curriculum, { title: '', content: '' }] });
  };

  const addClassSession = () => {
    setFormData({ ...formData, classSessions: [...formData.classSessions, { startDate: '', endDate: '', enrollmentDeadline: '', dayOfWeek: '', timeRange: '', instructorOverride: '' }] });
  };

  useInitOnLoaded(loading);

  if (loading) return <AdminLoadingScreen title="Đang mở trình biên tập khóa học..." subtitle="Jarvis đang nạp dữ liệu khóa học, danh mục và cấu hình biên tập." />;

  return (
    <div className="admin-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Navbar */}
      <div className="admin-paper-header" style={{ position: 'sticky', top: 0, zIndex: 100, borderRadius: 0, padding: '15px 30px', backgroundColor: 'var(--admin-paper-bg)', borderBottom: '1px solid var(--admin-border-light)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div className="d-flex align-items-center">
          <button className="btn btn-dark mr-3" onClick={() => navigate(ROUTES.ADMIN + "#programs")}>
            <i className="fa fa-arrow-left"></i> Quay lại
          </button>
          <h4 style={{ margin: 0 }}>{isEditing ? 'Sửa Khóa Học' : 'Tạo Khóa Học Mới'}</h4>
        </div>
        <div>
          <button type="submit" form="admin-program-form" className="admin-btn-save">
            <i className="fa fa-save mr-2"></i> Lưu Khóa Học
          </button>
        </div>
      </div>

      <form id="admin-program-form" onSubmit={handleSave} className="container p-4 admin-editor-form" style={{ flexGrow: 1, maxWidth: '1000px' }}>
        
        {/* Tabs Navigation */}
        <div className="admin-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`admin-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 0 && (
          <div className="admin-tab-content admin-paper p-4 mb-4">
            <h5 className="mb-4" style={{borderBottom: '1px solid var(--admin-border-light)', paddingBottom: '10px'}}>Thông tin chung & Chi phí</h5>
          
          <div className="row">
            <div className="col-md-8">
              <AdminInput 
                label={<>Tên Khóa Học <span className="text-danger">*</span></>} 
                name="title" 
                value={formData.title} 
                onChange={handleChange}
                placeholder="Làm Bánh Ngọt Pháp Cơ Bản..."
                required
                minLength={5}
              />
            </div>
            <div className="col-md-4">
              <AdminSelect 
                label={<>Danh mục <span className="text-danger">*</span></>}
                name="category" 
                value={formData.category} 
                onChange={handleChange}
                options={[
                  { value: '', label: '-- Chọn danh mục --' },
                  ...categoriesList.map(c => ({ value: c.name, label: c.name }))
                ]}
                required
              />
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-md-6">
              <AdminInput label={<>Giá gốc (đ) <span className="text-danger">*</span></>} name="price" type="number" step="1000" min="0" value={formData.price} onChange={handleChange} placeholder="500000" required />
            </div>
            <div className="col-md-6">
              <AdminInput label="Giá khuyến mãi (đ)" name="salePrice" type="number" step="1000" min="0" value={formData.salePrice || ''} onChange={handleChange} placeholder="Để trống nếu không KM" />
            </div>
          </div>

          {/* [TEMPORARILY HIDDEN] Ẩn dropdown giảng viên
          <div className="row mt-3">
            <div className="col-md-4">
              <AdminSelect 
                label={<>Giảng viên <span className="text-danger">*</span></>} 
                name="chiefId" 
                value={formData.chiefId} 
                onChange={handleChange}
                options={[
                  { value: '', label: '-- Chọn Giảng viên --' },
                  ...chiefsList.map(c => ({ value: c.id, label: c.name }))
                ]}
              />
            </div>
          </div>
          */}

          {/* [TEMPORARILY HIDDEN] Ẩn dropdown loại sản phẩm — chỉ bán Premium Content
          <div className="row mt-3">
            <div className="col-md-12">
              <AdminSelect 
                label={<>Loại sản phẩm <span className="text-danger">*</span></>} 
                name="programType" 
                value={formData.programType} 
                onChange={handleChange}
                options={[
                  { value: 'LIVE_CLASS', label: '👨‍🍳 Lớp học trực tiếp (Có lịch, Zoom/Offline)' },
                  { value: 'VIDEO_COURSE', label: '🎬 Khóa học Video (Xem mọi lúc, mọi nơi)' }
                ]}
              />
            </div>
          </div>
          */}

          <div className="row mt-3">
            <div className="col-12">
              <label htmlFor="isFeatured" style={{ 
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', borderRadius: '10px',
                background: formData.isFeatured ? 'rgba(193,154,91,0.08)' : '#f9f9f9',
                border: `1px solid ${formData.isFeatured ? 'rgba(193,154,91,0.3)' : '#eee'}`,
                cursor: 'pointer', userSelect: 'none', transition: 'all 0.2s',
                margin: 0
              }}>
                <span style={{
                  width: '40px', height: '22px', borderRadius: '11px', position: 'relative',
                  background: formData.isFeatured ? 'linear-gradient(135deg, #c19a5b, #d4af73)' : '#ccc',
                  transition: 'background 0.25s', flexShrink: 0, display: 'inline-block'
                }}>
                  <span style={{
                    width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: '2px', left: formData.isFeatured ? '20px' : '2px',
                    transition: 'left 0.25s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }}></span>
                </span>
                <input 
                  type="checkbox" 
                  id="isFeatured" 
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  style={{ display: 'none' }}
                />
                <span style={{ fontSize: '14px', color: '#555', fontWeight: '500' }}>
                  ⭐ Đặt làm "Khóa học nổi bật"
                </span>
              </label>
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-md-6">
              <AdminInput 
                label="Số lượng học viên (Hiển thị Ảo)" 
                name="students" 
                type="number" 
                value={formData.students !== undefined ? formData.students : ''} 
                onChange={handleChange} 
                min="0"
              />
            </div>
            <div className="col-md-6">
              <AdminInput 
                label="Số lượng đánh giá (Hiển thị Ảo)" 
                name="reviews" 
                type="number" 
                value={formData.reviews !== undefined ? formData.reviews : ''} 
                onChange={handleChange} 
                min="0"
              />
            </div>
          </div>



          </div>
          )}

          {activeTab === 1 && (
            <div className="admin-tab-content admin-paper p-4 mb-4">
              <h5 className="mb-4" style={{borderBottom: '1px solid var(--admin-border-light)', paddingBottom: '10px'}}>Nội dung & Hình ảnh</h5>

              <div className="mb-4">
                <AdminImageUpload label="Ảnh Đại Diện (Thumbnail)" name="thumbnail" value={formData.thumbnail} onChange={(url) => setFormData({ ...formData, thumbnail: url })} />
              </div>
              
              <AdminTextarea 
                label={<>Mô tả tổng quát <span className="text-danger">*</span></>} 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                placeholder="Nhập thông tin khóa học..."
                required
                minLength={20}
              />

        {/* [TEMPORARILY HIDDEN] Ẩn phần Lịch học & Ngày khai giảng */}
        {false && formData.programType === 'LIVE_CLASS' && (
        <div className="admin-paper p-4 mb-4">
          <h5 className="mb-4" style={{borderBottom: '1px solid var(--admin-border-light)', paddingBottom: '10px'}}>Lịch học & Ngày khai giảng</h5>
          <p className="text-muted"><small>Thêm các lịch học cụ thể. Học viên sẽ chọn lịch này khi đăng ký ghi danh.</small></p>
          
          {formData.classSessions.map((session, i) => (
            <div key={i} className="mt-4 p-4 position-relative" style={{ backgroundColor: 'var(--admin-glass-bg)', borderRadius: '12px', border: '1px solid var(--admin-glass-border)', transition: 'all 0.3s' }}>
              <div className="d-flex justify-content-between align-items-center mb-4 pb-3" style={{borderBottom: '1px solid var(--admin-glass-border)'}}>
                <h6 className="m-0" style={{ color: 'var(--admin-primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa fa-calendar-check-o"></i> Lịch học #{i + 1}
                </h6>
                <button type="button" className="btn btn-sm btn-danger rounded-pill px-3" onClick={() => removeArrayItem('classSessions', i)}>
                  <i className="fa fa-trash mr-1"></i> Xóa
                </button>
              </div>
              <div className="row">
                <div className="col-md-4">
                  <AdminInput label={<>Ngày khai giảng <span className="text-danger">*</span></>} type="datetime-local" value={session.startDate} onChange={e => handleArrayChange('classSessions', i, 'startDate', e.target.value)} required />
                </div>
                <div className="col-md-4">
                  <AdminInput label={<>Ngày kết thúc <span className="text-danger">*</span></>} type="datetime-local" value={session.endDate} onChange={e => handleArrayChange('classSessions', i, 'endDate', e.target.value)} required />
                </div>
                <div className="col-md-4">
                  <AdminInput label="Hạn chót đăng ký" type="datetime-local" value={session.enrollmentDeadline} onChange={e => handleArrayChange('classSessions', i, 'enrollmentDeadline', e.target.value)} />
                </div>
              </div>

              <div className="row mt-2">
                <div className="col-md-4">
                  <AdminSelect 
                    label={<>Ngày trong tuần <span className="text-danger">*</span></>} 
                    value={session.dayOfWeek} 
                    onChange={e => handleArrayChange('classSessions', i, 'dayOfWeek', e.target.value)}
                    required 
                    options={[
                      {label: '- Chọn ngày -', value: ''},
                      {label: 'Thứ Hai', value: 'Monday'},
                      {label: 'Thứ Ba', value: 'Tuesday'},
                      {label: 'Thứ Tư', value: 'Wednesday'},
                      {label: 'Thứ Năm', value: 'Thursday'},
                      {label: 'Thứ Sáu', value: 'Friday'},
                      {label: 'Thứ Bảy', value: 'Saturday'},
                      {label: 'Chủ Nhật', value: 'Sunday'}
                    ]}
                  />
                </div>
                <div className="col-md-4">
                  <AdminInput label="Giờ học" value={session.timeRange} onChange={e => handleArrayChange('classSessions', i, 'timeRange', e.target.value)} placeholder="VD: 10:00 AM - 12:00 PM" />
                </div>
                <div className="col-md-4">
                  <AdminInput label="Ghi chú Giảng viên" value={session.instructorOverride || ''} onChange={e => handleArrayChange('classSessions', i, 'instructorOverride', e.target.value)} placeholder="Giảng viên khác dạy thay" />
                </div>
              </div>
            </div>
          ))}
          <button type="button" className="btn btn-info rounded-pill px-4 mt-4" style={{ fontWeight: '600', letterSpacing: '0.5px' }} onClick={addClassSession}>
            <i className="fa fa-plus mr-2"></i> Thêm Lịch học
          </button>
        </div>
        )}

        {/* JSON ARRAY: Learning Goals */}
        <h5 className="mt-5 mb-3" style={{borderBottom: '1px solid var(--admin-border-light)', paddingBottom: '10px'}}>Mục tiêu khóa học (Thanh Kỹ Năng)</h5>
        {formData.learningGoals.map((goal, i) => (
          <div key={i} className="admin-array-card compact-array-row">
            <div className="flex-grow-1" style={{ flex: 2 }}>
              <input type="text" className="admin-form-control shadow-none w-100" value={goal.skill || ''} onChange={e => handleArrayChange('learningGoals', i, 'skill', e.target.value)} placeholder="Tên kỹ năng" />
            </div>
            <div className="flex-grow-1" style={{ flex: 1 }}>
              <input className="admin-form-control shadow-none w-100" type="number" value={goal.percent || ''} onChange={e => handleArrayChange('learningGoals', i, 'percent', parseInt(e.target.value) || 0)} placeholder="Phần trăm (%)" min="0" max="100" />
            </div>
            <button type="button" className="btn-remove-array" onClick={() => removeArrayItem('learningGoals', i)}>
              <i className="fa fa-trash"></i>
            </button>
          </div>
        ))}
        <button type="button" className="btn-add-array mt-3" onClick={addLearningGoal}>
          <i className="fa fa-plus"></i> Thêm Kỹ Năng Mới
        </button>

        {/* JSON ARRAY: Class Includes */}
        <h5 className="mt-5 mb-3" style={{borderBottom: '1px solid var(--admin-border-light)', paddingBottom: '10px'}}>Lợi ích khóa học</h5>
        {formData.classIncludes.map((item, i) => (
          <div key={i} className="admin-array-card compact-array-row">
            <div className="flex-grow-1">
              <input type="text" className="admin-form-control shadow-none w-100" value={item} onChange={e => handleArrayChange('classIncludes', i, null, e.target.value)} placeholder="Nội dung lợi ích..." />
            </div>
            <button type="button" className="btn-remove-array" onClick={() => removeArrayItem('classIncludes', i)}>
              <i className="fa fa-trash"></i>
            </button>
          </div>
        ))}
        <button type="button" className="btn-add-array mt-3" onClick={addClassInclude}>
          <i className="fa fa-plus"></i> Thêm Lợi Ích Mới
        </button>
      </div>
      )}

      {/* TAB 2: CURRICULUM */}
      {activeTab === 2 && (
      <div className="admin-tab-content admin-paper p-4 mb-4">
        <h5 className="mb-4" style={{borderBottom: '1px solid var(--admin-border-light)', paddingBottom: '10px'}}>Chương Trình Học (Giáo trình)</h5>
        
        {formData.curriculum.map((mod, i) => (
          <div key={i} className="admin-array-card">
            <div className="admin-array-card-header">
              <h6 className="admin-array-card-title">Chương {i + 1}</h6>
              <button type="button" className="btn-remove-array" title="Xóa chương" onClick={() => removeArrayItem('curriculum', i)}>
                <i className="fa fa-trash"></i>
              </button>
            </div>
            <AdminInput value={mod.title} onChange={e => handleArrayChange('curriculum', i, 'title', e.target.value)} placeholder="Tiêu đề chương" required />
            <AdminTextarea value={mod.content} onChange={e => handleArrayChange('curriculum', i, 'content', e.target.value)} rows="3" placeholder="Nội dung chi tiết chương học..." required minLength={10} />
          </div>
        ))}
        <button type="button" className="btn-add-array mt-3" onClick={addCurriculum}>
          <i className="fa fa-plus"></i> Thêm Chương Mới
        </button>
      </div>
      )}

      {/* TAB 3: PREMIUM CONTENT */}
      {activeTab === 3 && (
      <div className="admin-tab-content admin-paper p-4 mb-4">
        <h5 className="mb-2" style={{borderBottom: '1px solid var(--admin-border-light)', paddingBottom: '10px', color: '#c19a5b'}}>
          <i className="fa fa-star mr-2"></i> Nội Dung Private (Premium)
        </h5>
        <p className="text-muted mb-4" style={{ fontSize: '14px' }}>
          Nội dung này chỉ hiển thị cho học viên đã sở hữu khóa học. Hệ thống sẽ tự động chuyển đổi link YouTube/Vimeo sang định dạng nhúng.
        </p>

        {/* ─── Videos ─── */}
        <div className="mb-5">
          <h6 className="mb-3 font-weight-bold d-flex align-items-center" style={{ gap: '8px' }}>
            <i className="fa fa-play-circle" style={{ color: '#c19a5b' }}></i> Video Bài Giảng
          </h6>
          {(formData.premiumContent?.videos || []).map((video, i) => (
            <div key={i} className="admin-array-card p-3 mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span style={{ fontWeight: '700', fontSize: '13px', color: '#c19a5b' }}>Bài {i + 1}</span>
                <button type="button" className="btn-remove-array" onClick={() => {
                    const updated = [...(formData.premiumContent?.videos || [])];
                    updated.splice(i, 1);
                    setFormData({ ...formData, premiumContent: { ...formData.premiumContent, videos: updated } });
                }}>
                  <i className="fa fa-trash"></i>
                </button>
              </div>
              <div className="row">
                <div className="col-md-5">
                  <label className="small text-muted mb-1">Tiêu đề video</label>
                  <input type="text" className="admin-form-control shadow-none w-100" value={video.title || ''} onChange={e => {
                    const updated = [...(formData.premiumContent?.videos || [])];
                    updated[i] = { ...updated[i], title: e.target.value };
                    setFormData({ ...formData, premiumContent: { ...formData.premiumContent, videos: updated } });
                  }} placeholder="VD: Bài 1 - Kỹ thuật trộn bột" />
                </div>
                <div className="col-md-7">
                  <label className="small text-muted mb-1">Link video (YouTube, Vimeo hoặc link nhúng)</label>
                  <input type="text" className="admin-form-control shadow-none w-100" value={video.url || ''} onChange={e => {
                    const updated = [...(formData.premiumContent?.videos || [])];
                    updated[i] = { ...updated[i], url: e.target.value };
                    setFormData({ ...formData, premiumContent: { ...formData.premiumContent, videos: updated } });
                  }} placeholder="https://www.youtube.com/watch?v=..." />
                  <small className="text-muted d-block mt-1" style={{ fontSize: '11px' }}>
                    <i className="fa fa-info-circle mr-1"></i>Chấp nhận link YouTube, Vimeo, Google Drive. Hệ thống tự chuyển đổi.
                  </small>
                </div>
              </div>
            </div>
          ))}
          <button type="button" className="btn-add-array mt-2" onClick={() => {
            setFormData({ ...formData, premiumContent: { ...formData.premiumContent, videos: [...(formData.premiumContent?.videos || []), { title: '', url: '' }] } });
          }}><i className="fa fa-plus mr-2"></i> Thêm Video Bài Giảng</button>
        </div>

        {/* ─── Resources ─── */}
        <div className="mb-5">
          <h6 className="mb-3 font-weight-bold d-flex align-items-center" style={{ gap: '8px' }}>
            <i className="fa fa-download" style={{ color: '#c19a5b' }}></i> Tài Nguyên Tải Xuống
          </h6>
          {(formData.premiumContent?.resources || []).map((res, i) => (
            <div key={i} className="admin-array-card p-3 mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span style={{ fontWeight: '700', fontSize: '13px', color: '#c19a5b' }}>Tài liệu {i + 1}</span>
                <button type="button" className="btn-remove-array" onClick={() => {
                    const updated = [...(formData.premiumContent?.resources || [])];
                    updated.splice(i, 1);
                    setFormData({ ...formData, premiumContent: { ...formData.premiumContent, resources: updated } });
                }}>
                  <i className="fa fa-trash"></i>
                </button>
              </div>
              <div className="row">
                <div className="col-md-5">
                  <label className="small text-muted mb-1">Tên tài liệu</label>
                  <input type="text" className="admin-form-control shadow-none w-100" value={res.title || ''} onChange={e => {
                    const updated = [...(formData.premiumContent?.resources || [])];
                    updated[i] = { ...updated[i], title: e.target.value };
                    setFormData({ ...formData, premiumContent: { ...formData.premiumContent, resources: updated } });
                  }} placeholder="VD: Công thức Bánh Croissant PDF" />
                </div>
                <div className="col-md-7">
                  <label className="small text-muted mb-1">Link tải xuống</label>
                  <input type="text" className="admin-form-control shadow-none w-100" value={res.url || ''} onChange={e => {
                    const updated = [...(formData.premiumContent?.resources || [])];
                    updated[i] = { ...updated[i], url: e.target.value };
                    setFormData({ ...formData, premiumContent: { ...formData.premiumContent, resources: updated } });
                  }} placeholder="https://drive.google.com/..." />
                </div>
              </div>
            </div>
          ))}
          <button type="button" className="btn-add-array mt-2" onClick={() => {
            setFormData({ ...formData, premiumContent: { ...formData.premiumContent, resources: [...(formData.premiumContent?.resources || []), { title: '', url: '' }] } });
          }}><i className="fa fa-plus mr-2"></i> Thêm Tài Liệu</button>
        </div>

        {/* ─── Guides ─── */}
        <div>
          <h6 className="mb-3 font-weight-bold d-flex align-items-center" style={{ gap: '8px' }}>
            <i className="fa fa-book" style={{ color: '#c19a5b' }}></i> Hướng Dẫn Chi Tiết
          </h6>
          <p className="text-muted mb-2" style={{ fontSize: '13px' }}>
            Viết nội dung hướng dẫn, công thức, lưu ý dành riêng cho học viên. Hỗ trợ HTML cơ bản.
          </p>
          <AdminTextarea 
            value={formData.premiumContent?.guides || ''} 
            onChange={e => setFormData({ ...formData, premiumContent: { ...formData.premiumContent, guides: e.target.value } })}
            rows="8"
            placeholder="<h3>Công thức chi tiết</h3>\n<p>Bước 1: Chuẩn bị nguyên liệu...</p>"
          />
        </div>
      </div>
      )}

      </form>
    </div>
  );
};

export default AdminProgramEditor;
