import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Shield, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import './Header.css';

export function Header() {
  const { currentUser, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const mobileNavRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  // Handle escape key to close menus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
          menuButtonRef.current?.focus();
        }
        if (userDropdownOpen) {
          setUserDropdownOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen, userDropdownOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <header className="aura-header">
      <div className="container aura-header__container">
        {/* Brand Wordmark & Abstract Stage/Soundwave Mark */}
        <Link to="/" className="aura-brand" aria-label="AURA Event Gear Home" onClick={handleLinkClick}>
          <div className="aura-brand__mark">
            <span className="aura-brand__wave aura-brand__wave--1" />
            <span className="aura-brand__wave aura-brand__wave--2" />
            <span className="aura-brand__wave aura-brand__wave--3" />
            <span className="aura-brand__wave aura-brand__wave--4" />
          </div>
          <div className="aura-brand__text">
            <span className="aura-brand__title">AURA</span>
            <span className="aura-brand__subtitle">EVENT GEAR</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="aura-nav aura-nav--desktop" aria-label="Main Navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `aura-nav__link ${isActive ? 'is-active' : ''}`}
            onClick={handleLinkClick}
          >
            Home
          </NavLink>
          <NavLink
            to="/equipment"
            className={({ isActive }) => `aura-nav__link ${isActive ? 'is-active' : ''}`}
            onClick={handleLinkClick}
          >
            Equipment
          </NavLink>
          <NavLink
            to="/my-bookings"
            className={({ isActive }) => `aura-nav__link ${isActive ? 'is-active' : ''}`}
            onClick={handleLinkClick}
          >
            My Bookings
          </NavLink>
          <a href="#how-it-works" className="aura-nav__link" onClick={handleLinkClick}>
            How It Works
          </a>

          {/* Admin Navigation link if authorized */}
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `aura-nav__link aura-nav__link--admin ${isActive ? 'is-active' : ''}`}
              onClick={handleLinkClick}
            >
              <Shield size={14} />
              <span>Admin Portal</span>
            </NavLink>
          )}
        </nav>

        {/* Action Controls & Demo Role Switcher */}
        <div className="aura-header__actions">
          {/* Glowing CTA Button matching reference image */}
          <Link to="/equipment" className="aura-header__cta-glow" onClick={handleLinkClick}>
            Reserve Gear
          </Link>

          {isAuthenticated ? (
            <div className="aura-user-menu" ref={dropdownRef}>
              <button
                type="button"
                className="aura-user-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-expanded={userDropdownOpen}
                aria-haspopup="true"
                aria-label="User account menu"
              >
                <div className="aura-avatar">
                  {isAdmin ? <Shield size={15} /> : <User size={15} />}
                </div>
                <span className="aura-user-name">{currentUser.name.split(' ')[0]}</span>
                <ChevronDown size={14} className={`aura-chevron ${userDropdownOpen ? 'is-open' : ''}`} />
              </button>

              {userDropdownOpen && (
                <div className="aura-dropdown">
                  <div className="aura-dropdown__header">
                    <p className="aura-dropdown__user-name">{currentUser.name}</p>
                    <p className="aura-dropdown__user-email">{currentUser.email}</p>
                    <span className={`aura-dropdown__role-tag ${isAdmin ? 'is-admin' : ''}`}>
                      {isAdmin ? 'System Administrator' : 'Event Organizer'}
                    </span>
                  </div>
                  <div className="aura-dropdown__divider" />
                  <Link to="/my-bookings" className="aura-dropdown__item" onClick={handleLinkClick}>
                    My Reservations
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="aura-dropdown__item aura-dropdown__item--admin" onClick={handleLinkClick}>
                      <Shield size={14} />
                      Inventory & Bookings Manager
                    </Link>
                  )}
                  <div className="aura-dropdown__divider" />
                  <button
                    type="button"
                    className="aura-dropdown__item aura-dropdown__item--danger"
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                      navigate('/');
                    }}
                  >
                    <LogOut size={14} />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="aura-auth-links">
              <Button variant="tertiary" size="sm" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                Register
              </Button>
            </div>
          )}

          {/* Accessible Mobile Menu Toggle */}
          <button
            ref={menuButtonRef}
            type="button"
            className="aura-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="aura-mobile-nav"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Accessible Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="aura-mobile-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div
            id="aura-mobile-nav"
            ref={mobileNavRef}
            className="aura-mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aura-mobile-drawer__header">
              <div className="aura-brand">
                <span className="aura-brand__title">AURA</span>
              </div>
              <button
                type="button"
                className="aura-mobile-close"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="aura-mobile-nav">
              <NavLink to="/" end className="aura-mobile-link" onClick={handleLinkClick}>
                Home
              </NavLink>
              <NavLink to="/equipment" className="aura-mobile-link" onClick={handleLinkClick}>
                Equipment Catalogue
              </NavLink>
              <NavLink to="/my-bookings" className="aura-mobile-link" onClick={handleLinkClick}>
                My Bookings
              </NavLink>
              <a href="#how-it-works" className="aura-mobile-link" onClick={handleLinkClick}>
                How It Works
              </a>

              {isAdmin && (
                <NavLink
                  to="/admin"
                  className="aura-mobile-link aura-mobile-link--admin"
                  onClick={handleLinkClick}
                >
                  <Shield size={16} />
                  <span>Admin Portal</span>
                </NavLink>
              )}
            </nav>

            <div className="aura-mobile-footer">
              {!isAuthenticated ? (
                <div className="aura-mobile-auth">
                  <Button variant="secondary" onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}>
                    Sign In
                  </Button>
                  <Button variant="primary" onClick={() => { setMobileMenuOpen(false); navigate('/register'); }}>
                    Register
                  </Button>
                </div>
              ) : (
                <Button variant="destructive" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                  Log Out ({currentUser.name.split(' ')[0]})
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
