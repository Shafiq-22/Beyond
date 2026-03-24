import React, { useEffect } from 'react';

export function Modal({ isOpen, onClose, title, children, className = '' }) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        className={`
          relative z-10 w-full sm:max-w-md
          bg-surface-900 border border-surface-800
          rounded-t-3xl sm:rounded-3xl
          max-h-[90dvh] flex flex-col
          ${className}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0">
          {title && (
            <h2 className="text-base font-semibold text-white">{title}</h2>
          )}
          <button
            onClick={onClose}
            className="ml-auto tap-target text-surface-400 hover:text-white rounded-lg"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 scroll-touch pb-safe">
          {children}
        </div>
      </div>
    </div>
  );
}
