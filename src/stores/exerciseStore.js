import { create } from 'zustand';

const useExerciseStore = create((set, get) => ({
  exercises: [],
  loaded:    false,

  setExercises: (exercises) => set({ exercises, loaded: true }),

  addExercise: (exercise) =>
    set((state) => ({ exercises: [exercise, ...state.exercises] })),

  updateExercise: (id, updates) =>
    set((state) => ({
      exercises: state.exercises.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    })),

  removeExercise: (id) =>
    set((state) => ({
      exercises: state.exercises.filter((e) => e.id !== id),
    })),

  // ── Derived helpers ───────────────────────────────────────────────────────

  searchExercises: (query, muscleGroup) => {
    const { exercises } = get();
    const q = query.toLowerCase().trim();
    return exercises.filter((e) => {
      const matchesName  = !q || e.name.toLowerCase().includes(q);
      const matchesGroup = !muscleGroup || e.muscle_group === muscleGroup;
      return matchesName && matchesGroup;
    });
  },

  getById: (id) => get().exercises.find((e) => e.id === id),
}));

export default useExerciseStore;
