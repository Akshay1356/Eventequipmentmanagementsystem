import React from 'react';
import { Loader2 } from 'lucide-react';

export function Spinner({ size = 28, text = 'Loading...', className = '' }) {
  return (
    <div
      className={`aura-spinner-container ${className}`}
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        padding: '2rem',
        color: 'var(--color-text-secondary)',
      }}
    >
      <Loader2
        size={size}
        style={{
          color: 'var(--color-accent-primary)',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      {text && <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{text}</span>}
      <span className="sr-only">Loading content</span>
    </div>
  );
}

export default Spinner;
