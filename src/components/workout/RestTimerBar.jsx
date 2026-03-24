import React, { memo } from 'react';

const PRESETS = [60, 90, 120, 180, 300];

function fmt(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export const RestTimerBar = memo(function RestTimerBar({
  isActive,
  remaining,
  duration,
  progress,
  onStop,
  onAdd,
  onStart,
}) {
  if (!isActive && remaining === duration) {
    // Show a collapsed "start timer" button
    return (
      <div className="fixed bottom-16 inset-x-0 z-20 flex justify-center px-4 pb-2">
        <button
          onClick={() => onStart(90)}
          className="flex items-center gap-2 bg-surface-800 hover:bg-surface-700 border border-surface-700 text-surface-300 hover:text-white rounded-2xl px-4 py-2.5 text-sm font-medium transition-all active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Rest Timer
        </button>
      </div>
    );
  }

  if (!isActive) return null;

  const pct = Math.round(progress * 100);
  const isLow = remaining <= 10;

  return (
    <div className={`
      fixed bottom-16 inset-x-0 z-20 px-4 pb-2
    `}>
      <div className={`
        card px-4 py-3 shadow-xl
        ${isLow ? 'border-amber-500/40' : ''}
        transition-colors duration-300
      `}>
        {/* Progress bar */}
        <div className="w-full h-1 bg-surface-800 rounded-full mb-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-250 ${isLow ? 'bg-amber-500' : 'bg-primary-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          {/* Time display */}
          <div className="flex items-center gap-3">
            <span className={`text-2xl font-mono font-bold ${isLow ? 'text-amber-400' : 'text-white'}`}>
              {fmt(remaining)}
            </span>
            <span className="text-xs text-surface-500">rest</span>
          </div>

          {/* +30s / +60s buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onAdd(30)}
              className="text-xs bg-surface-800 hover:bg-surface-700 text-surface-300 rounded-lg px-2.5 py-1.5 font-medium transition-colors active:scale-95"
            >
              +30s
            </button>
            <button
              onClick={() => onAdd(60)}
              className="text-xs bg-surface-800 hover:bg-surface-700 text-surface-300 rounded-lg px-2.5 py-1.5 font-medium transition-colors active:scale-95"
            >
              +1m
            </button>

            {/* Preset buttons */}
            {PRESETS.map((s) => (
              <button
                key={s}
                onClick={() => onStart(s)}
                className="text-xs bg-surface-800 hover:bg-surface-700 text-surface-300 rounded-lg px-2 py-1.5 font-medium transition-colors active:scale-95"
              >
                {fmt(s)}
              </button>
            ))}

            {/* Stop */}
            <button
              onClick={onStop}
              className="tap-target w-8 h-8 flex items-center justify-center text-surface-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
              aria-label="Stop timer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
