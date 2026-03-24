import { create } from 'zustand';

const useSyncStore = create((set) => ({
  pendingCount: 0,
  isSyncing:    false,

  setPendingCount: (n)  => set({ pendingCount: n }),
  setSyncing:      (v)  => set({ isSyncing: v }),
  incrementPending: ()  => set((s) => ({ pendingCount: s.pendingCount + 1 })),
  decrementPending: ()  => set((s) => ({ pendingCount: Math.max(0, s.pendingCount - 1) })),
}));

export default useSyncStore;
