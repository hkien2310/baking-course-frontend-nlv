import React, { useState, useRef } from 'react';
import { uploadImage } from '../../services/api';

const AdminImageUpload = ({ label, value, onChange, name }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, PNG, GIF, WEBP files are allowed.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be smaller than 5MB.');
      return;
    }

    setError('');
    setUploading(true);
    try {
      const result = await uploadImage(file);
      // Backend returns { url: '/uploads/image-xxxxx.jpg' }
      // Prefix with backend base URL for display
      const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || window.location.origin;
      const fullUrl = result.url.startsWith('http') ? result.url : `${baseUrl}${result.url}`;
      onChange(fullUrl);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const imgSrc = value || '';

  return (
    <div className="admin-form-group">
      <label>{label}</label>

      {/* Drop Zone */}
      <div
        className="admin-upload-zone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: dragOver ? '2px dashed #3b82f6' : isHovered ? '2px dashed #94a3b8' : '2px dashed #cbd5e1',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragOver ? 'rgba(59, 130, 246, 0.05)' : isHovered ? '#f8fafc' : '#ffffff',
          transition: 'all 0.25s ease',
          minHeight: '140px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />

        {uploading ? (
          <div style={{ color: '#3b82f6', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <i className="fa fa-spinner fa-spin" style={{ fontSize: '36px', marginBottom: '16px' }}></i>
            <div className="admin-loading-heading-shell shimmer" style={{ width: '160px', height: '12px' }}></div>
          </div>
        ) : imgSrc ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', width: '100%', padding: '0 12px' }}>
            <div style={{ 
              width: '90px', 
              height: '90px', 
              borderRadius: '8px', 
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              flexShrink: 0,
              background: '#f1f5f9'
            }}>
              <img src={imgSrc} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <div style={{ color: 'var(--admin-heading)', fontWeight: 600, fontSize: '15px', marginBottom: '6px' }}>Image Selected</div>
              <div style={{ color: '#64748b', fontSize: '13px', wordBreak: 'break-all', maxWidth: '300px' }}>
                {imgSrc.length > 45 ? '...' + imgSrc.slice(-42) : imgSrc}
              </div>
              <div style={{ color: '#3b82f6', fontSize: '14px', marginTop: '12px', fontWeight: 500 }}>
                <i className="fa fa-pencil" style={{ marginRight: '6px' }}></i> Click to replace image
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '50%', 
              background: 'rgba(59, 130, 246, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <i className="fa fa-cloud-upload" style={{ fontSize: '28px', color: '#3b82f6' }}></i>
            </div>
            <h5 style={{ color: 'var(--admin-heading)', margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>Click to upload or drag and drop</h5>
            <span style={{ color: '#64748b', fontSize: '13px' }}>SVG, PNG, JPG or WEBP (max. 5MB)</span>
          </div>
        )}
      </div>

      {/* Fallback: manual URL input */}
      <div className="mt-3" style={{ position: 'relative' }}>
        <i className="fa fa-link" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}></i>
        <input
          type="text"
          name={name}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="admin-form-control"
          placeholder="Or paste external image URL manually..."
          style={{ fontSize: '13px', paddingLeft: '40px' }}
        />
      </div>

      {error && (
        <small className="text-danger" style={{ display: 'block', marginTop: '4px' }}>{error}</small>
      )}
    </div>
  );
};

export default AdminImageUpload;
