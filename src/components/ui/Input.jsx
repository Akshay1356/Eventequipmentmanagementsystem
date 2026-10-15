import React from 'react';
import './Input.css';

/**
 * Reusable Accessible Input Component
 */
export const Input = React.forwardRef(function Input(
  {
    id,
    label,
    type = 'text',
    error = '',
    helperText = '',
    leftIcon = null,
    rightIcon = null,
    className = '',
    required = false,
    disabled = false,
    ...props
  },
  ref
) {
  const generatedId = React.useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div className={`aura-input-group ${error ? 'has-error' : ''} ${disabled ? 'is-disabled' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="aura-input-label">
          {label}
          {required && <span className="aura-input-required" aria-hidden="true">*</span>}
        </label>
      )}

      <div className="aura-input-wrapper">
        {leftIcon && <span className="aura-input-icon aura-input-icon--left">{leftIcon}</span>}
        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`aura-input ${leftIcon ? 'has-left-icon' : ''} ${rightIcon ? 'has-right-icon' : ''}`}
          {...props}
        />
        {rightIcon && <span className="aura-input-icon aura-input-icon--right">{rightIcon}</span>}
      </div>

      {error ? (
        <p id={errorId} className="aura-input-feedback aura-input-feedback--error" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="aura-input-feedback aura-input-feedback--helper">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

export default Input;
