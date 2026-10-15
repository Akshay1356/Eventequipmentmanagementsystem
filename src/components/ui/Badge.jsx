import React from 'react';
import './Badge.css';

/**
 * Reusable Status Badge Component
 * Variant: 'pending' | 'confirmed' | 'cancelled' | 'rejected' | 'completed' | 'available' | 'maintenance' | 'default'
 */
export function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = true,
  className = '',
}) {
  return (
    <span className={`aura-badge aura-badge--${variant} aura-badge--${size} ${className}`}>
      {dot && <span className="aura-badge__dot" aria-hidden="true" />}
      <span className="aura-badge__label">{children}</span>
    </span>
  );
}

export default Badge;
