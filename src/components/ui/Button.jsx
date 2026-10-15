import React from 'react';
import { Loader2 } from 'lucide-react';
import './Button.css';

/**
 * Reusable Button Component adhering to the AURA design system.
 * Supports primary, secondary, tertiary (ghost), and destructive variants.
 * Handles loading spinner, disabled states, and optional icons.
 */
export const Button = React.forwardRef(function Button(
  {
    children,
    variant = 'primary', // 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'outline'
    size = 'md',        // 'sm' | 'md' | 'lg'
    isLoading = false,
    disabled = false,
    leftIcon = null,
    rightIcon = null,
    className = '',
    type = 'button',
    onClick,
    ...props
  },
  ref
) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`aura-btn aura-btn--${variant} aura-btn--${size} ${isLoading ? 'is-loading' : ''} ${className}`}
      {...props}
    >
      {/* Internal subtle cyan light gradient overlay */}
      <span className="aura-btn__sheen" aria-hidden="true" />
      
      <span className="aura-btn__content">
        {isLoading ? (
          <Loader2 className="aura-btn__spinner" size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
        ) : (
          leftIcon && <span className="aura-btn__icon aura-btn__icon--left">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="aura-btn__icon aura-btn__icon--right">{rightIcon}</span>
        )}
      </span>
    </button>
  );
});

export default Button;
