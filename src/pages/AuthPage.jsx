import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore.js';
import { LoginForm }    from '../components/auth/LoginForm.jsx';
import { RegisterForm } from '../components/auth/RegisterForm.jsx';

export default function AuthPage() {
  const [tab, setTab] = useState('login');
  const { user }      = useAuthStore();
  const navigate      = useNavigate();

  // Already logged in — redirect
  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  return (
    <div className="min-h-dvh bg-surface-950 flex flex-col items-center justify-center px-5 py-12">
      {/* Logo / Brand */}
      <div className="mb-10 text-center">
        <div className="text-5xl font-black tracking-tight text-white mb-2">
          Beyond
        </div>
        <p className="text-surface-400 text-sm">Track workouts. Beat PRs. Level up.</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm card px-6 py-7 shadow-2xl">
        {/* Tab switcher */}
        <div className="flex bg-surface-800 rounded-xl p-1 mb-6">
          {['login', 'register'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`
                flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-150
                ${tab === t
                  ? 'bg-surface-950 text-white shadow-sm'
                  : 'text-surface-400 hover:text-white'
                }
              `}
            >
              {t === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {tab === 'login'
          ? <LoginForm    onSwitch={() => setTab('register')} />
          : <RegisterForm onSwitch={() => setTab('login')} />
        }
      </div>

      <p className="mt-8 text-center text-xs text-surface-600">
        By continuing you agree to our Terms & Privacy Policy.
      </p>
    </div>
  );
}
