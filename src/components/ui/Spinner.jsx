import React from 'react';

export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <div
      className={`
        ${sizes[size] ?? sizes.md}
        border-2 border-surface-700 border-t-primary-500
        rounded-full animate-spin
        ${className}
      `}
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="fixed inset-0 bg-surface-950 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-surface-400 text-sm">Loading…</p>
      </div>
    </div>
  );
}
