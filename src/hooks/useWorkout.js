/**
 * High-level workout hook — wraps workoutStore with persistence logic.
 * Components should use this hook rather than workoutStore directly.
 */
import { useCallback } from 'react';
import useWorkoutStore from '../stores/workoutStore.js';
import useAuthStore   from '../stores/authStore.js';
import {
  saveSessionLocal,
  saveSetsLocal,
  getPersonalRecord,
} from '../lib/db.js';
import { syncSession } from '../lib/sync.js';
import { useOnlineStatus } from './useOnlineStatus.js';
import { hapticSuccess } from '../lib/haptics.js';

export function useWorkout() {
  const store    = useWorkoutStore();
  const { user } = useAuthStore();
  const isOnline = useOnlineStatus();

  /**
   * Finish the active session:
   * 1. Mark PRs
   * 2. Compute total volume + duration
   * 3. Save to IndexedDB
   * 4. Sync to Supabase (or enqueue if offline)
   */
  const finishSession = useCallback(async () => {
    const { activeSession, getTotalVolume, markSetPR, setSyncing, clearSession } = store;
    if (!activeSession) return;

    setSyncing(true);

    const finishedAt = new Date().toISOString();
    const started    = new Date(activeSession.startedAt);
    const durationSeconds = Math.round((Date.now() - started.getTime()) / 1000);
    const totalVolume     = getTotalVolume();

    // ── Check PRs ──────────────────────────────────────────────────────────
    const prChecks = activeSession.exercises.flatMap((e) =>
      e.sets
        .filter((s) => s.completed && s.weight != null)
        .map(async (s) => {
          const pr = await getPersonalRecord(e.exerciseId);
          if (!pr || s.weight > pr.weight) {
            markSetPR(e.exerciseId, s.id);
          }
        })
    );
    await Promise.all(prChecks);

    // Re-read after PR marking
    const { activeSession: updatedSession } = useWorkoutStore.getState();

    // ── Build flat records ─────────────────────────────────────────────────
    const sessionRecord = {
      id:               updatedSession.id,
      user_id:          user.id,
      routine_id:       updatedSession.routine_id ?? null,
      name:             updatedSession.name,
      started_at:       updatedSession.startedAt,
      finished_at:      finishedAt,
      total_volume:     totalVolume,
      duration_seconds: durationSeconds,
      notes:            null,
    };

    const setRecords = updatedSession.exercises.flatMap((e) =>
      e.sets
        .filter((s) => s.completed)
        .map((s) => ({
          id:          s.id,
          session_id:  updatedSession.id,
          exercise_id: e.exerciseId,
          set_number:  s.setNumber,
          reps:        s.reps,
          weight:      s.weight,
          rpe:         s.rpe,
          is_pr:       s.isPR ?? false,
          logged_at:   new Date().toISOString(),
        }))
    );

    // ── Persist ────────────────────────────────────────────────────────────
    await saveSessionLocal(sessionRecord);
    if (setRecords.length) await saveSetsLocal(setRecords);

    // Sync (online → direct, offline → queue)
    try {
      await syncSession(sessionRecord, setRecords, isOnline);
    } catch (err) {
      console.error('[useWorkout] syncSession failed:', err);
    }

    hapticSuccess();
    clearSession();
    setSyncing(false);

    return sessionRecord;
  }, [store, user, isOnline]);

  return {
    activeSession:       store.activeSession,
    isSyncing:           store.isSyncing,
    startSession:        store.startSession,
    discardSession:      store.discardSession,
    addExercise:         store.addExercise,
    removeExercise:      store.removeExercise,
    addSet:              store.addSet,
    updateSet:           store.updateSet,
    toggleSetComplete:   store.toggleSetComplete,
    removeSet:           store.removeSet,
    finishSession,
    getTotalVolume:      store.getTotalVolume,
    getCompletedSetsCount: store.getCompletedSetsCount,
  };
}
