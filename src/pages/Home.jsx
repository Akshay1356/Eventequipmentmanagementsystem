import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  Wrench,
  Calendar,
  Layers,
  Radio,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import HeroPerspectiveShowcase from '../components/equipment/HeroPerspectiveShowcase';
import {
  FEATURED_EQUIPMENT,
  PRODUCTION_STATS,
  EVENT_CATEGORIES
} from '../data/featuredEquipment';
import './Home.css';

export function Home() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [imageErrors, setImageErrors] = useState({});

  const filteredItems = activeCategory === 'all'
    ? FEATURED_EQUIPMENT
    : FEATURED_EQUIPMENT.filter((item) => item.category === activeCategory);

  const handleImageError = (id) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="aura-home">
      {/* Subtle Atmospheric Ambient Lighting & Space Starfield */}
      <div className="aura-home__ambient-light" aria-hidden="true" />
      <div className="aura-starfield" aria-hidden="true" />

      {/* ==========================================================================
          1. HERO SECTION (Matching Design Reference)
          ========================================================================== */}
      <section className="aura-hero" aria-labelledby="hero-heading">
        <div className="container">
          {/* Large Punchy All-Caps Editorial Headline */}
          <h1 id="hero-heading" className="aura-hero__title">
            STREAMLINE THE EVENT<br />PROCESS
          </h1>

          {/* Supporting Copy */}
          <p className="aura-hero__subtitle">
            <strong>Restructuring equipment logistics / Event audiovisuals</strong> orchestrated with checkouts, performance, a sustainable expansion.
          </p>

          {/* Glowing Neon Pill CTA Button */}
          <div className="aura-hero__cta-wrapper">
            <Link to="/equipment" className="aura-hero__glow-btn">
              See prices
            </Link>
          </div>

        </div>

        {/* Multi-layered 3D Perspective Arc + Foreground Desktop Window Showcase (Full Viewport Width) */}
        <div className="aura-hero__showcase-wrapper aura-hero__showcase-wrapper--fullwidth">
          <HeroPerspectiveShowcase />
        </div>
      </section>

      {/* ==========================================================================
          2. PRODUCTION STATS BANNER
          ========================================================================== */}
      <section className="aura-stats-banner" aria-label="Production Performance Metrics">
        <div className="container">
          <div className="aura-stats-grid">
            {PRODUCTION_STATS.map((stat, idx) => (
              <div key={idx} className="aura-stat-card">
                <div className="aura-stat-value">
                  <AnimatedCounter
                    target={stat.target}
                    suffix={stat.suffix}
                    decimals={stat.decimals}
                  />
                </div>
                <div className="aura-stat-label">{stat.label}</div>
                <div className="aura-stat-detail">{stat.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================================================
          3. FEATURED EQUIPMENT CATALOGUE PREVIEW
          ========================================================================== */}
      <section className="aura-featured-section" style={{ padding: '4rem 0' }}>
        <div className="container">
          <div className="aura-section-header">
            <div className="aura-section-eyebrow">
              <Zap size={14} />
              <span>Production Inventory</span>
            </div>
            <h2 className="aura-section-title">Stage-Ready Event Hardware</h2>
            <p className="aura-section-desc">
              Explore touring-standard gear trusted by festivals, corporate keynotes, and arena productions worldwide.
            </p>
          </div>

          {/* Interactive Category Filter Chips */}
          <div className="aura-category-chips" role="tablist" aria-label="Filter equipment by category">
            {EVENT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={activeCategory === cat.id}
                className={`aura-category-chip ${activeCategory === cat.id ? 'is-active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Filtered Equipment Grid */}
          <div className="aura-equipment-grid">
            {filteredItems.map((item) => (
              <article key={item.id} className="aura-eq-card">
                {/* Card Media with Fallback */}
                <div className="aura-eq-card__media">
                  {!imageErrors[item.id] ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="aura-eq-card__img"
                      loading="lazy"
                      onError={() => handleImageError(item.id)}
                    />
                  ) : (
                    <div className="aura-eq-card__fallback">
                      <Radio size={28} />
                      <span>{item.name}</span>
                    </div>
                  )}
                  <div className="aura-eq-card__overlay" />

                  <div className="aura-eq-card__badges">
                    <span className="aura-eq-card__cat-badge">{item.category}</span>
                    <Badge variant={item.status} size="sm">{item.status}</Badge>
                  </div>
                </div>

                {/* Card Body */}
                <div className="aura-eq-card__body">
                  <h3 className="aura-eq-card__title">{item.name}</h3>
                  <div className="aura-eq-card__subtitle">{item.subtitle}</div>
                  <p className="aura-eq-card__desc">{item.description}</p>

                  {/* Specs Chips */}
                  <div className="aura-eq-card__specs">
                    {item.specs.map((spec, i) => (
                      <span key={i} className="aura-eq-card__spec">{spec}</span>
                    ))}
                  </div>

                  {/* Card Footer & Actions */}
                  <div className="aura-eq-card__footer">
                    <div className="aura-eq-card__price-box">
                      <span className="aura-eq-card__rate">${item.dailyRate}</span>
                      <span className="aura-eq-card__unit">{item.unit}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link to={`/equipment/${item.id}`}>
                        <Button variant="outline" size="sm">
                          Specs
                        </Button>
                      </Link>
                      <Link to={`/book/${item.id}`}>
                        <Button variant="primary" size="sm" rightIcon={<ArrowUpRight size={14} />}>
                          Reserve
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link to="/equipment">
              <Button variant="secondary" size="lg" rightIcon={<ArrowRight size={18} />}>
                View Complete Catalogue (48+ Items)
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          4. PRODUCTION PILLARS / WHY AURA
          ========================================================================== */}
      <section className="aura-pillars-section">
        <div className="container">
          <div className="aura-section-header">
            <div className="aura-section-eyebrow">
              <ShieldCheck size={14} />
              <span>Production Standards</span>
            </div>
            <h2 className="aura-section-title">Built for Mission-Critical Events</h2>
            <p className="aura-section-desc">
              When there are no second takes, your production infrastructure must be flawless.
            </p>
          </div>

          <div className="aura-pillars-grid">
            <Card variant="elevated" className="aura-pillar-card">
              <div className="aura-pillar-icon-box">
                <Wrench size={22} />
              </div>
              <h3 className="aura-pillar-title">Bench-Tested Reliability</h3>
              <p className="aura-pillar-desc">
                Every line array amplifier, optical DMX node, and moving head passes a comprehensive diagnostic check before leaving the depot.
              </p>
            </Card>

            <Card variant="elevated" className="aura-pillar-card">
              <div className="aura-pillar-icon-box">
                <Clock size={22} />
              </div>
              <h3 className="aura-pillar-title">Flexible Rental Periods</h3>
              <p className="aura-pillar-desc">
                Whether you need equipment for a single evening keynote or a three-week national festival tour, our rates scale transparently.
              </p>
            </Card>

            <Card variant="elevated" className="aura-pillar-card">
              <div className="aura-pillar-icon-box">
                <Layers size={22} />
              </div>
              <h3 className="aura-pillar-title">Turnkey Production Packages</h3>
              <p className="aura-pillar-desc">
                Complete matched packages containing power distribution, cabling, rigging hardware, and road cases ready for immediate venue load-in.
              </p>
            </Card>

            <Card variant="elevated" className="aura-pillar-card">
              <div className="aura-pillar-icon-box">
                <Calendar size={22} />
              </div>
              <h3 className="aura-pillar-title">Relational Inventory Accuracy</h3>
              <p className="aura-pillar-desc">
                Designed to integrate directly with our SQL database schema to prevent double-bookings, verify stock levels, and automate dispatch manifests.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          5. HOW IT WORKS WORKFLOW
          ========================================================================== */}
      <section id="how-it-works" className="aura-steps-section">
        <div className="container">
          <div className="aura-section-header">
            <div className="aura-section-eyebrow">
              <Sparkles size={14} />
              <span>Simple 4-Step Process</span>
            </div>
            <h2 className="aura-section-title">How To Rent With AURA</h2>
            <p className="aura-section-desc">
              From discovering the ideal sound profile to live show breakdown, we make equipment logistics effortless.
            </p>
          </div>

          <div className="aura-steps-grid">
            <Card variant="surface" className="aura-step-card">
              <div className="aura-step-number">01</div>
              <h3 className="aura-step-title">Explore & Select Gear</h3>
              <p className="aura-step-desc">
                Browse our verified catalogue of professional sound, lighting, LED walls, and staging systems by technical specification.
              </p>
            </Card>

            <Card variant="surface" className="aura-step-card">
              <div className="aura-step-number">02</div>
              <h3 className="aura-step-title">Specify Event Dates</h3>
              <p className="aura-step-desc">
                Input your event rehearsal, show day, and breakdown schedule. The live estimator calculates your duration and volume pricing.
              </p>
            </Card>

            <Card variant="surface" className="aura-step-card">
              <div className="aura-step-number">03</div>
              <h3 className="aura-step-title">Place Reservation Hold</h3>
              <p className="aura-step-desc">
                Submit your booking with venue details. Our operations team verifies schedule feasibility and confirms inventory allocation.
              </p>
            </Card>

            <Card variant="surface" className="aura-step-card">
              <div className="aura-step-number">04</div>
              <h3 className="aura-step-title">Dispatch & Show Execution</h3>
              <p className="aura-step-desc">
                Pick up from our central logistics hub or arrange on-site venue delivery with optional technical setup by certified engineers.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          6. CALL TO ACTION BANNER
          ========================================================================== */}
      <section className="aura-cta-banner">
        <div className="container">
          <div className="aura-cta-card">
            <h2 className="aura-cta-title">Ready to Power Your Next Stage?</h2>
            <p className="aura-cta-desc">
              Join hundreds of festival organizers, corporate production directors, and touring artists who rely on AURA equipment.
            </p>
            <div className="aura-cta-buttons">
              <Link to="/equipment">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
                  Explore Equipment Catalogue
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="secondary" size="lg">
                  Create Organizer Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
