import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Database, Radio, Disc3, Film, Layers } from 'lucide-react';
import './Footer.css';

export function Footer() {
  return (
    <footer className="aura-footer">
      <div className="container aura-footer__container">
        {/* Brand & Academic Disclaimer */}
        <div className="aura-footer__col aura-footer__col--brand">
          <Link to="/" className="aura-brand">
            <div className="aura-brand__mark">
              <span className="aura-brand__wave aura-brand__wave--1" />
              <span className="aura-brand__wave aura-brand__wave--2" />
              <span className="aura-brand__wave aura-brand__wave--3" />
            </div>
            <div className="aura-brand__text">
              <span className="aura-brand__title">AURA</span>
              <span className="aura-brand__subtitle">EVENT GEAR</span>
            </div>
          </Link>
          <p className="aura-footer__about">
            Professional audiovisual, stage lighting, DJ setups, LED video walls, and event production rentals for concerts, galas, conferences, and tours.
          </p>

          <div className="aura-dbms-badge">
            <Database size={15} className="aura-dbms-badge__icon" />
            <div className="aura-dbms-badge__content">
              <strong>College DBMS Project</strong>
              <span>Frontend Prototype • API Contract Ready</span>
            </div>
          </div>
        </div>

        {/* Equipment Categories */}
        <div className="aura-footer__col">
          <h4 className="aura-footer__heading">Equipment Categories</h4>
          <ul className="aura-footer__links">
            <li><Link to="/equipment?category=audio"><Radio size={14} /> Professional Audio</Link></li>
            <li><Link to="/equipment?category=lighting"><Sparkles size={14} /> Stage & FX Lighting</Link></li>
            <li><Link to="/equipment?category=projection"><Film size={14} /> Video Walls & Displays</Link></li>
            <li><Link to="/equipment?category=stage"><Layers size={14} /> Stage & Trussing</Link></li>
            <li><Link to="/equipment?category=dj"><Disc3 size={14} /> DJ & Mixing Consoles</Link></li>
          </ul>
        </div>

        {/* Navigation & Portals */}
        <div className="aura-footer__col">
          <h4 className="aura-footer__heading">Quick Navigation</h4>
          <ul className="aura-footer__links">
            <li><Link to="/">Home Showcase</Link></li>
            <li><Link to="/equipment">Full Equipment Catalogue</Link></li>
            <li><Link to="/my-bookings">Customer Bookings Portal</Link></li>
            <li><Link to="/admin"><Shield size={14} /> Admin Inventory Dashboard</Link></li>
            <li><a href="#how-it-works">How It Works</a></li>
          </ul>
        </div>

        {/* Backend Contract Status */}
        <div className="aura-footer__col">
          <h4 className="aura-footer__heading">System Architecture</h4>
          <div className="aura-footer__arch-card">
            <div className="aura-footer__arch-row">
              <span className="aura-footer__arch-label">Client Layer:</span>
              <span className="aura-footer__arch-val">React + Vite SPA</span>
            </div>
            <div className="aura-footer__arch-row">
              <span className="aura-footer__arch-label">API Gateway:</span>
              <span className="aura-footer__arch-val">RESTful Services</span>
            </div>
            <div className="aura-footer__arch-row">
              <span className="aura-footer__arch-label">Database:</span>
              <span className="aura-footer__arch-val">Relational SQL / RDBMS</span>
            </div>
            <div className="aura-footer__arch-row">
              <span className="aura-footer__arch-label">Current State:</span>
              <span className="aura-footer__arch-val aura-footer__arch-val--mock">Mock Service Layer Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="aura-footer__bottom">
        <div className="container aura-footer__bottom-inner">
          <p>© 2026 AURA Event Gear. College Database Management Systems (DBMS) Laboratory Project.</p>
          <div className="aura-footer__status-indicator">
            <span className="aura-status-dot" />
            <span>Frontend Architecture Online</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
