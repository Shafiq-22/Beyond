import { create } from 'zustand';

const useRoutineStore = create((set) => ({
  routines: [],
  loaded:   false,

  setRoutines: (routines) => set({ routines, loaded: true }),

  addRoutine: (routine) =>
    set((state) => ({ routines: [routine, ...state.routines] })),

  updateRoutine: (id, updates) =>
    set((state) => ({
      routines: state.routines.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),

  removeRoutine: (id) =>
    set((state) => ({
      routines: state.routines.filter((r) => r.id !== id),
    })),
}));

export default useRoutineStore;
