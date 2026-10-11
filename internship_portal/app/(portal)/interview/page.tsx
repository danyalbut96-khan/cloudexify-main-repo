'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, ShieldAlert, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft, Loader2, Maximize2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InterviewPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [intern, setIntern] = useState<any>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [endMessage, setEndMessage] = useState('');
  const [hasStartedFullscreen, setHasStartedFullscreen] = useState(false);

  const answersRef = useRef(answers);
  answersRef.current = answers;

  const sessionRef = useRef(session);
  sessionRef.current = session;

  // Initialize or fetch session
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch('/api/interview');
        if (res.status === 401) {
          router.push('/login');
          return;
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch interview state');

        setIntern(data.intern);

        if (data.session && data.session.isLive) {
          setSession(data.session);
          setAnswers(data.session.answers || {});
          calculateTimeLeft(data.session.expires_at);
        } else if (data.session && data.session.status !== 'in_progress' && data.intern?.pipeline_stage !== 'interview_pending') {
          setIsEnded(true);
          setEndMessage('Your interview was ended and is under review.');
        } else {
          // Auto-start session
          const startRes = await fetch('/api/interview', { method: 'POST' });
          const startData = await startRes.json();
          if (!startRes.ok) throw new Error(startData.error || 'Failed to start interview');

          setSession(startData.session);
          setAnswers(startData.session.answers || {});
          calculateTimeLeft(startData.session.expires_at);
        }
      } catch (err: any) {
        toast.error(err.message || 'Error loading interview');
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [router]);

  const calculateTimeLeft = (expiresAtStr: string) => {
    const diff = Math.floor((new Date(expiresAtStr).getTime() - Date.now()) / 1000);
    setTimeLeftSeconds(Math.max(0, diff));
  };

  // Authoritative Display Timer Countdown
  useEffect(() => {
    if (!session || isEnded || timeLeftSeconds <= 0) return;

    const interval = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit('Time limit expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [session, isEnded]);

  // Autosave answers every 5 seconds
  useEffect(() => {
    if (!session?.id || isEnded) return;

    const interval = setInterval(async () => {
      const currentAns = answersRef.current;
      if (Object.keys(currentAns).length === 0) return;

      try {
        await fetch('/api/interview/autosave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: session.id, answers: currentAns })
        });
      } catch {
        // Silent fail on autosave
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [session?.id, isEnded]);

  // Anti-Cheat: Report violation
  const reportViolation = useCallback(async (type: string) => {
    const curSession = sessionRef.current;
    if (!curSession?.id || isEnded) return;

    try {
      const res = await fetch('/api/interview/violation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: curSession.id,
          type,
          questionIndex: currentQuestionIdx
        })
      });

      const data = await res.json();
      if (data.cancelled) {
        setIsEnded(true);
        setEndMessage('Your interview was ended and is under review.');
      }
    } catch {
      // ignore
    }
  }, [currentQuestionIdx, isEnded]);

  // Anti-Cheat Listeners
  useEffect(() => {
    if (!hasStartedFullscreen || isEnded) return;

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        reportViolation('tab_switch');
      }
    };

    const handleBlur = () => {
      reportViolation('window_blur');
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && hasStartedFullscreen && !isEnded) {
        reportViolation('fullscreen_exit');
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [hasStartedFullscreen, isEnded, reportViolation]);

  const requestFullscreenMode = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    setHasStartedFullscreen(true);
  };

  const handleAnswerChange = (text: string) => {
    const q = session?.questions?.[currentQuestionIdx];
    if (!q) return;
    setAnswers(prev => ({ ...prev, [q.id]: text }));
  };

  const handleAutoSubmit = async (reason: string) => {
    if (isSubmitting || isEnded) return;
    setIsSubmitting(true);
    toast.loading(`Auto-submitting: ${reason}...`);

    try {
      await fetch('/api/interview/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session?.id, answers })
      });
      setIsEnded(true);
      setEndMessage('Your interview is completed. Please check back; your result will appear here after review.');
    } catch {
      setIsEnded(true);
      setEndMessage('Your interview is completed. Please check back; your result will appear here after review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const toastId = toast.loading('Submitting interview answers...');

    try {
      const res = await fetch('/api/interview/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session?.id, answers })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success('Interview submitted successfully!', { id: toastId });
      setIsEnded(true);
      setEndMessage('Your interview is completed. Please check back; your result will appear here after review.');
    } catch (err: any) {
      toast.error(err.message || 'Submission error', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
        <p className="text-sm text-slate-400 font-medium">Preparing your secure interview environment...</p>
      </div>
    );
  }

  // End State Screen (Neutral message)
  if (isEnded) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto text-blue-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white mb-2">Interview Concluded</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {endMessage || 'Your interview is completed. Please check back; your result will appear here after review.'}
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Fullscreen Entry Prompt
  if (!hasStartedFullscreen) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto text-blue-400">
            <Maximize2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white mb-2">Technical Interview Readiness</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Domain: <strong>{intern?.domain}</strong>  •  Time Limit: <strong>{Math.ceil(timeLeftSeconds / 60)} mins</strong>
            </p>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/70 text-left space-y-2.5 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span><strong>Fullscreen is required:</strong> The test runs in locked fullscreen mode.</span>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span><strong>Tab switches are monitored:</strong> Switching tabs or windows will terminate your interview immediately.</span>
            </div>
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span><strong>No copy/paste:</strong> Type your own thoughts concisely in 2-4 sentences.</span>
            </div>
          </div>

          <button
            onClick={requestFullscreenMode}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-blue-900/30"
          >
            Enter Fullscreen & Begin Interview
          </button>
        </div>
      </div>
    );
  }

  const questions = session?.questions || [];
  const currentQ = questions[currentQuestionIdx];
  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const isTimeCritical = timeLeftSeconds < 120;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-white text-lg tracking-tight">CloudExify</span>
          <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
            {intern?.domain}
          </span>
        </div>

        {/* Server Authoritative Display Timer */}
        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-sm ${
          isTimeCritical
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
            : 'bg-slate-800 border-slate-700 text-slate-200'
        }`}>
          <Clock className="w-4 h-4" />
          <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
        </div>
      </header>

      {/* Main Interview Workspace */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Question Stepper */}
          <div className="flex items-center gap-2">
            {questions.map((q: any, i: number) => {
              const hasAns = !!answers[q.id]?.trim();
              const isCurr = i === currentQuestionIdx;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIdx(i)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    isCurr
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-900/30'
                      : hasAns
                      ? 'bg-slate-800/80 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-900/40 text-slate-400 border-slate-800'
                  }`}
                >
                  Question {i + 1}
                </button>
              );
            })}
          </div>

          {/* Current Question Box */}
          {currentQ && (
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider font-bold">
                <span>Question {currentQuestionIdx + 1} of {questions.length}</span>
                {currentQ.topic && <span className="text-blue-400">{currentQ.topic}</span>}
              </div>

              <h3 className="text-xl font-bold text-white leading-relaxed">
                {currentQ.question}
              </h3>

              {/* Answer Input Area with Anti-Cheat Protections */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                  Your Answer (Concise text, 2 to 4 sentences)
                </label>
                <textarea
                  rows={6}
                  value={answers[currentQ.id] || ''}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  onCopy={(e) => { e.preventDefault(); toast.error('Copying is disabled during interview'); }}
                  onPaste={(e) => { e.preventDefault(); toast.error('Pasting is disabled during interview'); }}
                  onCut={(e) => { e.preventDefault(); toast.error('Cutting is disabled during interview'); }}
                  onContextMenu={(e) => { e.preventDefault(); }}
                  placeholder="Type your explanation clearly in your own words..."
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestionIdx(p => Math.max(0, p - 1))}
            disabled={currentQuestionIdx === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>

          <div className="flex items-center gap-3">
            {currentQuestionIdx < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIdx(p => Math.min(questions.length - 1, p + 1))}
                className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleManualSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-900/30"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting ? 'Submitting...' : 'Submit Interview'}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}