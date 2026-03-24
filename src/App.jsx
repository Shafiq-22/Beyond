import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase.js';
import useAuthStore from './stores/authStore.js';
import { AppLayout } from './components/layout/AppLayout.jsx';
import { FullPageSpinner } from './components/ui/Spinner.jsx';
import AuthPage from './pages/AuthPage.jsx';

// Lazy-loaded pages for faster initial load
const DashboardPage  = lazy(() => import('./pages/DashboardPage.jsx'));
const WorkoutPage    = lazy(() => import('./pages/WorkoutPage.jsx'));
const HistoryPage    = lazy(() => import('./pages/HistoryPage.jsx'));
const ExercisesPage  = lazy(() => import('./pages/ExercisesPage.jsx'));
const RoutinesPage   = lazy(() => import('./pages/RoutinesPage.jsx'));
const AnalyticsPage  = lazy(() => import('./pages/AnalyticsPage.jsx'));

function AuthGuard({ children }) {
  const { user, loading } = useAuthStore();
  if (loading) return <FullPageSpinner />;
  if (!user)   return <Navigate to="/auth" replace />;
  return children;
}

export default function App() {
  const { setSession, setLoading, clearAuth } = useAuthStore();

  useEffect(() => {
    // Initialize session from storage
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          setSession(session);
        } else {
          clearAuth();
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [setSession, setLoading, clearAuth]);

  return (
    <BrowserRouter>
      <Suspense fallback={<FullPageSpinner />}>
        <Routes>
          {/* Public */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Protected */}
          <Route
            element={
              <AuthGuard>
                <AppLayout />
              </AuthGuard>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/workout"   element={<WorkoutPage />} />
            <Route path="/history"   element={<HistoryPage />} />
            <Route path="/exercises" element={<ExercisesPage />} />
            <Route path="/routines"  element={<RoutinesPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
