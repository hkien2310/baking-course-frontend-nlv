import React from 'react';

const Input = ({ 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  wrapperClassName = '', 
  inputClassName = '',
  style = {}, 
  onKeyDown,
  icon,
  onIconClick,
  id,
  name,
  min,
  max,
  label,
  required,
  ...rest
}) => {
  return (
    <div className={`form-group position-relative ${wrapperClassName}`} style={{ marginBottom: 0 }}>
      {label && (
        <label htmlFor={id} className="mb-2 d-block">
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      <input 
        type={type} 
        id={id}
        name={name}
        className={`form-control ${inputClassName}`} 
        placeholder={placeholder} 
        value={value} 
        onChange={onChange} 
        onKeyDown={onKeyDown}
        min={min}
        max={max}
        style={{ 
          borderRadius: '5px', 
          paddingLeft: icon ? '20px' : '15px',
          ...style 
        }}
        {...rest}
      />
      {icon && (
        <button 
          type="button" 
          onClick={onIconClick} 
          style={{ 
            position: 'absolute', 
            right: '15px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            background: 'none', 
            border: 'none', 
            color: '#fc834b',
            cursor: onIconClick ? 'pointer' : 'default',
            padding: 0,
            outline: 'none'
          }}
        >
          <i className={`fa fa-${icon}`}></i>
        </button>
      )}
    </div>
  );
};

export default Input;
