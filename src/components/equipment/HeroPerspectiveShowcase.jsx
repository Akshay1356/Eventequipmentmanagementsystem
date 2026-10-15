import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Share2,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Star
} from 'lucide-react';
import { FEATURED_EQUIPMENT } from '../../data/featuredEquipment';
import './HeroPerspectiveShowcase.css';

/**
 * HeroPerspectiveShowcase
 * Recreates the exact multi-layered 3D perspective composition with an orbiting 3D carousel:
 * - Orbiting 3D perspective card ring continuously gliding around behind the window
 * - Hover pause for comfortable inspection
 * - macOS-style dark browser/desktop window mockup in the center foreground
 * - Live interactive equipment depot preview inside the window
 */
export function HeroPerspectiveShowcase() {
  const [activeWindowTab, setActiveWindowTab] = useState('all');
  const [rotationAngle, setRotationAngle] = useState(0);
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(0);

  const [isReducedMotion, setIsReducedMotion] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const handler = (e) => setIsReducedMotion(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, []);

  const getResponsiveMetrics = (width) => {
    if (width >= 1600) return { radius: 1120, archDrop: 75 };
    if (width >= 1280) return { radius: 1020, archDrop: 68 };
    if (width >= 1024) return { radius: 880, archDrop: 58 };
    if (width >= 768) return { radius: 700, archDrop: 48 };
    if (width >= 480) return { radius: 540, archDrop: 38 };
    return { radius: 400, archDrop: 28 };
  };

  const [metrics, setMetrics] = useState(() => {
    if (typeof window !== 'undefined') {
      return getResponsiveMetrics(window.innerWidth);
    }
    return { radius: 1020, archDrop: 68 };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setMetrics(getResponsiveMetrics(window.innerWidth));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Continuous smooth 3D rotation animation loop (never stops on hover)
  useEffect(() => {
    if (isReducedMotion) return;

    const animate = (currentTime) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = currentTime;
      }
      const delta = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      if (document.visibilityState === 'visible') {
        // Continuous non-stop orbit: ~9 degrees per second
        setRotationAngle((prev) => (prev + delta * 0.009) % 360);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isReducedMotion]);

  // 24 cards forming the high-density 3D rotating convex perspective ring
  const backgroundCards = [
    {
      id: 'bg-card-1',
      type: 'photo',
      title: 'LINE ARRAY AUDIO',
      subtitle: 'L-Acoustics K2 System',
      tag: 'ARENA TOUR',
      imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'bg-card-2',
      type: 'photo',
      title: 'INTELLIGENT LIGHTING',
      subtitle: 'Robe MegaPointe Beams',
      tag: 'HYBRID SPOT',
      imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'bg-card-3',
      type: 'graphic-pink',
      title: 'CHECKOUTS QUICK N SIMPLE',
      subtitle: 'SQL RDBMS DISPATCH',
      detail: 'INSTANT CONTRACTS & DEPOSIT LOCKS',
    },
    {
      id: 'bg-card-4',
      type: 'graphic-rose',
      title: 'COLLECTION EXCLUSIVE!',
      subtitle: 'FESTIVAL RIDERS',
      detail: 'CALIBRATED TOURING INVENTORY',
    },
    {
      id: 'bg-card-5',
      type: 'photo',
      title: 'FESTIVAL DJ GEAR',
      subtitle: 'Pioneer DJM-A9 & CDJ-3000',
      tag: 'CLUB STANDARD',
      imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'bg-card-6',
      type: 'graphic-purple',
      title: '4K LED WALLS & TRUSS',
      subtitle: 'STAGE READY',
      detail: 'ROBUST 500x500MM MODULAR TILES',
    },
    {
      id: 'bg-card-7',
      type: 'photo',
      title: 'STAGE VOCAL MICS',
      subtitle: 'Shure Axient Digital Quad',
      tag: 'MISSION CRITICAL',
      imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'bg-card-8',
      type: 'graphic-cyan',
      title: 'TURNKEY STAGING',
      subtitle: 'AURA CERTIFIED',
      detail: 'ON-TIME DISPATCH GUARANTEED',
    },
    {
      id: 'bg-card-9',
      type: 'photo',
      title: 'CONCERT LASER FX',
      subtitle: 'Kvant Spectrum 30W RGB',
      tag: 'LASER AERIALS',
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'bg-card-10',
      type: 'graphic-amber',
      title: 'HERCULEAN SOUND',
      subtitle: '147 dB SPL MAX',
      detail: 'ZERO ACOUSTIC DISTORTION',
    },
    {
      id: 'bg-card-11',
      type: 'photo',
      title: 'DIGITAL CONSOLES',
      subtitle: 'Allen & Heath dLive S7000',
      tag: 'FOH MASTER',
      imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'bg-card-12',
      type: 'graphic-emerald',
      title: 'RAPID DISPATCH',
      subtitle: '24H LOAD-IN READY',
      detail: 'DEPOT CALIBRATED HARDWARE',
    },
    {
      id: 'bg-card-13',
      type: 'photo',
      title: 'STAGE ATMOSPHERICS',
      subtitle: 'MDG ATMe Haze Generators',
      tag: 'TOUR ATMOSPHERE',
      imageUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'bg-card-14',
      type: 'graphic-indigo',
      title: 'MODULAR RIGGING',
      subtitle: 'EUROTRUSS F34 SPANS',
      detail: 'CERTIFIED HEAVY LOAD HARDWARE',
    },
    {
      id: 'bg-card-15',
      type: 'photo',
      title: 'LIGHTING CONTROL',
      subtitle: 'MA Lighting grandMA3 Full',
      tag: 'PROGRAMMER CHOICE',
      imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'bg-card-16',
      type: 'graphic-pink',
      title: 'TRANSACTION AUDITING',
      subtitle: 'ACID DBMS INTEGRITY',
      detail: 'ZERO-CONFLICT SCHEDULING LOCKS',
    },
    {
      id: 'bg-card-17',
      type: 'photo',
      title: 'SUBWOOFER ARRAYS',
      subtitle: 'd&b audiotechnik J-INFRA',
      tag: 'SUB-BASS POWER',
      imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'bg-card-18',
      type: 'graphic-rose',
      title: 'TOUR PACKAGES',
      subtitle: 'VIP EVENT FLEETS',
      detail: 'TAILORED ROAD CASES & MULTICORES',
    },
    {
      id: 'bg-card-19',
      type: 'photo',
      title: 'PROFILE BEAMS',
      subtitle: 'Claypaky Sharpy Plus 330W',
      tag: 'OPTICAL PRECISION',
      imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'bg-card-20',
      type: 'graphic-purple',
      title: 'DMX NETWORKING',
      subtitle: 'SACN & ART-NET HUBS',
      detail: 'FAIL-SAFE OPTICAL FIBER SPINES',
    },
    {
      id: 'bg-card-21',
      type: 'photo',
      title: 'WIRELESS IEM MONITORING',
      subtitle: 'Sennheiser 2000 IEM Dual',
      tag: 'ZERO LATENCY',
      imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'bg-card-22',
      type: 'graphic-cyan',
      title: 'DEPOT HOT-SWAPS',
      subtitle: 'STANDBY SPARE POOL',
      detail: 'IMMEDIATE REPLACEMENT ASSURANCE',
    },
    {
      id: 'bg-card-23',
      type: 'photo',
      title: 'IMAG BROADCAST CAMERAS',
      subtitle: 'Blackmagic URSA Broadcast 4K',
      tag: 'LIVE PRODUCTION',
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'bg-card-24',
      type: 'graphic-amber',
      title: 'CLEAN POWER DISTRO',
      subtitle: '400A 3-PHASE CAMLOCKS',
      detail: 'GALVANIC ISOLATION TRANSFORMERS',
    },
  ];

  // Best reviewed items for the browser window preview
  const previewProducts = FEATURED_EQUIPMENT.slice(0, 3);

  return (
    <div className={`aura-hero-showcase ${isReducedMotion ? 'is-reduced-motion' : ''}`}>
      {/* ====================================================================
          1. 3D ORBITING PERSPECTIVE BACKGROUND CARDS (CONVEX DOME ARCH)
          ==================================================================== */}
      <div className="aura-showcase-stage" aria-hidden="true">
        <div className="aura-showcase-ring">
          {backgroundCards.map((card, index) => {
            const baseAngle = (360 / backgroundCards.length) * index;
            let currentAngle = isReducedMotion
              ? baseAngle
              : (baseAngle + rotationAngle) % 360;

            if (currentAngle > 180) currentAngle -= 360;
            if (currentAngle < -180) currentAngle += 360;

            const rad = (currentAngle * Math.PI) / 180;
            const cosVal = Math.cos(rad);

            // Convex 3D curve coordinates:
            // 1. Horizontal convex displacement & depth (center closest at Z=0, wings curve back)
            const x = metrics.radius * Math.sin(rad);
            const z = -metrics.radius * (1 - cosVal);

            // 2. Vertical convex arch (center elevated at Y=0, wings droop down smoothly)
            const y = metrics.archDrop * (1 - cosVal);

            // 3. Radial tilt tangent to the convex dome
            const rotZ = -(currentAngle / 90) * 6.5;

            // 4. Smooth opacity fading as cards pass behind
            const opacity = cosVal > -0.05
              ? Math.max(0, Math.min(1, (cosVal + 0.05) / 0.25))
              : 0;

            return (
              <div
                key={card.id}
                className="aura-bg-card"
                style={{
                  transform: `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${currentAngle.toFixed(1)}deg) rotateZ(${rotZ.toFixed(1)}deg)`,
                  opacity: opacity,
                  visibility: opacity <= 0 ? 'hidden' : 'visible',
                  pointerEvents: opacity > 0.6 ? 'auto' : 'none',
                }}
              >
                {card.type === 'photo' ? (
                  <div className="aura-bg-card__inner aura-bg-card__inner--photo">
                    <img src={card.imageUrl} alt="" className="aura-bg-card__img" loading="lazy" />
                    <div className="aura-bg-card__overlay" />
                    <div className="aura-bg-card__content">
                      <span className="aura-bg-card__tag">{card.tag}</span>
                      <h3 className="aura-bg-card__title">{card.title}</h3>
                      <p className="aura-bg-card__subtitle">{card.subtitle}</p>
                    </div>
                  </div>
                ) : (
                  <div className={`aura-bg-card__inner aura-bg-card__inner--${card.type}`}>
                    <div className="aura-bg-card__graphic-badge">AURA VERIFIED</div>
                    <h3 className="aura-bg-card__graphic-title">{card.title}</h3>
                    <div className="aura-bg-card__graphic-divider" />
                    <p className="aura-bg-card__graphic-sub">{card.subtitle}</p>
                    <span className="aura-bg-card__graphic-detail">{card.detail}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ====================================================================
          2. FOREGROUND BROWSER / DESKTOP WINDOW MOCKUP
          ==================================================================== */}
      <div className="aura-browser-window">
        {/* macOS Style Window Chrome Header */}
        <div className="aura-browser-header">
          {/* Traffic Lights */}
          <div className="aura-browser-traffic-lights" aria-hidden="true">
            <span className="aura-traffic-dot aura-traffic-dot--red" />
            <span className="aura-traffic-dot aura-traffic-dot--yellow" />
            <span className="aura-traffic-dot aura-traffic-dot--green" />
          </div>

          {/* Centered Address / Search Bar */}
          <div className="aura-browser-address-bar">
            <Search size={13} className="aura-browser-search-icon" />
            <span className="aura-browser-url-text">auraeventgear.com/depot — Live Concert & Event Inventory</span>
          </div>

          {/* Window Action Icons */}
          <div className="aura-browser-actions" aria-hidden="true">
            <button type="button" className="aura-browser-icon-btn" title="Share inventory">
              <Share2 size={13} />
            </button>
            <Link to="/equipment" className="aura-browser-icon-btn" title="Open full catalogue">
              <ExternalLink size={13} />
            </Link>
          </div>
        </div>

        {/* Window Interior Content */}
        <div className="aura-browser-content">
          {/* Sub Header / Brand row inside window */}
          <div className="aura-window-navbar">
            <div className="aura-window-logo">
              <span className="aura-window-logo-dot" />
              <strong>AURA DEPOT</strong>
              <span className="aura-window-logo-cat">STAGE PRODUCTION</span>
            </div>

            <div className="aura-window-nav-links">
              {['All Gear', 'Line Arrays', 'Moving Lights', 'LED Walls'].map((cat, idx) => (
                <button
                  key={cat}
                  type="button"
                  className={`aura-window-nav-btn ${activeWindowTab === (idx === 0 ? 'all' : cat) ? 'is-active' : ''}`}
                  onClick={() => setActiveWindowTab(idx === 0 ? 'all' : cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="aura-window-status-pill">
              <ShieldCheck size={12} />
              <span>SQL RDBMS Sync</span>
            </div>
          </div>

          {/* Hero Banner inside Window */}
          <div className="aura-window-hero">
            <div className="aura-window-hero__bg">
              <img
                src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80"
                alt="Concert stage equipment setup"
                className="aura-window-hero__img"
              />
              <div className="aura-window-hero__scrim" />
            </div>

            <div className="aura-window-hero__info">
              <span className="aura-window-hero__eyebrow">JUST ADDED TO FLEET</span>
              <h2 className="aura-window-hero__heading">
                Let your event sound & light be legendary.
              </h2>
              <p className="aura-window-hero__desc">
                Tour-grade acoustic line arrays, 470W hybrid beam lighting, and high-refresh 4K modular video walls.
              </p>
              <Link to="/equipment" className="aura-window-hero__cta">
                <span>EXPLORE TODAY</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Product Showcase Row inside Window */}
          <div className="aura-window-products-section">
            <div className="aura-window-products-header">
              <h4 className="aura-window-products-title">Best reviewed gear</h4>
              <Link to="/equipment" className="aura-window-products-more">
                SEE MORE &rarr;
              </Link>
            </div>

            <div className="aura-window-products-grid">
              {previewProducts.map((item) => (
                <Link
                  key={item.id}
                  to={`/equipment/${item.id}`}
                  className="aura-window-product-card"
                >
                  <div className="aura-window-product-media">
                    <img src={item.imageUrl} alt={item.name} loading="lazy" />
                    <span className="aura-window-product-badge">{item.category}</span>
                  </div>
                  <div className="aura-window-product-info">
                    <div className="aura-window-product-rating">
                      <Star size={11} fill="#FBBF24" color="#FBBF24" />
                      <Star size={11} fill="#FBBF24" color="#FBBF24" />
                      <Star size={11} fill="#FBBF24" color="#FBBF24" />
                      <Star size={11} fill="#FBBF24" color="#FBBF24" />
                      <Star size={11} fill="#FBBF24" color="#FBBF24" />
                      <span>5.0</span>
                    </div>
                    <h5 className="aura-window-product-name">{item.name}</h5>
                    <div className="aura-window-product-footer">
                      <span className="aura-window-product-rate">${item.dailyRate}/day</span>
                      <span className="aura-window-product-btn">Reserve</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroPerspectiveShowcase;
