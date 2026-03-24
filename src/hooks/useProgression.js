import { useCallback } from 'react';
import {
  getPreviousSets,
  getPersonalRecord,
  getSetsByExercise,
} from '../lib/db.js';

export function useProgression() {
  /**
   * Get the previous session's sets for an exercise (for autofill).
   */
  const getPrevious = useCallback(async (exerciseId, currentSessionId) => {
    return getPreviousSets(exerciseId, currentSessionId);
  }, []);

  /**
   * Get the all-time PR for an exercise.
   */
  const getPR = useCallback(async (exerciseId) => {
    return getPersonalRecord(exerciseId);
  }, []);

  /**
   * Check if a given set beats the current PR.
   */
  const isPR = useCallback(async (exerciseId, weight, reps) => {
    const pr = await getPersonalRecord(exerciseId);
    if (!pr) return true;   // First-ever set is always a PR
    return weight > pr.weight;
  }, []);

  /**
   * Returns volume history for an exercise (for analytics).
   * Returns array of { session_id, started_at, totalVolume, maxWeight, totalReps }
   */
  const getExerciseHistory = useCallback(async (exerciseId) => {
    const allSets = await getSetsByExercise(exerciseId);
    // Group by session
    const bySession = {};
    for (const s of allSets) {
      if (!bySession[s.session_id]) {
        bySession[s.session_id] = { session_id: s.session_id, sets: [] };
      }
      bySession[s.session_id].sets.push(s);
    }
    return Object.values(bySession).map(({ session_id, sets }) => ({
      session_id,
      maxWeight:   Math.max(...sets.map(s => s.weight ?? 0)),
      totalVolume: sets.reduce((sum, s) => sum + (s.weight ?? 0) * (s.reps ?? 0), 0),
      totalReps:   sets.reduce((sum, s) => sum + (s.reps ?? 0), 0),
    }));
  }, []);

  return { getPrevious, getPR, isPR, getExerciseHistory };
}
