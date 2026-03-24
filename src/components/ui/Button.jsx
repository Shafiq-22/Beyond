import React from 'react';

const variants = {
  primary: 'btn-primary',
  ghost:   'btn-ghost',
  danger:  'btn-danger',
  icon:    'tap-target rounded-xl hover:bg-surface-800 active:bg-surface-700 transition-colors',
};

const sizes = {
  sm: 'text-sm px-3 py-2 min-h-[36px]',
  md: '',   // default from CSS class
  lg: 'text-base px-6 py-4 min-h-[52px]',
};

export const Button = React.forwardRef(function Button(
  { variant = 'primary', size = 'md', className = '', disabled, loading, children, ...props },
  ref
) {
  const base = variants[variant] ?? variants.primary;
  const sz   = sizes[size] ?? '';

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`${base} ${sz} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : children}
    </button>
  );
});
