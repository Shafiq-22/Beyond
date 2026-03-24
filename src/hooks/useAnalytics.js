import { useState, useCallback } from 'react';
import { getLocalSessions, getSetsBySession, getSetsByExercise, getLocalSession } from '../lib/db.js';
import useAuthStore from '../stores/authStore.js';

export function useAnalytics() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  /**
   * Returns weekly volume data for the last N weeks.
   * Each item: { week: 'Mar 10', volume: 12500 }
   */
  const getWeeklyVolume = useCallback(async (weeks = 8) => {
    if (!user) return [];
    setLoading(true);
    try {
      const sessions = await getLocalSessions(user.id);
      const now = Date.now();
      const result = [];

      for (let i = weeks - 1; i >= 0; i--) {
        const weekStart = new Date(now - i * 7 * 86400000);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);

        const weekSessions = sessions.filter((s) => {
          const t = new Date(s.started_at).getTime();
          return t >= weekStart.getTime() && t < weekEnd.getTime();
        });

        const volume = weekSessions.reduce((sum, s) => sum + (s.total_volume ?? 0), 0);
        result.push({
          week:   weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          volume: Math.round(volume),
        });
      }
      return result;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Returns strength trend for a specific exercise.
   * Each item: { date: 'Mar 10', maxWeight: 100, volume: 2400 }
   */
  const getStrengthTrend = useCallback(async (exerciseId, limit = 10) => {
    if (!user) return [];
    setLoading(true);
    try {
      const allSets = await getSetsByExercise(exerciseId);

      // Group by session
      const bySession = {};
      for (const s of allSets) {
        if (!bySession[s.session_id]) bySession[s.session_id] = [];
        bySession[s.session_id].push(s);
      }

      // Enrich with session dates
      const entries = await Promise.all(
        Object.entries(bySession).map(async ([sessionId, sets]) => {
          const session = await getLocalSession(sessionId);
          return {
            date:      session?.started_at ?? new Date().toISOString(),
            maxWeight: Math.max(...sets.map(s => s.weight ?? 0)),
            volume:    sets.reduce((sum, s) => sum + (s.weight ?? 0) * (s.reps ?? 0), 0),
          };
        })
      );

      return entries
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-limit)
        .map((e) => ({
          ...e,
          date: new Date(e.date).toLocaleDateString('en-US', {
            month: 'short',
            day:   'numeric',
          }),
        }));
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Summary stats: total workouts, total volume, total sets.
   */
  const getSummaryStats = useCallback(async () => {
    if (!user) return {};
    const sessions = await getLocalSessions(user.id);
    const totalVolume    = sessions.reduce((sum, s) => sum + (s.total_volume ?? 0), 0);
    const totalWorkouts  = sessions.length;
    const totalDuration  = sessions.reduce((sum, s) => sum + (s.duration_seconds ?? 0), 0);
    return {
      totalWorkouts,
      totalVolume:   Math.round(totalVolume),
      totalDuration, // seconds
    };
  }, [user]);

  return { loading, getWeeklyVolume, getStrengthTrend, getSummaryStats };
}
