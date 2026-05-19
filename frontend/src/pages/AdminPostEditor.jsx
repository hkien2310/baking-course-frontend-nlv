import SharedQuillEditor from '../components/Admin/Shared/SharedQuillEditor';
import { useInitOnLoaded } from '../hooks/useInitOnLoaded';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPostBySlug, createPost, updatePost, getCategories } from '../services/api';
import { toast } from 'react-toastify';
import AdminImageUpload from '../components/Admin/AdminImageUpload';
import { ROUTES } from '../constants/routes';
import { AdminInput, AdminSelect, AdminTextarea } from '../components/Admin/Shared/AdminFormControls';
import AdminLoadingBlock from '../components/Admin/AdminLoadingBlock';
import AdminEditorLayout from '../components/Admin/Shared/AdminEditorLayout';
import { parseHtmlWithVideos } from '../utils/videoParser';
import './AdminDesign.css';

const today = new Date();
const defaultDateString = today.toISOString();

const AdminPostEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);

  
  const [formData, setFormData] = useState({
    title: '', slug: '', category: '', type: 'BLOG', thumbnail: '', authorName: 'Admin', dateString: defaultDateString, content: '', desc: ''
  });

  useEffect(() => {
    // We add 'admin-mode' body class since this is a full page component replacing AdminDashboard wrapper
    document.body.classList.add('admin-mode');
    
    getCategories({ type: 'POST' })
      .then(res => {
        console.log("DEBUG: Loaded POST categories:", res);
        const list = Array.isArray(res) ? res : (res?.data || []);
        setCategories(list);
      })
      .catch(() => console.error("Could not load categories"));

    if (isEditing) {
      getPostBySlug(id)
        .then(post => {
          console.log("DEBUG: Loaded post category:", post.category);
          setFormData({
            title: post.title || '',
            slug: post.slug || '',
            category: post.category ? post.category.trim() : '',
            type: post.type || 'BLOG',
            thumbnail: post.thumbnail || '',
            authorName: post.authorName || 'Admin',
            dateString: post.dateString || defaultDateString,
            content: post.content || '',
            desc: post.desc || ''
          });
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          toast.error("Lỗi khi tải bài viết");
          setLoading(false);
        });
    }

    return () => document.body.classList.remove('admin-mode');
  }, [id, isEditing]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...formData };
      if (isEditing) {
        await updatePost(id, payload);
        toast.success("Cập nhật bài viết thành công!");
      } else {
        await createPost(payload);
        toast.success("Tạo bài viết thành công!");
      }
      navigate(ROUTES.ADMIN + "#posts");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi lưu bài viết");
    } finally {
      setSaving(false);
    }
  };

  useInitOnLoaded(loading);

  return (
    <AdminEditorLayout
      title={isEditing ? 'Sửa Bài Viết' : 'Tạo Bài Viết Mới'}
      backUrl={ROUTES.ADMIN + "#posts"}
      saving={saving}
      saveLabel="Lưu Bài Viết"
      formId="admin-post-form"
    >

      <div className="container-fluid p-4" style={{ flexGrow: 1 }}>
        {loading ? (
          <div className="admin-paper h-100 w-100 p-4">
            <AdminLoadingBlock rows={8} />
          </div>
        ) : (
        <form id="admin-post-form" onSubmit={handleSave} className="row h-100">
          
          {/* LEFT: EDITOR FORM */}
          <div className="col-lg-6 mb-4">
            <div className="admin-paper h-100 w-100 p-4">
              <h5 className="mb-4" style={{borderBottom: '1px solid var(--admin-border-subtle)', paddingBottom: '10px'}}>Trình Soạn Thảo</h5>
              
              <div className="admin-form-group">
                <AdminInput
                  label={<>Tiêu đề <span className="text-danger">*</span></>}
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Nhập tiêu đề bài viết..."
                  style={{ fontSize: '18px', fontWeight: 'bold' }}
                  required
                  minLength={5}
                />
                <small className="form-text mt-1 text-muted">
                   Đường dẫn (slug) sẽ tự động tạo khi lưu. Slug hiện tại: <strong>{formData.slug || 'Chưa có'}</strong>
                </small>
              </div>

              <div className="row mt-4">
                <div className="col-md-4">
                  <AdminSelect 
                    label="Loại"
                    name="type" 
                    value={formData.type} 
                    onChange={handleChange} 
                    options={[
                      { value: 'BLOG', label: 'Bài Viết Blog' },
                      { value: 'RECIPE', label: 'Công Thức' }
                    ]}
                  />
                </div>
                <div className="col-md-4">
                  <AdminSelect 
                    label="Chuyên mục"
                    name="category" 
                    value={formData.category} 
                    onChange={handleChange} 
                    options={[
                      { value: '', label: '-- Chọn có sẵn --' },
                      ...categories.map(c => ({ value: c.name, label: c.name }))
                    ]}
                  />
                </div>
                <div className="col-md-4">
                  <AdminInput 
                    type="date"
                    label="Ngày hiển thị"
                    name="dateString" 
                    value={formData.dateString ? formData.dateString.split('T')[0] : ''} 
                    onChange={(e) => {
                      // Save it as a valid ISO string so the DB is happy, or just string.
                      // If user selects "2024-10-15", it comes as "2024-10-15"
                      const d = new Date(e.target.value);
                      const str = isNaN(d.getTime()) ? formData.dateString : d.toISOString();
                      setFormData({ ...formData, dateString: str });
                    }} 
                  />
                </div>
              </div>



              <div className="mt-3">
                <AdminImageUpload
                  label="Ảnh Đại Diện"
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={(url) => setFormData({ ...formData, thumbnail: url })}
                />
              </div>

              <div className="mt-3">
                <AdminTextarea 
                  label="Mô tả ngắn" 
                  name="desc" 
                  value={formData.desc} 
                  onChange={handleChange} 
                  rows="3" 
                  placeholder="Đoạn trích giới thiệu..."
                />
              </div>

              <div className="mt-3 flex-grow-1 d-flex flex-column">
                <label style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--admin-heading)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nội dung chi tiết <span className="text-danger">*</span></label>
                <div style={{ flexGrow: 1, paddingBottom: '40px' }}>
                  <SharedQuillEditor 
                    value={formData.content} 
                    onChange={(value) => setFormData({ ...formData, content: value })} 
                    style={{ height: '100%', minHeight: '300px' }}
                    placeholder="Viết nội dung bài viết tại đây..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: LIVE PREVIEW */}
          <div className="col-lg-6 mb-4">
            <div className="admin-paper h-100 w-100 p-0 overflow-hidden" style={{ display: 'flex', flexDirection: 'column', border: '1px solid #e0e0e0', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
              <div className="p-3" style={{ borderBottom: '1px solid var(--admin-border-subtle)', backgroundColor: 'var(--admin-paper-bg)' }}>
                <h5 className="m-0" style={{ color: 'var(--admin-heading)', fontWeight: '700' }}><i className="fa fa-eye mr-2 text-info"></i> Xem Trước Giao Diện Blog</h5>
              </div>
              
              <div className="preview-container p-4" style={{ backgroundColor: '#fff', color: '#333', flexGrow: 1, overflowY: 'auto' }}>
                <div style={{ maxWidth: '650px', margin: '0 auto' }}>
                  {/* Simulated Blog Post View */}
                  {formData.thumbnail && (
                    <img src={formData.thumbnail.startsWith('http') ? formData.thumbnail : `${(import.meta.env.VITE_API_BASE_URL || '').replace(/\/api$/, '')}${formData.thumbnail.startsWith('/') ? '' : '/'}${formData.thumbnail}`} alt="" style={{ width: '100%', height: '350px', objectFit: 'cover', borderRadius: '12px', marginBottom: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                  )}
                  
                  <div style={{ color: 'var(--admin-primary)', fontWeight: '700', fontSize: '13px', marginBottom: '12px', letterSpacing: '0.15px' }}>
                    {formData.category || 'CHUYÊN MỤC'} • {formData.dateString || 'MỚI NHẤT'}
                  </div>
                  
                  <h1 style={{ fontSize: '32px', color: '#1a1a1a', marginBottom: '20px', fontWeight: '800', lineHeight: '1.3' }}>
                    {formData.title || 'Bài viết chưa có tiêu đề'}
                  </h1>
                  
                  <div style={{ fontStyle: 'italic', color: '#555', borderLeft: '4px solid var(--admin-primary)', paddingLeft: '18px', marginBottom: '35px', fontSize: '17px', lineHeight: '1.6', backgroundColor: 'rgba(0,0,0,0.02)', padding: '15px 15px 15px 20px', borderRadius: '0 8px 8px 0' }}>
                    {formData.desc || 'Đoạn chú thích ngắn gọn sẽ xuất hiện tại đây để thu hút người đọc...'}
                  </div>

                  <div className="content-preview" style={{ lineHeight: '1.8', fontSize: '16px', color: '#333' }}>
                    {formData.content ? parseHtmlWithVideos(formData.content) : <p className="text-muted">Nội dung bài viết sẽ xuất hiện tại đây...</p>}
                  </div>
                </div>
              </div>

            </div>
          </div>

        </form>
        )}
      </div>
    </AdminEditorLayout>
  );
};

export default AdminPostEditor;
