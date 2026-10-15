import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div style={{ padding: '6rem 0', textAlign: 'center' }}>
      <div className="container" style={{ maxWidth: '520px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--color-accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', border: '1px solid var(--border-accent)' }}>
          <Compass size={32} />
        </div>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-accent-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>404 Error</span>
        <h1 style={{ fontSize: '2.25rem', marginTop: '0.5rem', marginBottom: '0.75rem' }}>Page Not Found</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
          The event equipment route or page you are looking for does not exist or has been relocated.
        </p>
        <Link to="/">
          <Button variant="primary" leftIcon={<ArrowLeft size={16} />}>
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
