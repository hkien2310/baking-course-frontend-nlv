import React, { useRef, useCallback, useEffect } from 'react';

export const AdminInput = ({ label, type = 'text', value, onChange, onBlur, placeholder, min, max, name, error, required, minLength, list }) => (
  <div className="admin-form-group">
    {label && <label htmlFor={name}>{label}</label>}
    <input 
      type={type} 
      name={name}
      id={name}
      value={value} 
      onChange={onChange}
      onBlur={onBlur}
      className={`admin-form-control shadow-none${error ? ' is-invalid' : ''}`}
      placeholder={placeholder}
      min={min}
      max={max}
      required={required}
      minLength={minLength}
      list={list}
    />
    {error && <span className="field-error">{error}</span>}
  </div>
);

export const AdminSelect = ({ label, value, onChange, onBlur, options, name, error, required }) => (
  <div className="admin-form-group">
    {label && <label htmlFor={name}>{label}</label>}
    <select 
      name={name}
      id={name}
      value={value} 
      onChange={onChange}
      onBlur={onBlur}
      className={`admin-form-control shadow-none${error ? ' is-invalid' : ''}`}
      required={required}
    >
      {options.map((opt, i) => (
        <option key={i} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <span className="field-error">{error}</span>}
  </div>
);

export const AdminTextarea = ({ label, value, onChange, onBlur, placeholder, rows = 4, name, error, required, minLength }) => {
  const textareaRef = useRef(null);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, []);

  // Auto-resize khi value thay đổi (bao gồm lần load đầu)
  useEffect(() => {
    autoResize();
  }, [value, autoResize]);

  const handleChange = (e) => {
    if (onChange) onChange(e);
    autoResize();
  };

  return (
    <div className="admin-form-group">
      {label && <label htmlFor={name}>{label}</label>}
      <textarea 
        ref={textareaRef}
        name={name}
        id={name}
        value={value} 
        onChange={handleChange}
        onBlur={onBlur}
        className={`admin-form-control shadow-none${error ? ' is-invalid' : ''}`}
        rows={rows} 
        placeholder={placeholder}
        required={required}
        minLength={minLength}
      ></textarea>
      {error && <span className="field-error">{error}</span>}
    </div>
  );
};
