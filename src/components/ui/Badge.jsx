import React from 'react';

const variants = {
  pr:      'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  primary: 'bg-primary-500/20 text-primary-400 border border-primary-500/30',
  success: 'bg-green-500/20 text-green-400 border border-green-500/30',
  muted:   'bg-surface-800 text-surface-400 border border-surface-700',
};

export function Badge({ variant = 'muted', children, className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5
        rounded-full text-xs font-semibold
        ${variants[variant] ?? variants.muted}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

export function PRBadge() {
  return (
    <Badge variant="pr">
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 1l2.928 6.472L20 8.472l-5 4.709 1.18 6.62L10 16.888l-6.18 2.912L5 13.181 0 8.472l7.072-.998L10 1z" clipRule="evenodd"/>
      </svg>
      PR
    </Badge>
  );
}
