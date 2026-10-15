import React, { useState, useEffect, useRef } from 'react';

/**
 * AnimatedCounter
 * Smooth count-up loading animation for statistics metrics.
 * - Triggers on scroll into view using IntersectionObserver
 * - Uses cubic ease-out for silky deceleration
 * - Preserves tabular number widths to prevent layout jitter
 * - Respects prefers-reduced-motion
 */
export function AnimatedCounter({
  target = 100,
  suffix = '',
  decimals = 0,
  duration = 1800,
}) {
  const [currentVal, setCurrentVal] = useState(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return target;
    }
    return 0;
  });
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0] && entries[0].isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [target]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime = null;
    let animationFrameId = null;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const val = easedProgress * target;

      setCurrentVal(val);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCurrentVal(target);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [hasStarted, target, duration]);

  const formattedNumber =
    decimals > 0
      ? currentVal.toFixed(decimals)
      : Math.floor(currentVal).toLocaleString();

  return (
    <span ref={elementRef} className="aura-animated-number" style={{ fontVariantNumeric: 'tabular-nums' }}>
      {formattedNumber}{suffix}
    </span>
  );
}

export default AnimatedCounter;
