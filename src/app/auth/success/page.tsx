'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

function SuccessScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextRoute = searchParams.get('next') ?? '/dashboard';
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(nextRoute);
          router.refresh();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [nextRoute, router]);

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      {/* Decorative gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-slate-900/40 blur-[100px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center items-center space-x-2">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            CloudExify<span className="text-blue-500 font-extrabold text-3xl">.</span>
          </span>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-slate-900/50 backdrop-blur-md py-10 px-6 border border-slate-800 shadow-2xl rounded-2xl sm:px-10 text-center flex flex-col items-center">
          {/* Animated Success Checkmark Ring */}
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
            <div className="h-16 w-16 rounded-full bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 relative">
              <CheckCircle2 className="h-10 w-10 animate-pulse" />
            </div>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white mb-2">
            Email Confirmed!
          </h2>
          <p className="text-slate-400 text-xs leading-relaxed max-w-[280px] mb-6">
            Your administrator credentials have been verified. Your session is now active.
          </p>

          {/* Countdown indicator */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 w-full mb-6 text-xs text-slate-500 font-semibold flex items-center justify-between">
            <span>Redirecting to dashboard...</span>
            <span className="text-blue-500 font-bold bg-blue-950/50 px-2 py-0.5 rounded-lg border border-blue-900/30">
              {countdown}s
            </span>
          </div>

          <Button
            variant="primary"
            onClick={() => router.push(nextRoute)}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-transform shadow-lg shadow-blue-900/30 flex items-center justify-center space-x-1.5"
          >
            <span>Enter Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-slate-400 select-none">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-4" />
        <p className="text-xs font-semibold">Loading verification status...</p>
      </main>
    }>
      <SuccessScreen />
    </Suspense>
  );
}
