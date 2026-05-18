import { useInitOnLoaded } from '../hooks/useInitOnLoaded';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProgramBySlug, createProgram, updateProgram, getChiefs, getCategories } from '../services/api';
import { toast } from 'react-toastify';
import AdminImageUpload from '../components/Admin/AdminImageUpload';
import { AdminInput, AdminSelect, AdminTextarea, AdminCurrencyInput } from '../components/Admin/Shared/AdminFormControls';
import { ROUTES } from '../constants/routes';
import { priceToDollars, dollarsToCents } from '../utils/formatters';
import AdminLoadingBlock from '../components/Admin/AdminLoadingBlock';
import AdminEditorLayout from '../components/Admin/Shared/AdminEditorLayout';
import LessonCollapse from '../components/Shared/LessonCollapse';
import SharedQuillEditor from '../components/Admin/Shared/SharedQuillEditor';
import './AdminDesign.css';

const AdminProgramEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);

  const formatForDateTimeLocal = (date) => {
    if (!date || isNaN(new Date(date))) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState({
    programType: 'VIDEO_COURSE', // [TEMPORARILY HIDDEN] Was 'LIVE_CLASS'
    category: '',
    authorName: '', authorImage: '', chiefId: '',
    learningGoals: [], classIncludes: [], curriculum: [],
    premiumContent: { videos: [], resources: [], guides: '' },
    saleEndDate: ''
  });

  const [chiefsList, setChiefsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [expandedLessonIndex, setExpandedLessonIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  const TABS = [
    { id: 0, label: 'Thông tin chung & Hình ảnh' },
    { id: 1, label: 'Quản lý nội dung' }
  ];

  useEffect(() => {
    document.body.classList.add('admin-mode');

    getChiefs().then(res => {
      setChiefsList(res.data || res || []);
    }).catch(err => console.error("Failed to load chiefs", err));

    getCategories({ type: 'PROGRAM' }).then(res => {
      console.log("DEBUG: Loaded categories:", res);
      const list = Array.isArray(res) ? res : (res?.data || []);
      setCategoriesList(list.filter(c => c.isActive) || []);
    }).catch(err => console.error("Failed to load categories", err));

    if (isEditing) {
      // getProgramByIdOrSlug supports both
      getProgramBySlug(id)
        .then(prog => {
          console.log("DEBUG: Loaded program category:", prog.category);
          let pContent = prog.premiumContent || { videos: [] };
          if (!pContent.videos) pContent.videos = [];
          let oldResources = pContent.resources || [];
          let oldGuides = pContent.guides || '';

          if (oldResources.length > 0 || oldGuides) {
            if (pContent.videos.length === 0) {
              pContent.videos.push({ title: 'Bài 1', url: '', resources: oldResources, guides: oldGuides });
            } else {
              pContent.videos[0].resources = [...(pContent.videos[0].resources || []), ...oldResources];
              pContent.videos[0].guides = pContent.videos[0].guides ? (pContent.videos[0].guides + oldGuides) : oldGuides;
            }
            delete pContent.resources;
            delete pContent.guides;
          }

          setFormData({
            programType: prog.programType || 'VIDEO_COURSE',
            title: prog.title || '',
            slug: prog.slug || '',
            category: prog.category ? prog.category.trim() : '',
            description: prog.description || '',
            price: prog.price != null ? priceToDollars(prog.price) : '10000000',
            salePrice: prog.salePrice != null ? priceToDollars(prog.salePrice) : '',
            saleEndDate: formatForDateTimeLocal(prog.saleEndDate),
            thumbnail: prog.thumbnail || '', isFeatured: prog.isFeatured || false,
            chiefId: prog.chiefId || '',
            authorName: prog.authorName || '',
            authorImage: prog.authorImage || '',
            learningGoals: Array.isArray(prog.learningGoals) ? prog.learningGoals.map(g => typeof g === 'string' ? { skill: g, percent: 50 } : g) : [],
            classIncludes: Array.isArray(prog.classIncludes) ? prog.classIncludes : [],
            curriculum: Array.isArray(prog.curriculum) ? prog.curriculum : [],
            students: prog.students || 0,
            reviews: prog.reviews || 0,
            premiumContent: pContent
          });
          setLoading(false);
        })
        .catch(err => {
          console.error("DEBUG FETCH ERROR:", err);
          toast.error("Lỗi khi tải dữ liệu khóa học: " + (err.response?.data?.error || err.message));
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

    // --- Custom Validation --- //
    // Tab 0
    if (!formData.title || formData.title.trim().length < 5) {
      setActiveTab(0);
      toast.error("Vui lòng nhập Tên Khóa Học (ít nhất 5 ký tự).");
      return;
    }
    if (!formData.category) {
      setActiveTab(0);
      toast.error("Vui lòng chọn Danh mục.");
      return;
    }
    if (!formData.price && formData.price !== 0 && formData.price !== '0') {
      setActiveTab(0);
      toast.error("Vui lòng nhập Giá gốc.");
      return;
    }

    // General Info Thumbnail & Description
    if (!formData.thumbnail) {
      setActiveTab(0);
      toast.error("Vui lòng tải lên Ảnh Đại Diện (Thumbnail).");
      return;
    }
    if (!formData.description || formData.description.trim().length < 20) {
      setActiveTab(0);
      toast.error("Vui lòng nhập Mô tả tổng quát (ít nhất 20 ký tự).");
      return;
    }

    // Tab 1: Premium Content
    if (formData.premiumContent) {
      const videos = formData.premiumContent.videos || [];
      for (let i = 0; i < videos.length; i++) {
        const v = videos[i];
        if (!v.title) {
          setActiveTab(1);
          toast.error(`Vui lòng điền đủ tiêu đề cho Video Bài Giảng ${i + 1}.`);
          return;
        }
        const resources = v.resources || [];
        const invalidResIndex = resources.findIndex(r => !r.title || !r.url);
        if (invalidResIndex !== -1) {
          setActiveTab(1);
          toast.error(`Vui lòng điền đủ tên và link cho Tài Liệu đính kèm trong Bài Giảng ${i + 1}.`);
          return;
        }
      }
    }
    // --- End Validation --- //

    setSaving(true);
    try {
      const priceVal = (formData.price || formData.price === 0) ? dollarsToCents(formData.price) : null;
      const salePriceVal = (formData.salePrice || formData.salePrice === 0) ? dollarsToCents(formData.salePrice) : null;

      // Price validation
      if (priceVal != null && priceVal > 2000000000) {
        setActiveTab(0);
        toast.error("Giá gốc quá lớn (tối đa 2 tỷ VNĐ).");
        setSaving(false);
        return;
      }
      if (salePriceVal != null && salePriceVal > 2000000000) {
        setActiveTab(0);
        toast.error("Giá khuyến mãi quá lớn (tối đa 2 tỷ VNĐ).");
        setSaving(false);
        return;
      }
      if (salePriceVal != null && priceVal != null && salePriceVal >= priceVal) {
        setActiveTab(0);
        toast.error("Giá khuyến mãi phải nhỏ hơn giá gốc.");
        setSaving(false);
        return;
      }

      const payload = {
        ...formData,
        programType: 'VIDEO_COURSE', // Force all to video course
        price: priceVal,
        salePrice: salePriceVal,
        saleEndDate: formData.saleEndDate ? new Date(formData.saleEndDate).toISOString() : null,
        classSessions: [] // Always clear class sessions since there are no live classes
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
    } finally {
      setSaving(false);
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




  useInitOnLoaded(loading);

  return (
    <AdminEditorLayout
      title={isEditing ? 'Sửa Khóa Học' : 'Tạo Khóa Học Mới'}
      backUrl={ROUTES.ADMIN + "#programs"}
      saving={saving}
      saveLabel="Lưu Khóa Học"
      formId="admin-program-form"
    >
      <form id="admin-program-form" onSubmit={handleSave} className="container p-4 admin-editor-form" style={{ flexGrow: 1, maxWidth: '1000px', margin: '0 auto', width: '100%' }}>

        {/* Tabs Navigation */}
        <div className="admin-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`admin-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              disabled={loading}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="admin-tab-content admin-paper p-4 mb-4">
            <AdminLoadingBlock rows={8} />
          </div>
        ) : activeTab === 0 && (
          <div className="admin-tab-content admin-paper p-4 mb-4">
            <h5 className="mb-4" style={{ borderBottom: '1px solid var(--admin-border-light)', paddingBottom: '10px' }}>Thông tin chung & Chi phí</h5>

            <div className="row">
              <div className="col-md-8">
                <AdminInput
                  label={<>Tên Khóa Học <span className="text-danger">*</span></>}
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Làm Bánh Ngọt Pháp Cơ Bản..."
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
                />
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-md-6">
                <AdminCurrencyInput
                  label={<>Giá gốc (đ) <span className="text-danger">*</span></>}
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="500.000"
                />
              </div>
              <div className="col-md-6">
                <AdminCurrencyInput
                  label="Giá khuyến mãi (đ)"
                  name="salePrice"
                  value={formData.salePrice || ''}
                  onChange={handleChange}
                  placeholder="Để trống nếu không KM"
                />
              </div>
            </div>

            {formData.salePrice && (
              <div className="row mt-3">
                <div className="col-md-6">
                  <AdminInput
                    label="Ngày hết hạn khuyến mãi"
                    name="saleEndDate"
                    type="datetime-local"
                    value={formData.saleEndDate || ''}
                    onChange={handleChange}
                    placeholder="Chọn ngày"
                  />
                  <small className="text-muted"><i className="fa fa-info-circle mr-1"></i> Sau ngày này, khóa học sẽ quay về giá gốc và biến mất khỏi Slider Flash Sale.</small>
                </div>
              </div>
            )}

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



            <div className="row mt-4">
              <div className="col-12 mb-4">
                <AdminImageUpload label={<>Ảnh Đại Diện (Thumbnail) <span className="text-danger">*</span></>} name="thumbnail" value={formData.thumbnail} onChange={(url) => setFormData({ ...formData, thumbnail: url })} />
              </div>

              <div className="col-12 mb-4">
                <label className="admin-form-label" style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>Mô tả tổng quát <span className="text-danger">*</span></label>
                <div style={{ background: '#fff' }}>
                  <SharedQuillEditor
                    value={formData.description || ''}
                    onChange={(content) => {
                      setFormData({ ...formData, description: content })
                    }}
                    placeholder="Nhập thông tin khóa học..."
                    style={{ height: '300px', marginBottom: '50px' }}
                  />
                </div>
              </div>
            </div>

          </div>
        )}


        {/* TAB 3: PREMIUM CONTENT */}
        {activeTab === 1 && (
          <div className="admin-tab-content admin-paper p-4 mb-4">
            <h5 className="mb-2" style={{ borderBottom: '1px solid var(--admin-border-light)', paddingBottom: '10px', color: '#c19a5b' }}>
              <i className="fa fa-folder-open mr-2"></i> Quản lý nội dung
            </h5>
            <p className="text-muted mb-4" style={{ fontSize: '14px' }}>
              Tạo và sắp xếp các bài giảng. Bạn có thể thiết lập bài giảng hiển thị miễn phí (Học thử) hoặc yêu cầu phải mua khóa học (Premium). Link video có thể bỏ trống nếu bài học chỉ có nội dung/tài liệu.
            </p>

            {/* ─── Lessons ─── */}
            <div className="mb-5">
              <h6 className="mb-3 font-weight-bold d-flex align-items-center" style={{ gap: '8px' }}>
                <i className="fa fa-play-circle" style={{ color: '#c19a5b' }}></i> Danh sách Bài Giảng
              </h6>
              {(formData.premiumContent?.videos || []).map((video, i) => (
                <LessonCollapse
                  key={i}
                  index={i}
                  title={video.title}
                  isFree={video.isFree}
                  isOpen={expandedLessonIndex === i}
                  onToggle={() => setExpandedLessonIndex(expandedLessonIndex === i ? -1 : i)}
                  mode="admin"
                  rightActions={
                    <button type="button" className="btn-remove-array" onClick={(e) => {
                      e.stopPropagation();
                      const updated = [...(formData.premiumContent?.videos || [])];
                      updated.splice(i, 1);
                      setFormData({ ...formData, premiumContent: { ...formData.premiumContent, videos: updated } });
                    }}>
                      <i className="fa fa-trash"></i>
                    </button>
                  }
                >
                  <div>
                    {/* Lesson Access Type */}
                    <div className="mb-3 p-3" style={{ background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <h6 className="mb-1" style={{ fontSize: '14px', fontWeight: 'bold' }}>Chỉ học viên</h6>
                          <p className="mb-0 text-muted" style={{ fontSize: '12px' }}>Bật lựa chọn này để giới hạn bài học chỉ dành cho người đã mua khóa. Tắt để mở Học thử.</p>
                        </div>
                        <div className="custom-control custom-switch">
                          <input type="checkbox" className="custom-control-input" id={`isPremium-${i}`} checked={!video.isFree} onChange={e => {
                            const updated = [...(formData.premiumContent?.videos || [])];
                            updated[i] = { ...updated[i], isFree: !e.target.checked };
                            setFormData({ ...formData, premiumContent: { ...formData.premiumContent, videos: updated } });
                          }} />
                          <label className="custom-control-label" htmlFor={`isPremium-${i}`} style={{ fontSize: '14px', fontWeight: 'bold', color: !video.isFree ? '#ffc107' : '#999', cursor: 'pointer', userSelect: 'none' }}>
                            Chỉ học viên
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-5">
                        <label className="small text-muted mb-1">Tiêu đề bài giảng <span className="text-danger">*</span></label>
                        <input type="text" className="admin-form-control shadow-none w-100" value={video.title || ''} onChange={e => {
                          const updated = [...(formData.premiumContent?.videos || [])];
                          updated[i] = { ...updated[i], title: e.target.value };
                          setFormData({ ...formData, premiumContent: { ...formData.premiumContent, videos: updated } });
                        }} placeholder="VD: Bài 1 - Kỹ thuật trộn bột" />
                      </div>
                      <div className="col-md-7">
                        <label className="small text-muted mb-1">Link video (YouTube, Vimeo hoặc link nhúng) <span className="text-muted">(Không bắt buộc)</span></label>
                        <input type="text" className="admin-form-control shadow-none w-100" value={video.url || ''} onChange={e => {
                          const updated = [...(formData.premiumContent?.videos || [])];
                          updated[i] = { ...updated[i], url: e.target.value };
                          setFormData({ ...formData, premiumContent: { ...formData.premiumContent, videos: updated } });
                        }} placeholder="https://www.youtube.com/watch?v=..." />
                      </div>
                    </div>

                    {/* Lesson Resources */}
                    <div className="mb-3 mt-4">
                      <label className="small font-weight-bold mb-2 d-block"><i className="fa fa-paperclip mr-1"></i> Tài liệu đính kèm</label>
                      {(video.resources || []).map((res, rIndex) => (
                        <div key={rIndex} className="p-3 mb-2" style={{ background: '#fff', border: '1px dashed #ccc', borderRadius: '8px' }}>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#555' }}>Tài liệu {rIndex + 1}</span>
                            <button type="button" className="btn btn-sm btn-outline-danger" style={{ padding: '2px 6px', fontSize: '12px' }} onClick={() => {
                              const updated = [...(formData.premiumContent?.videos || [])];
                              updated[i].resources.splice(rIndex, 1);
                              setFormData({ ...formData, premiumContent: { ...formData.premiumContent, videos: updated } });
                            }}><i className="fa fa-trash"></i> Xoá</button>
                          </div>
                          <div className="row">
                            <div className="col-md-5">
                              <input type="text" className="admin-form-control shadow-none w-100" style={{ fontSize: '13px' }} value={res.title || ''} onChange={e => {
                                const updated = [...(formData.premiumContent?.videos || [])];
                                if (!updated[i].resources) updated[i].resources = [];
                                updated[i].resources[rIndex] = { ...updated[i].resources[rIndex], title: e.target.value };
                                setFormData({ ...formData, premiumContent: { ...formData.premiumContent, videos: updated } });
                              }} placeholder="Tên tài liệu..." />
                            </div>
                            <div className="col-md-7">
                              <input type="text" className="admin-form-control shadow-none w-100" style={{ fontSize: '13px' }} value={res.url || ''} onChange={e => {
                                const updated = [...(formData.premiumContent?.videos || [])];
                                if (!updated[i].resources) updated[i].resources = [];
                                updated[i].resources[rIndex] = { ...updated[i].resources[rIndex], url: e.target.value };
                                setFormData({ ...formData, premiumContent: { ...formData.premiumContent, videos: updated } });
                              }} placeholder="Link Google Drive, PDF..." />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button type="button" className="btn btn-sm" style={{ background: '#eee', color: '#555', fontSize: '12px' }} onClick={() => {
                        const updated = [...(formData.premiumContent?.videos || [])];
                        if (!updated[i].resources) updated[i].resources = [];
                        updated[i].resources.push({ title: '', url: '' });
                        setFormData({ ...formData, premiumContent: { ...formData.premiumContent, videos: updated } });
                      }}><i className="fa fa-plus mr-1"></i> Thêm file đính kèm</button>
                    </div>

                    {/* Lesson Guides */}
                    <div className="mt-4">
                      <label className="small font-weight-bold mb-2 d-block"><i className="fa fa-file-text-o mr-1"></i> Nội dung</label>
                      <div style={{ background: '#fff' }}>
                        <SharedQuillEditor
                          value={video.guides || ''}
                          onChange={(content) => {
                            const updated = [...(formData.premiumContent?.videos || [])];
                            updated[i].guides = content;
                            setFormData({ ...formData, premiumContent: { ...formData.premiumContent, videos: updated } });
                          }}
                          placeholder="Nhập công thức chi tiết cho bài này..."
                          style={{ height: '200px', marginBottom: '40px' }}
                        />
                      </div>
                    </div>

                  </div>
                </LessonCollapse>
              ))}
              <button type="button" className="btn btn-add-array mt-2" onClick={() => {
                setFormData({ ...formData, premiumContent: { ...formData.premiumContent, videos: [...(formData.premiumContent?.videos || []), { title: '', url: '', isFree: false, resources: [], guides: '' }] } });
              }}><i className="fa fa-plus mr-2"></i> Thêm Bài Giảng</button>
            </div>
          </div>
        )}

      </form>
    </AdminEditorLayout>
  );
};

export default AdminProgramEditor;
