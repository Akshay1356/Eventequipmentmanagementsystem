import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Shield, User, AlertCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('user@aura.com');
  const [password, setPassword] = useState('user123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const result = await login(identifier, password);
      setIsLoading(false);
      if (result && result.success) {
        if (result.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/my-bookings');
        }
      } else {
        setErrorMessage(result?.error || 'Invalid credentials.');
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Invalid credentials.');
    }
  };

  return (
    <div style={{ padding: '4rem 0', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '460px' }}>
        <Card variant="elevated" style={{ padding: '2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--color-accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', border: '1px solid var(--border-accent)' }}>
              <Lock size={22} />
            </div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>Account Sign In</h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              Log in to manage equipment orders or access admin controls.
            </p>
          </div>

          {errorMessage && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#F87171',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.25rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Input
              label="Username or Email"
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              leftIcon={<Mail size={16} />}
              placeholder="admin@aura.com or user@aura.com"
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={16} />}
              placeholder="admin123 or user123"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              style={{ marginTop: '0.5rem', width: '100%' }}
            >
              Sign In
            </Button>
          </form>

          {/* Hardcoded Login Credentials Showcase */}
          <div
            style={{
              marginTop: '1.75rem',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.775rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--color-accent-bright)' }}>
                Hardcoded Logins
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Click to auto-fill</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {/* Admin Card */}
              <div
                onClick={() => {
                  setIdentifier('admin@aura.com');
                  setPassword('admin123');
                  setErrorMessage('');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(124, 58, 237, 0.1)',
                  border: '1px solid rgba(167, 139, 250, 0.25)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Shield size={16} style={{ color: '#C4B5FD' }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFFFFF' }}>Admin (Sarah)</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
                      admin@aura.com &bull; admin123
                    </div>
                  </div>
                </div>
                <Button variant="secondary" size="sm" type="button" style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}>
                  Fill Admin
                </Button>
              </div>

              {/* User Card */}
              <div
                onClick={() => {
                  setIdentifier('user@aura.com');
                  setPassword('user123');
                  setErrorMessage('');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <User size={16} style={{ color: '#7DE7FF' }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFFFFF' }}>User (Alex)</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
                      user@aura.com &bull; user123
                    </div>
                  </div>
                </div>
                <Button variant="secondary" size="sm" type="button" style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}>
                  Fill User
                </Button>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Need an organizer account?{' '}
              <Link to="/register" style={{ color: 'var(--color-accent-bright)', fontWeight: 500 }}>
                Register here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default LoginPage;
