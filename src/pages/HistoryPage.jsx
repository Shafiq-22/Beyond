import React, { useState, useEffect, useCallback } from 'react';
import { TopBar }   from '../components/layout/TopBar.jsx';
import { Spinner }  from '../components/ui/Spinner.jsx';
import { Modal }    from '../components/ui/Modal.jsx';
import useAuthStore from '../stores/authStore.js';
import { getLocalSessions, getSetsBySession } from '../lib/db.js';
import { supabase } from '../lib/supabase.js';
import { useOnlineStatus } from '../hooks/useOnlineStatus.js';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

function formatDuration(s) {
  if (!s) return null;
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  return h > 0 ? `${h}h ${m % 60}m` : `${m}m`;
}

export default function HistoryPage() {
  const { user }   = useAuthStore();
  const isOnline   = useOnlineStatus();
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail,   setDetail]   = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async () => {
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
          .order('started_at', { ascending: false });
        if (remote) data = remote;
      } else {
        const local = await getLocalSessions(user.id);
        data = local
          .filter(s => s.finished_at)
          .sort((a, b) => new Date(b.started_at) - new Date(a.started_at));
      }
      setSessions(data);
    } finally {
      setLoading(false);
    }
  }, [user, isOnline]);

  useEffect(() => { load(); }, [load]);

  const openDetail = useCallback(async (session) => {
    setSelected(session);
    setDetailLoading(true);
    try {
      let sets = [];
      if (isOnline) {
        const { data } = await supabase
          .from('sets')
          .select('*, exercises(name, muscle_group)')
          .eq('session_id', session.id)
          .order('set_number');
        if (data) sets = data;
      } else {
        sets = await getSetsBySession(session.id);
      }

      // Group by exercise
      const byExercise = {};
      for (const s of sets) {
        const name = s.exercises?.name ?? s.exercise_id;
        if (!byExercise[name]) byExercise[name] = [];
        byExercise[name].push(s);
      }
      setDetail(byExercise);
    } finally {
      setDetailLoading(false);
    }
  }, [isOnline]);

  return (
    <div>
      <TopBar title="History" />

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20 px-8">
          <p className="text-4xl mb-4">📋</p>
          <p className="font-medium text-surface-300">No workouts logged yet</p>
          <p className="text-sm text-surface-500 mt-2">Your completed workouts will appear here.</p>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-2">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => openDetail(s)}
              className="w-full card px-4 py-4 flex items-center gap-4 text-left hover:bg-surface-800 transition-colors active:scale-[0.99]"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-white">{s.name}</p>
                <p className="text-xs text-surface-500 mt-0.5">{formatDate(s.started_at)}</p>
              </div>
              <div className="text-right shrink-0 flex flex-col gap-1">
                <span className="text-sm font-bold text-white">
                  {s.total_volume != null ? `${Math.round(s.total_volume)}kg` : '–'}
                </span>
                {s.duration_seconds && (
                  <span className="text-xs text-surface-500">{formatDuration(s.duration_seconds)}</span>
                )}
              </div>
              <svg className="w-4 h-4 text-surface-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {/* Session detail modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => { setSelected(null); setDetail(null); }}
        title={selected?.name}
      >
        {detailLoading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : detail ? (
          <div className="px-5 pb-6 space-y-5">
            {/* Meta */}
            <div className="flex gap-4 text-center">
              {[
                ['Date',     formatDate(selected?.started_at)],
                ['Volume',   selected?.total_volume != null ? `${Math.round(selected.total_volume)}kg` : '–'],
                ['Duration', formatDuration(selected?.duration_seconds) ?? '–'],
              ].map(([label, val]) => (
                <div key={label} className="flex-1 bg-surface-800 rounded-xl py-3">
                  <p className="text-[10px] text-surface-500 uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-semibold text-white mt-1 truncate px-2">{val}</p>
                </div>
              ))}
            </div>

            {/* Sets by exercise */}
            {Object.entries(detail).map(([exerciseName, sets]) => (
              <div key={exerciseName}>
                <p className="text-sm font-semibold text-white mb-2">{exerciseName}</p>
                <div className="space-y-1">
                  {sets.map((s, i) => (
                    <div key={s.id ?? i} className="flex items-center gap-3 text-sm">
                      <span className="text-surface-600 w-4 text-center">{i + 1}</span>
                      <span className="text-white">
                        {s.weight != null ? `${s.weight}kg` : '–'}
                        {s.reps   != null ? ` × ${s.reps}` : ''}
                      </span>
                      {s.rpe  && <span className="text-surface-500 text-xs">@ {s.rpe}</span>}
                      {s.is_pr && (
                        <span className="text-amber-400 text-xs font-bold">★ PR</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
