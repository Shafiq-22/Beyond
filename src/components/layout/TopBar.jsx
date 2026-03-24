import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus.js';

export function TopBar({ title, left, right }) {
  const isOnline = useOnlineStatus();

  return (
    <header className="sticky top-0 z-20 bg-surface-950/90 backdrop-blur-md border-b border-surface-800/50">
      <div className="flex items-center h-14 px-4 max-w-lg mx-auto gap-3">
        {/* Left slot */}
        <div className="w-10">{left}</div>

        {/* Title */}
        <div className="flex-1 flex items-center gap-2">
          <h1 className="font-semibold text-base text-white truncate">{title}</h1>
          {!isOnline && (
            <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full px-2 py-0.5 font-medium shrink-0">
              Offline
            </span>
          )}
        </div>

        {/* Right slot */}
        <div className="w-10 flex justify-end">{right}</div>
      </div>
    </header>
  );
}
