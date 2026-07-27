'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, ShieldCheck, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(true);

  React.useEffect(() => {
    fetch('/api/auth/signup-status')
      .then((res) => res.json())
      .then((data) => setIsSignupOpen(data.open))
      .catch(() => setIsSignupOpen(true));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    const loginToast = toast.loading('Authenticating...');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      toast.success('Successfully logged in!', { id: loginToast });
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed', { id: loginToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-md py-8 px-4 border border-slate-800 shadow-xl rounded-2xl sm:px-10">
      {message === 'timeout' && (
        <div className="mb-5 p-3 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-500 text-xs font-semibold flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>You were logged out due to inactivity.</span>
        </div>
      )}

      <form className="space-y-6" onSubmit={handleLogin}>
        <div>
          <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Email address
          </label>
          <div className="mt-2.5 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Mail className="h-4.5 w-4.5" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="admin1@cloudexify.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Password
          </label>
          <div className="mt-2.5 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Lock className="h-4.5 w-4.5" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="••••••••••••"
            />
          </div>
        </div>

        <div>
          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-transform shadow-lg shadow-blue-900/30"
          >
            Authenticate Sign-In
          </Button>
        </div>
      </form>

      <div className="mt-4 text-center">
        {isSignupOpen ? (
          <Link
            href="/signup"
            className="text-xs text-blue-500 hover:text-blue-400 font-semibold transition-colors"
          >
            Request new admin account? Sign Up
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => toast.error('This system is closed for signups from the back. Contact Admin.')}
            className="text-xs text-slate-500 hover:text-slate-400 font-semibold transition-colors"
          >
            Request new admin account? Sign Up
          </button>
        )}
      </div>

      <div className="mt-5 border-t border-slate-800 pt-5">
        <p className="text-center text-[10px] text-slate-500 leading-normal">
          Row-level security policies and active session monitoring are enforced on all network access.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      {/* Decorative premium dark design elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-slate-900/40 blur-[100px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center items-center space-x-2">
          <img src="/logo.png" alt="CloudExify Logo" className="h-10 w-10 object-contain" />
          <span className="text-2xl font-bold tracking-tight text-white">
            CloudExify<span className="text-blue-500 font-extrabold text-3xl">.</span>
          </span>
        </div>
        <h2 className="mt-6 text-center text-2xl font-extrabold tracking-tight text-white">
          Admin Dashboard
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Authorized Founder access only
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 font-sans">
        <Suspense fallback={
          <div className="bg-slate-900/50 backdrop-blur-md py-8 px-4 border border-slate-800 shadow-xl rounded-2xl sm:px-10 flex items-center justify-center text-slate-400 text-xs font-semibold">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent mr-2" />
            Loading authentication portal...
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
