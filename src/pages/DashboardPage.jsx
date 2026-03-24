import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar }     from '../components/layout/TopBar.jsx';
import { Spinner }    from '../components/ui/Spinner.jsx';
import { Button }     from '../components/ui/Button.jsx';
import { useAuth }    from '../hooks/useAuth.js';
import useAuthStore   from '../stores/authStore.js';
import useWorkoutStore from '../stores/workoutStore.js';
import { getLocalSessions, getSetsBySession } from '../lib/db.js';
import { supabase }   from '../lib/supabase.js';
import { useOnlineStatus } from '../hooks/useOnlineStatus.js';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

function formatDuration(seconds) {
  if (!seconds) return '–';
  const m = Math.floor(seconds / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m}m`;
}

export default function DashboardPage() {
  const navigate       = useNavigate();
  const { signOut }    = useAuth();
  const { user }       = useAuthStore();
  const activeSession  = useWorkoutStore((s) => s.activeSession);
  const isOnline       = useOnlineStatus();

  const [sessions, setSessions]   = useState([]);
  const [loading,  setLoading]    = useState(true);

  const loadRecent = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      let data = [];

      if (isOnline) {
        const { data: remote } = await supabase
          .from('workout_sessions')
          .select('*')
          .eq('user_id', user.id)
          .not('finished_at', 'is', null)
          .order('started_at', { ascending: false })
          .limit(5);
        if (remote) data = remote;
      } else {
        const local = await getLocalSessions(user.id);
        data = local
          .filter(s => s.finished_at)
          .sort((a, b) => new Date(b.started_at) - new Date(a.started_at))
          .slice(0, 5);
      }

      setSessions(data);
    } finally {
      setLoading(false);
    }
  }, [user, isOnline]);

  useEffect(() => { loadRecent(); }, [loadRecent]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-dvh flex flex-col">
      <TopBar
        title="Beyond"
        right={
          <button
            onClick={() => signOut()}
            className="tap-target text-surface-500 hover:text-white rounded-lg"
            aria-label="Sign out"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          </button>
        }
      />

      <div className="px-4 py-5 flex flex-col gap-6">
        {/* Greeting */}
        <div>
          <p className="text-surface-400 text-sm">{greeting()},</p>
          <h2 className="text-xl font-bold text-white mt-0.5">
            {user?.email?.split('@')[0] ?? 'Athlete'}
          </h2>
        </div>

        {/* Active session banner */}
        {activeSession && (
          <div
            className="card px-4 py-4 border-primary-500/30 bg-primary-500/10 cursor-pointer"
            onClick={() => navigate('/workout')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-primary-400 font-semibold uppercase tracking-wide mb-1">
                  Active Workout
                </p>
                <p className="font-semibold text-white">{activeSession.name}</p>
                <p className="text-xs text-surface-400 mt-0.5">
                  {activeSession.exercises.length} exercise{activeSession.exercises.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center animate-pulse">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"/>
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Quick Start */}
        {!activeSession && (
          <Button onClick={() => navigate('/workout')} size="lg" className="w-full">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"/>
            </svg>
            Start Workout
          </Button>
        )}

        {/* Recent workouts */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Recent Workouts</h3>
            <button
              onClick={() => navigate('/history')}
              className="text-xs text-primary-400 hover:text-primary-300 font-medium"
            >
              View all
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : sessions.length === 0 ? (
            <div className="card px-5 py-10 text-center">
              <p className="text-3xl mb-3">🏋️</p>
              <p className="text-sm font-medium text-surface-300">No workouts yet</p>
              <p className="text-xs text-surface-500 mt-1">Start your first session to track progress.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((s) => (
                <div key={s.id} className="card px-4 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-white truncate">{s.name}</p>
                    <p className="text-xs text-surface-500 mt-0.5">
                      {formatDate(s.started_at)}
                      {s.duration_seconds ? ` · ${formatDuration(s.duration_seconds)}` : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-white">
                      {s.total_volume ? `${Math.round(s.total_volume)}kg` : '–'}
                    </p>
                    <p className="text-xs text-surface-500">volume</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
