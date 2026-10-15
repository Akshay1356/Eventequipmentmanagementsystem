import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

/**
 * Accessible Modal Dialog Component
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '520px',
  showClose = true,
}) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Focus first interactive element or modal container
    if (modalRef.current) {
      modalRef.current.focus();
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
      if (previousFocusRef.current && previousFocusRef.current.focus) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="aura-modal-backdrop" onClick={onClose} aria-hidden="true">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="aura-modal-title"
        className="aura-modal"
        style={{ maxWidth }}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="aura-modal__header">
          {title && <h3 id="aura-modal-title" className="aura-modal__title">{title}</h3>}
          {showClose && (
            <button
              type="button"
              onClick={onClose}
              className="aura-modal__close-btn"
              aria-label="Close modal dialog"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <div className="aura-modal__body">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
