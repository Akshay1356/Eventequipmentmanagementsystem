import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Building } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';

export function RegisterPage() {
  const { loginAs } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: 'Jordan Miller',
    email: 'jordan@soundlightpro.com',
    company: 'Sound & Light Production Co.',
    password: 'securePassword123',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      loginAs('customer');
      navigate('/equipment');
    }, 600);
  };

  return (
    <div style={{ padding: '4rem 0', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        <Card variant="elevated" style={{ padding: '2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--color-accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', border: '1px solid var(--border-accent)' }}>
              <User size={22} />
            </div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>Create Account</h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              Register to book audiovisual and event production equipment.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <Input
              label="Full Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              leftIcon={<User size={16} />}
            />

            <Input
              label="Organization / Company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              leftIcon={<Building size={16} />}
              helperText="Agency, event production firm, or independent producer"
            />

            <Input
              label="Work Email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              leftIcon={<Mail size={16} />}
            />

            <Input
              label="Password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              leftIcon={<Lock size={16} />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              style={{ marginTop: '0.5rem', width: '100%' }}
            >
              Create Account
            </Button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Already registered?{' '}
              <Link to="/login" style={{ color: 'var(--color-accent-bright)', fontWeight: 500 }}>
                Sign in here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default RegisterPage;
