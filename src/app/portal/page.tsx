'use client';

import React, { useState, useEffect } from 'react';
import {
  GitBranch, Search, CheckCircle, AlertCircle, Send, ChevronRight,
  Lock, Bell, BrainCircuit, Star, Trophy, Loader2, X, Plus, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { createBrowserClient } from '@supabase/ssr';

const DOMAIN_LABELS: Record<string, string> = {
  PY: 'Python Programming',
  CPP: 'C++ Programming',
  JAVA: 'Java Programming',
  DS: 'Data Science & AI',
  CYB: 'Cybersecurity',
  GEN: 'Full Stack Development',
};

const DOMAIN_COLORS: Record<string, string> = {
  PY: 'from-blue-500 to-cyan-500',
  CPP: 'from-purple-500 to-pink-500',
  JAVA: 'from-orange-500 to-red-500',
  DS: 'from-green-500 to-teal-500',
  CYB: 'from-red-500 to-rose-600',
  GEN: 'from-indigo-500 to-violet-500',
};

const RANK_MEDALS = ['🥇', '🥈', '🥉'];

interface InternData {
  id: string;
  full_name: string;
  registration_number: string;
  domain: string;
  domain_code: string;
  email: string;
}

interface LookupResult {
  intern: InternData;
  submittedCount: number;
  maxProjects: number;
  nextProjectNumber: number;
}

type Step = 'lookup' | 'submit' | 'success';

export default function PortalPage() {
  const [batchMessage, setBatchMessage] = useState('Batch 2 Registration Opening Soon! Stay tuned for announcements.');
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [publicLeaderboardOpen, setPublicLeaderboardOpen] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Lookup form
  const [fullName, setFullName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  // Project form
  const [projectTitle, setProjectTitle] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // UI state
  const [step, setStep] = useState<Step>('lookup');
  const [submittedProject, setSubmittedProject] = useState<any>(null);
  const [notifyEmail, setNotifyEmail] = useState('');

  // Public Leaderboard State
  const [leaderboardData, setLeaderboardData] = useState<Record<string, any[]>>({});
  const [leaderboardDomain, setLeaderboardDomain] = useState('PY');
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLeaderboardLoading(true);
    try {
      const res = await fetch('/api/portal/leaderboard');
      if (res.ok) {
        const data = await res.json();
        setLeaderboardData(data.leaderboards || {});
      }
    } catch {
      // Quietly ignore
    } finally {
      setLeaderboardLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetch('/api/portal/settings')
      .then(r => r.json())
      .then(d => {
        if (d.batch_coming_soon_message) setBatchMessage(d.batch_coming_soon_message);
        if (typeof d.registration_open === 'boolean') setRegistrationOpen(d.registration_open);
        if (typeof d.public_leaderboard_open === 'boolean') setPublicLeaderboardOpen(d.public_leaderboard_open);
      })
      .catch(() => { });

    fetchLeaderboard();

    // Real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'intern_analysis_settings' },
        (payload: any) => {
          const newConfig = payload.new;
          if (newConfig) {
            if (typeof newConfig.registration_open === 'boolean') setRegistrationOpen(newConfig.registration_open);
            if (typeof newConfig.public_leaderboard_open === 'boolean') setPublicLeaderboardOpen(newConfig.public_leaderboard_open);
            if (newConfig.batch_coming_soon_message) setBatchMessage(newConfig.batch_coming_soon_message);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNotifyMe = async () => {
    if (!notifyEmail || !notifyEmail.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    const t = toast.loading('Subscribing...');
    try {
      const res = await fetch('/api/portal/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: notifyEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.message || 'Subscribed successfully! We will notify you.', { id: t });
      setNotifyEmail('');
    } catch (err: any) {
      toast.error(err.message || 'Subscription failed', { id: t });
    }
  };

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLookupError('');
    setLookupResult(null);
    setSuggestions([]);
    setLookupLoading(true);
    try {
      const res = await fetch('/api/portal/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, registration_number: regNo })
      });
      const data = await res.json();
      if (!res.ok) {
        setLookupError(data.error || 'Lookup failed.');
      } else if (data.type === 'suggestions') {
        setSuggestions(data.suggestions || []);
        if (!data.suggestions || data.suggestions.length === 0) {
          setLookupError('No intern found with that name query.');
        }
      } else {
        setLookupResult(data);
      }
    } catch {
      setLookupError('Network error. Please try again.');
    } finally {
      setLookupLoading(false);
    }
  };

  const selectInternProfile = async (name: string, reg: string) => {
    setFullName(name);
    setRegNo(reg);
    setSuggestions([]);
    setLookupError('');
    setLookupLoading(true);
    try {
      const res = await fetch('/api/portal/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: name, registration_number: reg })
      });
      const data = await res.json();
      if (!res.ok) {
        setLookupError(data.error || 'Lookup failed.');
      } else {
        setLookupResult(data);
      }
    } catch {
      setLookupError('Network error. Please try again.');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupResult) return;
    setSubmitError('');
    setSubmitLoading(true);
    try {
      const res = await fetch('/api/portal/submit-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intern_id: lookupResult.intern.id,
          registration_number: lookupResult.intern.registration_number,
          intern_name: lookupResult.intern.full_name,
          project_title: projectTitle,
          repo_url: repoUrl,
          domain_code: lookupResult.intern.domain_code,
          project_number: lookupResult.nextProjectNumber,
          description
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || 'Submission failed.');
      } else {
        setSubmittedProject(data.project);
        setStep('success');
        setProjectTitle('');
        setRepoUrl('');
        setDescription('');
        // Update count
        setLookupResult(prev => prev ? {
          ...prev,
          submittedCount: data.submittedCount,
          nextProjectNumber: data.submittedCount + 1
        } : prev);
      }
    } catch {
      setSubmitError('Network error. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSubmitAnother = () => {
    setSubmittedProject(null);
    setSubmitError('');
    if (lookupResult && lookupResult.submittedCount < lookupResult.maxProjects) {
      setStep('submit');
    } else {
      setStep('lookup');
      setLookupResult(null);
      setFullName('');
      setRegNo('');
      setSuggestions([]);
    }
  };

  const resetLookup = () => {
    setStep('lookup');
    setLookupResult(null);
    setFullName('');
    setRegNo('');
    setSuggestions([]);
    setLookupError('');
  };

  const domainColor = lookupResult ? (DOMAIN_COLORS[lookupResult.intern.domain_code] || 'from-blue-500 to-indigo-500') : '';

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      {/* Animated background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">CloudExify</span>
              <span className="text-blue-400 font-extrabold text-xl">.</span>
              <span className="text-xs text-slate-400 ml-2 font-medium">Intern Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>Portal Active</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-10">

        {/* Hero */}
        <div className="text-center space-y-4 pb-4">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold px-4 py-1.5 rounded-full">
            <Star className="w-3 h-3" />
            CloudExify Internship Program 2026
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Submit Your<br />
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Internship Projects
            </span>
          </h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
            Submit up to {lookupResult?.maxProjects ?? 4} GitHub projects for AI-powered analysis and compete for top rankings in your domain.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* LEFT — Registration Closed */}
          <div className="lg:col-span-2 space-y-5">

            {/* Registration card */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 to-transparent pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-sm">New Registration</h2>
                    <p className="text-xs text-amber-400 font-medium">Currently Closed</p>
                  </div>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-5">
                  <p className="text-amber-200/80 text-xs leading-relaxed font-medium">🚀 {batchMessage}</p>
                </div>

                <p className="text-slate-400 text-xs leading-relaxed mb-5">
                  We are currently not accepting new intern registrations. If you are already registered, head over to the project submission section.
                </p>

                {/* Notify me */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                    <Bell className="w-3 h-3" /> Notify me when registration opens
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={notifyEmail}
                      onChange={e => setNotifyEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="flex-1 bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <button
                      onClick={handleNotifyMe}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
                    >
                      Notify Me
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Program Highlights</h3>
              {[
                { label: 'Projects per Intern', value: '4 Max', color: 'text-blue-400' },
                { label: 'Marks per Project', value: '25 pts', color: 'text-violet-400' },
                { label: 'Total Score', value: '100 pts', color: 'text-cyan-400' },
                { label: 'AI-Powered Analysis', value: '5 Criteria', color: 'text-green-400' },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between py-1.5 border-b border-slate-800 last:border-0">
                  <span className="text-xs text-slate-400">{s.label}</span>
                  <span className={`text-xs font-bold ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Domain codes */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Domain Codes</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(DOMAIN_LABELS).map(([code, label]) => (
                  <div key={code} className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/40">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-r ${DOMAIN_COLORS[code]} text-white`}>{code}</span>
                    <span className="text-[10px] text-slate-300 leading-tight">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — Project Submission */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden">

              {/* Card header */}
              <div className="px-6 py-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <GitBranch className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white">Project Submission</h2>
                    <p className="text-xs text-slate-400">For registered interns only</p>
                  </div>
                </div>

                {/* Step indicator */}
                <div className="flex items-center gap-2 mt-4">
                  {(['lookup', 'submit', 'success'] as Step[]).map((s, i) => (
                    <React.Fragment key={s}>
                      <div className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${step === s ? 'text-blue-400' : i < ['lookup', 'submit', 'success'].indexOf(step) ? 'text-green-400' : 'text-slate-600'}`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${step === s ? 'border-blue-500 bg-blue-500/20 text-blue-400' : i < ['lookup', 'submit', 'success'].indexOf(step) ? 'border-green-500 bg-green-500/20 text-green-400' : 'border-slate-700 text-slate-600'}`}>
                          {i < ['lookup', 'submit', 'success'].indexOf(step) ? '✓' : i + 1}
                        </div>
                        <span className="hidden sm:inline">{s === 'lookup' ? 'Identify' : s === 'submit' ? 'Submit' : 'Done'}</span>
                      </div>
                      {i < 2 && <ChevronRight className="w-3 h-3 text-slate-700" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="p-6">

                {/* STEP 1 — Lookup */}
                {step === 'lookup' && (
                  <form onSubmit={handleLookup} className="space-y-5">
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-1">Identify Yourself</h3>
                      <p className="text-xs text-slate-400">Enter your details exactly as registered. Registration number is case-insensitive.</p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-slate-300 mb-1.5 block">Full Name (Search by Name)</label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          placeholder="e.g. Ahmed Khan"
                          className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-300 mb-1.5 block">Registration ID (Direct Lookup)</label>
                        <input
                          type="text"
                          value={regNo}
                          onChange={e => setRegNo(e.target.value.toUpperCase())}
                          placeholder="e.g. CX-INT-2026-PY-001"
                          className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all font-mono tracking-wider"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">Enter your Registration ID or type your name above to search.</p>
                      </div>
                    </div>

                    {suggestions.length > 0 && (
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                        <p className="text-[11px] font-bold text-slate-400">Match suggestions (Click to select):</p>
                        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                          {suggestions.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => selectInternProfile(s.full_name, s.registration_number)}
                              className="text-left px-3 py-2 bg-slate-850 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-xs flex justify-between items-center transition-all group"
                            >
                              <div>
                                <span className="font-semibold text-white group-hover:text-blue-400 transition-colors">{s.full_name}</span>
                                <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{s.registration_number}</span>
                              </div>
                              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">{s.domain}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {lookupError && (
                      <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl px-4 py-3 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{lookupError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={lookupLoading}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm transition-all shadow-lg shadow-blue-900/30"
                    >
                      {lookupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      {lookupLoading ? 'Searching...' : 'Find My Profile'}
                    </button>

                    {/* Intern card after lookup */}
                    {lookupResult && (
                      <div className={`rounded-xl border border-slate-700 overflow-hidden`}>
                        <div className={`h-1.5 bg-gradient-to-r ${domainColor}`} />
                        <div className="p-4 bg-slate-800/40">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span className="text-xs font-semibold text-green-400">Profile Found</span>
                              </div>
                              <p className="font-bold text-white text-sm">{lookupResult.intern.full_name}</p>
                              <p className="text-xs text-slate-400 font-mono">{lookupResult.intern.registration_number}</p>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg bg-gradient-to-r ${domainColor} text-white shrink-0`}>
                              {lookupResult.intern.domain_code}
                            </span>
                          </div>
                          <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                            <span className="text-xs text-slate-400">{lookupResult.intern.domain}</span>
                            <span className="text-xs font-semibold text-white">
                              {lookupResult.submittedCount}/{lookupResult.maxProjects} projects submitted
                            </span>
                          </div>

                          {/* Progress dots */}
                          <div className="flex gap-1.5 mt-2">
                            {Array.from({ length: lookupResult.maxProjects }).map((_, i) => (
                              <div
                                key={i}
                                className={`flex-1 h-1.5 rounded-full transition-all ${i < lookupResult.submittedCount ? `bg-gradient-to-r ${domainColor}` : 'bg-slate-700'}`}
                              />
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => setStep('submit')}
                            disabled={lookupResult.submittedCount >= lookupResult.maxProjects}
                            className={`mt-3 w-full flex items-center justify-center gap-2 font-semibold rounded-lg py-2.5 text-xs transition-all ${lookupResult.submittedCount >= lookupResult.maxProjects
                                ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90 text-white shadow-lg'
                              }`}
                          >
                            {lookupResult.submittedCount >= lookupResult.maxProjects
                              ? '✅ All projects submitted!'
                              : <><Plus className="w-3.5 h-3.5" /> Submit Project #{lookupResult.nextProjectNumber}</>
                            }
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                )}

                {/* STEP 2 — Submit Project */}
                {step === 'submit' && lookupResult && (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Intern mini-card */}
                    <div className={`rounded-xl border border-slate-700 p-3 bg-slate-800/30 flex items-center justify-between gap-3`}>
                      <div>
                        <p className="text-xs font-bold text-white">{lookupResult.intern.full_name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{lookupResult.intern.registration_number}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded bg-gradient-to-r ${domainColor} text-white`}>
                          {lookupResult.intern.domain_code}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-300 bg-slate-700 px-2 py-0.5 rounded">
                          Project #{lookupResult.nextProjectNumber}
                        </span>
                        <button type="button" onClick={resetLookup} className="text-slate-500 hover:text-slate-300 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-slate-300 mb-1.5 block">Project Title <span className="text-red-400">*</span></label>
                        <input
                          type="text"
                          required
                          value={projectTitle}
                          onChange={e => setProjectTitle(e.target.value)}
                          placeholder="e.g. Personal Finance Tracker"
                          className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                          GitHub Repository URL <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <GitBranch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input
                            type="url"
                            required
                            value={repoUrl}
                            onChange={e => setRepoUrl(e.target.value)}
                            placeholder="https://github.com/username/repo"
                            className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all font-mono text-xs"
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">Must be a public GitHub repository</p>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                          Short Description <span className="text-slate-500">(optional)</span>
                        </label>
                        <textarea
                          value={description}
                          onChange={e => setDescription(e.target.value.slice(0, 300))}
                          rows={3}
                          placeholder="Briefly describe what your project does..."
                          className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all resize-none"
                        />
                        <p className="text-[10px] text-slate-500 mt-1 text-right">{description.length}/300</p>
                      </div>
                    </div>

                    {/* Auto-filled info */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Domain', value: lookupResult.intern.domain_code },
                        { label: 'Project #', value: `#${lookupResult.nextProjectNumber}` },
                        { label: 'Max Score', value: '25 pts' }
                      ].map(info => (
                        <div key={info.label} className="bg-slate-800/40 border border-slate-700/60 rounded-lg p-2.5 text-center">
                          <p className="text-[10px] text-slate-500 mb-0.5">{info.label}</p>
                          <p className="text-xs font-bold text-white">{info.value}</p>
                        </div>
                      ))}
                    </div>

                    {submitError && (
                      <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl px-4 py-3 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setStep('lookup')}
                        className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-sm transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={submitLoading}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90 disabled:opacity-50 text-white font-semibold rounded-xl py-3 text-sm transition-all shadow-lg shadow-blue-900/30"
                      >
                        {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {submitLoading ? 'Submitting...' : 'Submit Project'}
                      </button>
                    </div>
                  </form>
                )}

                {/* STEP 3 — Success */}
                {step === 'success' && lookupResult && submittedProject && (
                  <div className="text-center space-y-6 py-4">
                    {/* Success animation */}
                    <div className="relative mx-auto w-20 h-20">
                      <div className="absolute inset-0 rounded-full bg-green-500/10 animate-ping" />
                      <div className="relative w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center">
                        <CheckCircle className="w-10 h-10 text-green-400" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-white mb-2">Project Submitted! 🎉</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        Your project has been received and is queued for AI analysis. Results will appear in the leaderboard once reviewed.
                      </p>
                    </div>

                    {/* Submission summary */}
                    <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 text-left space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Project</span>
                        <span className="text-white font-medium">{submittedProject.project_title}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Number</span>
                        <span className="text-white font-medium">#{submittedProject.project_number}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Domain</span>
                        <span className={`font-bold text-[10px] px-2 py-0.5 rounded bg-gradient-to-r ${domainColor} text-white`}>
                          {submittedProject.domain_code}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Status</span>
                        <span className="text-amber-400 font-medium">⏳ Pending Analysis</span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Projects submitted</span>
                        <span className="font-bold text-white">{lookupResult.submittedCount} / {lookupResult.maxProjects}</span>
                      </div>
                      <div className="flex gap-1.5">
                        {Array.from({ length: lookupResult.maxProjects }).map((_, i) => (
                          <div key={i} className={`flex-1 h-2 rounded-full ${i < lookupResult.submittedCount ? `bg-gradient-to-r ${domainColor}` : 'bg-slate-700'}`} />
                        ))}
                      </div>
                    </div>

                    {lookupResult.submittedCount < lookupResult.maxProjects ? (
                      <button
                        onClick={handleSubmitAnother}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90 text-white font-semibold rounded-xl py-3 text-sm transition-all shadow-lg"
                      >
                        <Plus className="w-4 h-4" />
                        Submit Project #{lookupResult.nextProjectNumber}
                      </button>
                    ) : (
                      <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4">
                        <Trophy className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                        <p className="text-violet-300 text-sm font-semibold">All {lookupResult.maxProjects} projects submitted!</p>
                        <p className="text-slate-400 text-xs mt-1">You are all done. Good luck with the AI analysis! 🏆</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Public Leaderboards Section */}
        {publicLeaderboardOpen && (
        <div className="pt-8">
          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm p-6 sm:p-8 space-y-6">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <h2 className="text-xl font-black text-white">Public Leaderboards</h2>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Real-time top 10 rankings per domain. Registration numbers are shown for privacy.
                </p>
              </div>
              <button
                onClick={fetchLeaderboard}
                className="w-fit flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>

            {/* Domain Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-800/80 pb-4">
              {Object.entries(DOMAIN_LABELS).map(([code, label]) => (
                <button
                  key={code}
                  onClick={() => setLeaderboardDomain(code)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold border transition-all ${leaderboardDomain === code
                      ? `bg-gradient-to-r ${DOMAIN_COLORS[code]} text-white border-transparent shadow-lg shadow-blue-900/20`
                      : 'bg-slate-800/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                    }`}
                >
                  <span className="text-[10px] opacity-75">{code}</span>
                  <span>{label.replace(' Programming', '')}</span>
                </button>
              ))}
            </div>

            {/* Leaderboard Table / Content */}
            {leaderboardLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : !leaderboardData[leaderboardDomain] || leaderboardData[leaderboardDomain].length === 0 ? (
              <div className="text-center py-12 bg-slate-950/20 rounded-xl border border-slate-800/40">
                <Star className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-xs font-semibold">No analyzed projects in this domain yet.</p>
                <p className="text-slate-600 text-[10px] mt-1">Scores will appear once AI evaluations are completed by admins.</p>
              </div>
            ) : (
              <div className="overflow-hidden border border-slate-800/80 rounded-xl bg-slate-950/20 divide-y divide-slate-800/60">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-slate-900/20 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <div className="col-span-2 text-center">Rank</div>
                  <div className="col-span-5">Registration ID</div>
                  <div className="col-span-3 text-center">Projects</div>
                  <div className="col-span-2 text-right">Total Score</div>
                </div>

                {/* Table Rows */}
                {leaderboardData[leaderboardDomain].map((row, idx) => {
                  const isTop3 = idx < 3;
                  const colors = DOMAIN_COLORS[leaderboardDomain];
                  return (
                    <div
                      key={row.registration_number}
                      className={`grid grid-cols-12 gap-2 px-4 py-3.5 items-center hover:bg-slate-800/10 transition-colors ${isTop3 ? 'bg-slate-900/10' : ''
                        }`}
                    >
                      {/* Rank / Medal */}
                      <div className="col-span-2 text-center">
                        {idx < 3 ? (
                          <span className="text-lg">{RANK_MEDALS[idx]}</span>
                        ) : (
                          <span className="text-xs font-bold text-slate-500">#{idx + 1}</span>
                        )}
                      </div>

                      {/* Reg Number */}
                      <div className="col-span-5">
                        <span className="text-xs sm:text-sm font-semibold text-white font-mono tracking-wide">
                          {row.registration_number}
                        </span>
                      </div>

                      {/* Projects count */}
                      <div className="col-span-3 text-center">
                        <span className="text-xs text-slate-400 font-medium">
                          {row.projects_count} submitted
                        </span>
                      </div>

                      {/* Score */}
                      <div className="col-span-2 text-right">
                        <span className={`text-sm sm:text-base font-black bg-gradient-to-r ${colors} bg-clip-text text-transparent`}>
                          {row.total_score.toFixed(1)}
                        </span>
                        <span className="text-[10px] text-slate-600 font-medium ml-0.5">/100</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/50 mt-16 py-6 text-center">
        <p className="text-xs text-slate-600">© 2026 CloudExify Private Limited · Internship Program</p>
      </footer>
    </div>
  );
}
