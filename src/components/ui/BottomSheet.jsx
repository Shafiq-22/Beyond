import React, { useEffect } from 'react';

/**
 * A mobile-friendly bottom sheet — anchors to the bottom of the screen.
 */
export function BottomSheet({ isOpen, onClose, title, children, className = '' }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`
          relative z-10 w-full
          bg-surface-900 border-t border-surface-800
          rounded-t-3xl
          max-h-[80dvh] flex flex-col
          ${className}
        `}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-surface-700" />
        </div>

        {title && (
          <div className="flex items-center justify-between px-5 py-3 shrink-0 border-b border-surface-800">
            <h3 className="text-base font-semibold">{title}</h3>
            <button
              onClick={onClose}
              className="tap-target text-surface-400 hover:text-white rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="overflow-y-auto flex-1 scroll-touch pb-safe">
          {children}
        </div>
      </div>
    </div>
  );
}
