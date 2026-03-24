/**
 * Active workout session store.
 * Manages the in-memory state of an ongoing workout.
 * All mutations are synchronous + O(1) so set logging stays < 1s.
 */
import { create } from 'zustand';
import { v4 as uuidv4 } from '../lib/uuid.js';

const useWorkoutStore = create((set, get) => ({
  // The currently active session, or null if none
  activeSession: null,
  isSyncing: false,

  // ── Session lifecycle ─────────────────────────────────────────────────────

  startSession: (name, routineId = null) => {
    const session = {
      id:         uuidv4(),
      name,
      routine_id: routineId,
      startedAt:  new Date().toISOString(),
      exercises:  [],   // [{ exerciseId, exerciseName, muscleGroup, sets: [] }]
    };
    set({ activeSession: session });
    return session.id;
  },

  discardSession: () => set({ activeSession: null }),

  // Called externally after finishSession() completes saving
  clearSession: () => set({ activeSession: null }),

  setSyncing: (v) => set({ isSyncing: v }),

  // ── Exercises ─────────────────────────────────────────────────────────────

  addExercise: (exercise) => {
    set((state) => {
      if (!state.activeSession) return state;
      const alreadyAdded = state.activeSession.exercises.some(
        (e) => e.exerciseId === exercise.id
      );
      if (alreadyAdded) return state;

      const newExercise = {
        exerciseId:   exercise.id,
        exerciseName: exercise.name,
        muscleGroup:  exercise.muscle_group,
        sets: [],
      };

      return {
        activeSession: {
          ...state.activeSession,
          exercises: [...state.activeSession.exercises, newExercise],
        },
      };
    });
  },

  removeExercise: (exerciseId) => {
    set((state) => {
      if (!state.activeSession) return state;
      return {
        activeSession: {
          ...state.activeSession,
          exercises: state.activeSession.exercises.filter(
            (e) => e.exerciseId !== exerciseId
          ),
        },
      };
    });
  },

  reorderExercises: (exercises) => {
    set((state) => {
      if (!state.activeSession) return state;
      return { activeSession: { ...state.activeSession, exercises } };
    });
  },

  // ── Sets ──────────────────────────────────────────────────────────────────

  addSet: (exerciseId, prefill = {}) => {
    set((state) => {
      if (!state.activeSession) return state;
      const exercises = state.activeSession.exercises.map((e) => {
        if (e.exerciseId !== exerciseId) return e;
        const setNumber = e.sets.length + 1;
        const newSet = {
          id:         uuidv4(),
          setNumber,
          reps:       prefill.reps   ?? null,
          weight:     prefill.weight ?? null,
          rpe:        prefill.rpe    ?? null,
          completed:  false,
          isPR:       false,
        };
        return { ...e, sets: [...e.sets, newSet] };
      });
      return { activeSession: { ...state.activeSession, exercises } };
    });
  },

  /** Update a single field on a set — called on blur (not on every keystroke) */
  updateSet: (exerciseId, setId, field, value) => {
    set((state) => {
      if (!state.activeSession) return state;
      const exercises = state.activeSession.exercises.map((e) => {
        if (e.exerciseId !== exerciseId) return e;
        const sets = e.sets.map((s) =>
          s.id === setId ? { ...s, [field]: value } : s
        );
        return { ...e, sets };
      });
      return { activeSession: { ...state.activeSession, exercises } };
    });
  },

  toggleSetComplete: (exerciseId, setId) => {
    set((state) => {
      if (!state.activeSession) return state;
      const exercises = state.activeSession.exercises.map((e) => {
        if (e.exerciseId !== exerciseId) return e;
        const sets = e.sets.map((s) =>
          s.id === setId ? { ...s, completed: !s.completed } : s
        );
        return { ...e, sets };
      });
      return { activeSession: { ...state.activeSession, exercises } };
    });
  },

  removeSet: (exerciseId, setId) => {
    set((state) => {
      if (!state.activeSession) return state;
      const exercises = state.activeSession.exercises.map((e) => {
        if (e.exerciseId !== exerciseId) return e;
        const sets = e.sets
          .filter((s) => s.id !== setId)
          .map((s, i) => ({ ...s, setNumber: i + 1 }));
        return { ...e, sets };
      });
      return { activeSession: { ...state.activeSession, exercises } };
    });
  },

  markSetPR: (exerciseId, setId) => {
    set((state) => {
      if (!state.activeSession) return state;
      const exercises = state.activeSession.exercises.map((e) => {
        if (e.exerciseId !== exerciseId) return e;
        const sets = e.sets.map((s) =>
          s.id === setId ? { ...s, isPR: true } : s
        );
        return { ...e, sets };
      });
      return { activeSession: { ...state.activeSession, exercises } };
    });
  },

  // ── Computed helpers (read-only) ──────────────────────────────────────────

  getTotalVolume: () => {
    const { activeSession } = get();
    if (!activeSession) return 0;
    return activeSession.exercises.reduce((total, e) =>
      total + e.sets.reduce((sum, s) =>
        sum + (s.completed ? (s.weight ?? 0) * (s.reps ?? 0) : 0)
      , 0)
    , 0);
  },

  getCompletedSetsCount: () => {
    const { activeSession } = get();
    if (!activeSession) return 0;
    return activeSession.exercises.reduce(
      (n, e) => n + e.sets.filter((s) => s.completed).length, 0
    );
  },
}));

export default useWorkoutStore;
