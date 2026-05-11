import React from 'react';

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
      onClick={(e) => {
        if (type === 'date' || type === 'datetime-local') {
          try { e.target.showPicker(); } catch (err) {}
        }
      }}
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

export const AdminTextarea = ({ label, value, onChange, onBlur, placeholder, rows = 4, name, error, required, minLength }) => (
  <div className="admin-form-group">
    {label && <label htmlFor={name}>{label}</label>}
    <textarea 
      name={name}
      id={name}
      value={value} 
      onChange={onChange}
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

/**
 * A specialized input for currency/prices with automatic thousand separators.
 * Manages a raw number value but displays with dots.
 */
export const AdminCurrencyInput = ({ label, value, onChange, name, placeholder, required, noMargin = false }) => {
  
  // Format raw number or string to "1.000.000"
  const formatDisplay = (val) => {
    if (val === '' || val === null || val === undefined) return '';
    const numStr = val.toString().replace(/\D/g, '');
    if (numStr === '') return '';
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const [displayValue, setDisplayValue] = React.useState(formatDisplay(value));

  // Sync internal state when external value changes (e.g. from API load)
  React.useEffect(() => {
    setDisplayValue(formatDisplay(value));
  }, [value]);

  const handleTextChange = (e) => {
    const rawInput = e.target.value;
    const numericString = rawInput.replace(/\D/g, '');
    setDisplayValue(formatDisplay(numericString));
    
    onChange({
      target: {
        name,
        value: numericString ? parseInt(numericString, 10) : '',
        type: 'number'
      }
    });
  };

  return (
    <div className={`${noMargin ? '' : 'admin-form-group'} currency-input-wrapper`}>
      {label && <label htmlFor={name}>{label}</label>}
      <div className="position-relative">
        <input 
          type="text" 
          name={name} 
          id={name}
          value={displayValue} 
          onChange={handleTextChange}
          className="admin-form-control shadow-none"
          placeholder={placeholder}
          required={required}
          autoComplete="off"
        />
      </div>
    </div>
  );
};

