import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { getEquipment } from '../../services/equipmentService';
import CinematicStage3D from './CinematicStage3D';
import './LoadingExperience.css';

/**
 * AURA Cinematic 3D Event Experience Loader
 * 
 * Transforms the loading experience into a concert-stage production:
 * - Upper/Center: Full 3D concert stage environment with volumetric spotlights,
 *   reflective floor with neon ribbons, and orbiting event equipment (speakers,
 *   moving-head lights, mics, projectors, LED video walls, trussing).
 * - Lower: High-fidelity system initialization HUD, status readout, and luminous progress indicator.
 */
export function LoadingExperience({ onComplete }) {
  const [phase, setPhase] = useState('power-on'); // 'power-on' | 'orbit' | 'exit' | 'error'
  const [statusText, setStatusText] = useState('POWERING UP THE EXPERIENCE');
  const [progress, setProgress] = useState(18);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isExiting, setIsExiting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const isMountedRef = useRef(true);
  const timersRef = useRef([]);

  // Respect user's prefers-reduced-motion setting
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const handler = (e) => setPrefersReducedMotion(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, []);

  // System initialization sequence & genuine backend readiness check
  useEffect(() => {
    isMountedRef.current = true;
    const activeTimers = [];

    const addTimer = (fn, delay) => {
      const id = setTimeout(() => {
        if (isMountedRef.current) fn();
      }, delay);
      activeTimers.push(id);
      timersRef.current.push(id);
      return id;
    };

    const runSequence = async () => {
      try {
        // Step A: Power-on beam sweep initiates 3D stage orbit
        addTimer(() => {
          setPhase('orbit');
          setProgress(42);
          setStatusText('POWERING UP THE EXPERIENCE');
        }, prefersReducedMotion ? 200 : 550);

        // Step B: Calibrate inventory systems
        addTimer(() => {
          setProgress(72);
          setStatusText('INITIALIZING EQUIPMENT INVENTORY');
        }, prefersReducedMotion ? 400 : 1100);

        // Real data readiness check to equipment service with race timeout
        const startTime = Date.now();
        try {
          const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 2000));
          await Promise.race([getEquipment(), timeoutPromise]);
        } catch (fetchErr) {
          console.warn('Backend readiness check bypassed, continuing loading sequence:', fetchErr);
        }

        const elapsed = Date.now() - startTime;
        const minDisplayTime = prefersReducedMotion ? 400 : 1600;
        const remainingDelay = Math.max(0, minDisplayTime - elapsed);

        // Step C: Prepare event workspace & trigger cinematic exit
        addTimer(() => {
          setProgress(95);
          setStatusText('PREPARING YOUR EVENT WORKSPACE');

          addTimer(() => {
            setProgress(100);
            setStatusText('SYSTEM ONLINE');
            setPhase('exit');
            setIsExiting(true);

            // Give the 3D spotlight flash and contraction effect 550ms before unmounting
            addTimer(() => {
              if (onComplete) onComplete();
            }, 550);
          }, 250);
        }, remainingDelay);

      } catch (err) {
        if (isMountedRef.current) {
          console.error('Loader initialization error:', err);
          // Instead of locking screen, exit cleanly to allow user into the application
          if (onComplete) onComplete();
        }
      }
    };

    runSequence();

    return () => {
      isMountedRef.current = false;
      activeTimers.forEach(clearTimeout);
    };
  }, [onComplete, prefersReducedMotion, retryCount]);

  const handleRetry = () => {
    setErrorMessage(null);
    setPhase('power-on');
    setProgress(20);
    setStatusText('INITIALIZING POWER GRID');
    setRetryCount((c) => c + 1);
  };

  return (
    <div
      className={`aura-loader-overlay ${isExiting ? 'is-exiting' : ''} ${prefersReducedMotion ? 'is-reduced-motion' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading event equipment system"
    >
      {/* 3D WebGL Concert Stage & 3D Equipment Orbit */}
      <CinematicStage3D
        isExiting={isExiting}
        prefersReducedMotion={prefersReducedMotion}
      />

      {/* Atmospheric Vignette & Gradients */}
      <div className="aura-loader-vignette" aria-hidden="true" />

      {/* Horizontal Laser Scan Beam on Initial Power-on */}
      <div
        className={`aura-loader-beam ${phase === 'power-on' ? 'is-active' : 'is-faded'}`}
        aria-hidden="true"
      >
        <div className="aura-loader-beam__line" />
        <div className="aura-loader-beam__flare" />
      </div>

      {/* Dedicated Lower HUD Interface */}
      <div className="aura-loader-hud">
        {/* Brand Identity */}
        <div className="aura-loader-identity">
          <div className="aura-loader-brand-title">
            <span className="aura-loader-title-main">AURA</span>
            <span className="aura-loader-title-sub">EVENT GEAR</span>
          </div>
        </div>

        {/* Progress & Status Readout */}
        {phase !== 'error' ? (
          <div className="aura-loader-progress-box">
            <div className="aura-loader-status-row">
              <span className="aura-loader-status-text">{statusText}</span>
            </div>

            {/* Thin Luminous Progress Track */}
            <div className="aura-progress-track">
              <div
                className="aura-progress-fill"
                style={{ width: `${progress}%` }}
              >
                <div className="aura-progress-glow-head" />
              </div>
            </div>

            <p className="aura-loader-subinfo">
              Bringing your event equipment together.
            </p>
          </div>
        ) : (
          /* Error & Retry Fallback */
          <div className="aura-loader-error-box">
            <ShieldAlert size={20} className="aura-error-icon" />
            <p className="aura-error-text">{errorMessage}</p>
            <button
              type="button"
              className="aura-retry-btn"
              onClick={handleRetry}
            >
              <RefreshCw size={14} />
              <span>Retry Initialization</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoadingExperience;
