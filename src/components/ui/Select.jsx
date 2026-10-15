import React from 'react';
import { ChevronDown } from 'lucide-react';
import './Input.css';

/**
 * Reusable Select Dropdown Component
 */
export const Select = React.forwardRef(function Select(
  {
    id,
    label,
    options = [],
    error = '',
    helperText = '',
    className = '',
    required = false,
    disabled = false,
    placeholder = 'Select an option',
    value,
    onChange,
    ...props
  },
  ref
) {
  const generatedId = React.useId();
  const selectId = id || generatedId;

  return (
    <div className={`aura-input-group ${error ? 'has-error' : ''} ${disabled ? 'is-disabled' : ''} ${className}`}>
      {label && (
        <label htmlFor={selectId} className="aura-input-label">
          {label}
          {required && <span className="aura-input-required" aria-hidden="true">*</span>}
        </label>
      )}

      <div className="aura-input-wrapper">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          required={required}
          value={value}
          onChange={onChange}
          className="aura-input has-right-icon"
          style={{ appearance: 'none', cursor: 'pointer' }}
          {...props}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} style={{ background: '#0A111D', color: '#FFF' }}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="aura-input-icon aura-input-icon--right" style={{ pointerEvents: 'none' }}>
          <ChevronDown size={16} />
        </span>
      </div>

      {error ? (
        <p className="aura-input-feedback aura-input-feedback--error" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p className="aura-input-feedback aura-input-feedback--helper">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

export default Select;
