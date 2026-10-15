import React from 'react';
import './Card.css';

/**
 * Reusable Card component for equipment, stats, and dashboard panels
 */
export function Card({
  children,
  className = '',
  hoverEffect = false,
  variant = 'surface', // 'surface' | 'elevated' | 'glass'
  onClick,
  ...props
}) {
  return (
    <div
      className={`aura-card aura-card--${variant} ${hoverEffect ? 'aura-card--hover' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
