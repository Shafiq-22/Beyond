import React from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav.jsx';

export function AppLayout() {
  return (
    <div className="min-h-dvh bg-surface-950 text-white no-overscroll">
      {/* Page content — padded above the bottom nav */}
      <main className="pb-24 max-w-lg mx-auto">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
