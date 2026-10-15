import React from 'react';
import { PackageOpen } from 'lucide-react';
import Button from './Button';

/**
 * Reusable EmptyState component for search, bookings, and inventory
 */
export function EmptyState({
  icon: Icon = PackageOpen,
  title = 'No items found',
  description = 'Try adjusting your search filters or dates to find available equipment.',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`aura-empty-state ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3.5rem 1.5rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--border-medium)',
        background: 'rgba(10, 17, 29, 0.4)',
        maxWidth: '540px',
        margin: '2rem auto',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(56, 189, 248, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-accent-primary)',
          marginBottom: '1.25rem',
          border: '1px solid var(--border-accent)',
        }}
      >
        <Icon size={26} />
      </div>

      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#FFF' }}>{title}</h3>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.925rem', marginBottom: actionLabel ? '1.5rem' : 0, maxWidth: '400px' }}>
        {description}
      </p>

      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
