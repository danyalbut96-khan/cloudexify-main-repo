'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

function ErrorScreen() {
  const router = useRouter();

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
          {/* Animated Error Warning */}
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-rose-500/10 animate-ping" />
            <div className="h-16 w-16 rounded-full bg-rose-950/40 border border-rose-500/30 flex items-center justify-center text-rose-400 relative">
              <AlertCircle className="h-10 w-10" />
            </div>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white mb-2">
            Link Expired or Invalid
          </h2>
          <p className="text-slate-400 text-xs leading-relaxed max-w-[280px] mb-6">
            The verification link is invalid, expired, or has already been used to confirm your account.
          </p>

          <Button
            variant="outline"
            onClick={() => router.push('/login')}
            className="w-full py-2.5 bg-slate-950 border-slate-800 hover:bg-slate-900 text-slate-300 rounded-lg font-semibold text-sm transition-transform shadow-md flex items-center justify-center space-x-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Log In</span>
          </Button>
        </div>
      </div>
    </main>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-slate-400 select-none">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-4" />
        <p className="text-xs font-semibold">Loading verification status...</p>
      </main>
    }>
      <ErrorScreen />
    </Suspense>
  );
}
