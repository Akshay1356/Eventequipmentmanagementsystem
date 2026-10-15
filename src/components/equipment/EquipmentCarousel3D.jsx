import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Radio, Sparkles, Disc3, Film, ArrowUpRight } from 'lucide-react';
import Badge from '../ui/Badge';
import './EquipmentCarousel3D.css';

/**
 * Premium 3D Equipment Perspective Ring Showcase
 * Features:
 * - Continuous smooth rotation using requestAnimationFrame
 * - Visibility API pause (pauses when tab is hidden)
 * - Hover pause for comfortable inspection
 * - prefers-reduced-motion static fallback
 * - Full image load error fallback to prevent broken UI
 * - Pointer-events passthrough on decorative containers
 */
export function EquipmentCarousel3D({ items = [] }) {
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });
  const [failedImages, setFailedImages] = useState({});
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(0);

  // Check reduced motion listener
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const listener = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Continuous animation loop
  useEffect(() => {
    if (prefersReducedMotion) return;

    const animate = (currentTime) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = currentTime;
      }
      const delta = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      if (!isPaused && document.visibilityState === 'visible') {
        // Smooth rotation: ~10 degrees per second
        setRotationAngle((prev) => (prev + (delta * 0.012)) % 360);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPaused, prefersReducedMotion]);

  const handleImageError = (id) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Audio': return <Radio size={13} />;
      case 'Lighting': return <Sparkles size={13} />;
      case 'DJ Gear': return <Disc3 size={13} />;
      case 'Video & LED': return <Film size={13} />;
      default: return <Radio size={13} />;
    }
  };

  const totalCards = items.length;
  // Calculate dynamic radius based on card count to keep spacing balanced
  const radius = Math.max(340, Math.round(180 / Math.tan(Math.PI / Math.max(totalCards, 6))));

  return (
    <div
      className={`aura-carousel3d ${prefersReducedMotion ? 'is-reduced-motion' : ''}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="3D Event Equipment Interactive Carousel"
    >
      <div className="aura-carousel3d__stage">
        <div
          className="aura-carousel3d__ring"
          style={{
            transform: prefersReducedMotion
              ? 'translateZ(-100px)'
              : `translateZ(-${radius}px) rotateY(${-rotationAngle}deg)`,
          }}
        >
          {items.map((item, index) => {
            const cardAngle = (360 / totalCards) * index;
            // Angle relative to viewer
            const relativeAngle = ((cardAngle - rotationAngle) % 360 + 360) % 360;
            // Cards behind viewing angle (between 95° and 265°) have lowered opacity
            const isBackside = relativeAngle > 95 && relativeAngle < 265;
            const isCenterFront = relativeAngle < 35 || relativeAngle > 325;

            return (
              <div
                key={item.id}
                className={`aura-carousel3d__card ${isCenterFront ? 'is-front' : ''} ${isBackside ? 'is-back' : ''}`}
                style={{
                  transform: prefersReducedMotion
                    ? 'none'
                    : `rotateY(${cardAngle}deg) translateZ(${radius}px)`,
                }}
              >
                <div className="aura-carousel3d__card-inner">
                  {/* Equipment Image & Graceful Fallback */}
                  <div className="aura-carousel3d__media">
                    {!failedImages[item.id] ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="aura-carousel3d__img"
                        loading="lazy"
                        onError={() => handleImageError(item.id)}
                      />
                    ) : (
                      <div className="aura-carousel3d__fallback-img">
                        {getCategoryIcon(item.category)}
                        <span>{item.category}</span>
                      </div>
                    )}
                    <div className="aura-carousel3d__gradient-overlay" />
                    <span className="aura-carousel3d__category-tag">
                      {getCategoryIcon(item.category)}
                      {item.category}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="aura-carousel3d__info">
                    <div className="aura-carousel3d__header">
                      <h3 className="aura-carousel3d__title">{item.name}</h3>
                      <Badge variant={item.status} size="sm">{item.status}</Badge>
                    </div>

                    <p className="aura-carousel3d__desc">{item.subtitle}</p>

                    <div className="aura-carousel3d__specs">
                      {item.specs?.slice(0, 2).map((spec, i) => (
                        <span key={i} className="aura-carousel3d__spec-chip">{spec}</span>
                      ))}
                    </div>

                    <div className="aura-carousel3d__footer">
                      <div className="aura-carousel3d__price">
                        <span className="aura-carousel3d__amount">${item.dailyRate}</span>
                        <span className="aura-carousel3d__unit">/day</span>
                      </div>
                      <Link
                        to={`/equipment/${item.id}`}
                        className="aura-carousel3d__action"
                        aria-label={`View specs for ${item.name}`}
                      >
                        <span>Reserve</span>
                        <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rotation Indicator & Interactive Guidance */}
      <div className="aura-carousel3d__controls">
        <span className="aura-carousel3d__indicator-dot" />
        <span className="aura-carousel3d__status">
          {isPaused ? 'Rotation Paused (Inspecting)' : 'Interactive Perspective Ring • Hover to Inspect'}
        </span>
      </div>
    </div>
  );
}

export default EquipmentCarousel3D;
