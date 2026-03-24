import React from 'react';

export const Input = React.forwardRef(function Input(
  { label, error, className = '', type = 'text', ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-surface-300">{label}</label>
      )}
      <input
        ref={ref}
        type={type}
        className={`input-base ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
});

/** Compact number input for set rows */
export const SetInput = React.forwardRef(function SetInput(
  { className = '', ...props },
  ref
) {
  return (
    <input
      ref={ref}
      type="number"
      inputMode="decimal"
      className={`
        w-full bg-surface-800 border border-surface-700 rounded-lg
        text-center text-white text-sm font-medium
        px-1 py-2 min-h-[40px]
        focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent
        placeholder-surface-600
        transition-all duration-100
        ${className}
      `}
      {...props}
    />
  );
});
