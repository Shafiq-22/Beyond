import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user:    null,
  session: null,
  loading: true,   // true until Supabase resolves the initial session

  setUser:    (user)    => set({ user }),
  setSession: (session) => set({ session, user: session?.user ?? null }),
  clearAuth:  ()        => set({ user: null, session: null }),
  setLoading: (loading) => set({ loading }),
}));

export default useAuthStore;
