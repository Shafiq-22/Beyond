import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useWorkoutStore from '../../stores/workoutStore.js';

const tabs = [
  {
    to:    '/dashboard',
    label: 'Home',
    icon:  (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75v-4.5h-4.5V21a.75.75 0 01-.75.75H3.75A.75.75 0 013 21V9.75z"/>
      </svg>
    ),
  },
  {
    to:    '/history',
    label: 'History',
    icon:  (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 6v6h4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
  },
  {
    to:    '/workout',
    label: 'Log',
    icon:  null,  // Special center button
    isCenter: true,
  },
  {
    to:    '/routines',
    label: 'Routines',
    icon:  (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/>
      </svg>
    ),
  },
  {
    to:    '/analytics',
    label: 'Progress',
    icon:  (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.518l2.74-1.22m0 0l-5.94-2.281m5.94 2.28l-2.28 5.941"/>
      </svg>
    ),
  },
];

export function BottomNav() {
  const navigate     = useNavigate();
  const activeSession = useWorkoutStore((s) => s.activeSession);

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-surface-950 border-t border-surface-800 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          if (tab.isCenter) {
            return (
              <button
                key={tab.to}
                onClick={() => navigate('/workout')}
                className="flex flex-col items-center -mt-6 tap-target"
                aria-label="Log workout"
              >
                <div className={`
                  w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg
                  ${activeSession
                    ? 'bg-green-600 animate-pulse'
                    : 'bg-primary-600 hover:bg-primary-500'
                  }
                  transition-colors
                `}>
                  {activeSession ? (
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"/>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                    </svg>
                  )}
                </div>
                <span className="text-[10px] font-medium text-surface-400 mt-1">{tab.label}</span>
              </button>
            );
          }

          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 tap-target px-3 ${
                  isActive ? 'text-primary-400' : 'text-surface-500 hover:text-surface-300'
                } transition-colors`
              }
            >
              {tab.icon}
              <span className="text-[10px] font-medium">{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
