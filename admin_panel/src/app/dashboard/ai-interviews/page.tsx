'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import {
  BrainCircuit, Users, CheckCircle2, Clock, XCircle, AlertTriangle,
  RotateCcw, Sliders, Search, Filter, Download, ExternalLink, Mail, ShieldAlert,
  ChevronDown, ChevronUp, Award, FileText, Check, X, Shield, RefreshCw,
  HelpCircle, Eye, AlertOctagon, Sparkles, UserCheck, UserX, ArrowUpDown
} from 'lucide-react';

interface Candidate {
  id: string;
  full_name: string;
  email: string;
  whatsapp?: string;
  domain: string;
  skill_level: string;
  semester: number;
  university?: string;
  university_registration_number?: string;
  interest?: string;
  linkedin_url?: string;
  resume_url?: string;
  pipeline_stage: string;
  status: string;
  batch_id?: string;
  batches?: { id: string; name: string; status: string };
  interview_status: string;
  ai_score: number | null;
  ai_suggestion: string | null;
  violation_count: number;
  retry_count: number;
  domain_rank: number | null;
  created_at: string;
  session?: any;
}

interface Batch {
  id: string;
  name: string;
  status: string;
}

interface InterviewSetting {
  id: string;
  domain: string;
  expertise_level: string;
  semester_band: string;
  question_count: number;
  time_limit_minutes: number;
  difficulty_guidance: string;
  prompt_template: string;
  passing_threshold: number;
  tab_switch_cancel_enabled: boolean;
  version: number;
}

export default function AIInterviewsPage() {
  const [activeTab, setActiveTab] = useState<'candidates' | 'settings'>('candidates');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'score_desc' | 'score_asc' | 'date_desc'>('score_desc');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Candidate Detail Modal state
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [activeCandidate, setActiveCandidate] = useState<any>(null);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [candidateAuditLogs, setCandidateAuditLogs] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);

  // Score override state
  const [overrideScoreInput, setOverrideScoreInput] = useState<string>('');
  const [overrideReasonInput, setOverrideReasonInput] = useState<string>('');
  const [savingOverride, setSavingOverride] = useState<boolean>(false);

  // Retry state
  const [retryReasonInput, setRetryReasonInput] = useState<string>('');
  const [grantingRetry, setGrantingRetry] = useState<boolean>(false);

  // Settings Tab state
  const [settingsList, setSettingsList] = useState<InterviewSetting[]>([]);
  const [settingsLoading, setSettingsLoading] = useState<boolean>(false);
  const [editingSetting, setEditingSetting] = useState<InterviewSetting | null>(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);
  const [savingSetting, setSavingSetting] = useState<boolean>(false);

  // 1. Fetch Candidates List
  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedBatch !== 'all') params.set('batch_id', selectedBatch);
      if (selectedDomain !== 'all') params.set('domain', selectedDomain);

      const res = await fetch(`/api/interview/admin/candidates?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load candidates');

      setCandidates(data.candidates || []);
      setBatches(data.batches || []);
    } catch (err: any) {
      toast.error(err.message || 'Error fetching candidates');
    } finally {
      setLoading(false);
    }
  }, [selectedBatch, selectedDomain]);

  useEffect(() => {
    if (activeTab === 'candidates') {
      fetchCandidates();
    }
  }, [fetchCandidates, activeTab]);

  // Realtime subscription: live updates when interview sessions are submitted or scored
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('admin_interviews_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'interview_sessions' },
        () => {
          if (activeTab === 'candidates') fetchCandidates();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCandidates, activeTab]);

  // 2. Fetch Settings
  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const res = await fetch('/api/interview/admin/settings');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load settings');
      setSettingsList(data.settings || []);
    } catch (err: any) {
      toast.error(err.message || 'Error fetching interview configurations');
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'settings') {
      fetchSettings();
    }
  }, [fetchSettings, activeTab]);

  // 3. Open Candidate Detail
  const openCandidateDetail = async (internId: string) => {
    setDetailLoading(true);
    setDetailModalOpen(true);
    setOverrideScoreInput('');
    setOverrideReasonInput('');
    setRetryReasonInput('');

    try {
      const res = await fetch(`/api/interview/admin/candidates/${internId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch candidate details');

      setActiveCandidate(data.candidate);
      setActiveSession(data.session);
      setCandidateAuditLogs(data.audit_logs || []);

      if (data.session) {
        setOverrideScoreInput(String(data.session.override_score ?? data.session.ai_score ?? ''));
      }
    } catch (err: any) {
      toast.error(err.message || 'Error loading details');
      setDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // 4. Handle Decision (Single or Bulk)
  const handleDecision = async (
    ids: string[], 
    decision: 'shortlist' | 'reject' | 'hold' | 'call_interview', 
    reason?: string
  ) => {
    if (ids.length === 0) return;

    const actionNames: Record<string, string> = {
      call_interview: 'call for interview',
      shortlist: 'shortlist',
      reject: 'reject and release seat for',
      hold: 'place on hold'
    };

    if (!confirm(`Are you sure you want to ${actionNames[decision]} ${ids.length} candidate(s)?`)) {
      return;
    }

    const toastId = toast.loading(`Processing ${decision} decision...`);
    try {
      const res = await fetch('/api/interview/admin/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intern_ids: ids,
          decision,
          reason: reason || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');

      toast.success(`Successfully processed ${ids.length} candidate(s)!`, { id: toastId });
      setSelectedIds([]);
      if (detailModalOpen && activeCandidate) {
        openCandidateDetail(activeCandidate.id);
      }
      fetchCandidates();
    } catch (err: any) {
      toast.error(err.message || 'Failed to execute decision', { id: toastId });
    }
  };

  // Resend Lifecycle Email
  const handleResendEmail = async (type: string) => {
    if (!activeCandidate) return;
    const toastId = toast.loading(`Resending ${type} email...`);
    try {
      const res = await fetch('/api/interview/admin/resend-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intern_id: activeCandidate.id,
          email_type: type
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend email');
      toast.success(data.message, { id: toastId });
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  // 5. Handle Score Override
  const handleSaveScoreOverride = async () => {
    if (!activeCandidate) return;
    const num = Number(overrideScoreInput);
    if (isNaN(num) || num < 0 || num > 100) {
      toast.error('Please enter a valid score between 0 and 100');
      return;
    }
    if (!overrideReasonInput.trim()) {
      toast.error('Audit requires a reason for overriding the AI score');
      return;
    }

    setSavingOverride(true);
    try {
      const res = await fetch('/api/interview/admin/override-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intern_id: activeCandidate.id,
          new_score: num,
          reason: overrideReasonInput.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to override score');

      toast.success('Score updated and audit logged');
      openCandidateDetail(activeCandidate.id);
      fetchCandidates();
    } catch (err: any) {
      toast.error(err.message || 'Override failed');
    } finally {
      setSavingOverride(false);
    }
  };

  // 6. Handle Grant Retry
  const handleGrantRetry = async () => {
    if (!activeCandidate) return;
    if (!confirm(`Grant 1-time retry to ${activeCandidate.full_name}? This will reset their interview session.`)) {
      return;
    }

    setGrantingRetry(true);
    try {
      const res = await fetch('/api/interview/admin/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intern_id: activeCandidate.id,
          reason: retryReasonInput.trim() || 'Admin granted technical re-attempt'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to grant retry');

      toast.success('Retry granted and notification email sent!');
      openCandidateDetail(activeCandidate.id);
      fetchCandidates();
    } catch (err: any) {
      toast.error(err.message || 'Retry grant failed');
    } finally {
      setGrantingRetry(false);
    }
  };

  // 7. Save Settings
  const handleSaveSetting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSetting) return;

    setSavingSetting(true);
    try {
      const res = await fetch('/api/interview/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSetting)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings');

      toast.success('Interview configuration saved!');
      setSettingsModalOpen(false);
      fetchSettings();
    } catch (err: any) {
      toast.error(err.message || 'Error saving configuration');
    } finally {
      setSavingSetting(false);
    }
  };

  // 8. Export CSV
  const exportToCSV = () => {
    if (candidates.length === 0) {
      toast.error('No candidate data to export');
      return;
    }

    const headers = [
      'Registration Number',
      'Name',
      'Email',
      'Domain',
      'Semester',
      'Skill Level',
      'Pipeline Stage',
      'AI Score',
      'Domain Rank',
      'Violations',
      'Created At'
    ];

    const rows = candidates.map(c => [
      c.university_registration_number || c.id.slice(0, 8),
      `"${c.full_name.replace(/"/g, '""')}"`,
      c.email,
      c.domain,
      c.semester,
      c.skill_level,
      c.pipeline_stage,
      c.ai_score ?? 'N/A',
      c.domain_rank ?? 'N/A',
      c.violation_count,
      new Date(c.created_at).toLocaleDateString()
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cloudexify_interview_candidates_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & Sort Candidates
  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = 
      c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.university_registration_number && c.university_registration_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.university && c.university.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStage = 
      selectedStage === 'all' ||
      (selectedStage === 'flagged' && (c.violation_count > 0 || c.session?.status === 'cancelled_tab_switch')) ||
      c.pipeline_stage === selectedStage;

    return matchesSearch && matchesStage;
  }).sort((a, b) => {
    if (sortBy === 'score_desc') return (b.ai_score ?? -1) - (a.ai_score ?? -1);
    if (sortBy === 'score_asc') return (a.ai_score ?? 999) - (b.ai_score ?? 999);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const totalCount = candidates.length;
  const registeredCount = candidates.filter(c => c.pipeline_stage === 'registered').length;
  const evaluatedCount = candidates.filter(c => c.ai_score !== null).length;
  const shortlistedCount = candidates.filter(c => c.pipeline_stage === 'shortlisted').length;
  const reviewCount = candidates.filter(c => c.pipeline_stage === 'under_review').length;
  const rejectedCount = candidates.filter(c => c.pipeline_stage === 'rejected').length;
  const flaggedCount = candidates.filter(c => c.violation_count > 0 || c.session?.status === 'cancelled_tab_switch').length;

  return (
    <PageWrapper title="Technical Interviews & Admissions Desk">
      {/* Top Banner & Tab Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BrainCircuit className="w-7 h-7 text-indigo-400" />
            Technical Interviews & Admissions Desk
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Review candidates, invite them for technical interviews, inspect evaluation scores & proctoring, and decide admissions.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-slate-100 border border-slate-200 p-1 rounded-xl flex">
            <button
              onClick={() => setActiveTab('candidates')}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'candidates'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Candidates ({totalCount})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'settings'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Interview Rubrics
            </button>
          </div>

          <Button
            variant="outline"
            onClick={fetchCandidates}
            className="flex items-center gap-2 border-slate-700 text-gray-300 hover:bg-slate-800"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            onClick={exportToCSV}
            className="flex items-center gap-2 border-slate-700 text-gray-300 hover:bg-slate-800"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Export CSV
          </Button>
        </div>
      </div>

      {activeTab === 'candidates' ? (
        <>
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-7 gap-3 mb-6">
            <Card className="p-4 bg-white border-slate-200 shadow-sm">
              <div className="text-xs text-blue-400 uppercase font-semibold">Awaiting Call</div>
              <div className="text-2xl font-bold text-blue-400 mt-1">{registeredCount}</div>
            </Card>
            <Card className="p-4 bg-white border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 uppercase font-semibold">Total Applicants</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</div>
            </Card>
            <Card className="p-4 bg-white border-slate-200 shadow-sm">
              <div className="text-xs text-blue-400 uppercase font-semibold">AI Completed</div>
              <div className="text-2xl font-bold text-blue-400 mt-1">{evaluatedCount}</div>
            </Card>
            <Card className="p-4 bg-white border-slate-200 shadow-sm">
              <div className="text-xs text-emerald-400 uppercase font-semibold">Shortlisted</div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{shortlistedCount}</div>
            </Card>
            <Card className="p-4 bg-white border-slate-200 shadow-sm">
              <div className="text-xs text-amber-400 uppercase font-semibold">Under Review</div>
              <div className="text-2xl font-bold text-amber-400 mt-1">{reviewCount}</div>
            </Card>
            <Card className="p-4 bg-white border-slate-200 shadow-sm">
              <div className="text-xs text-rose-400 uppercase font-semibold">Rejected</div>
              <div className="text-2xl font-bold text-rose-400 mt-1">{rejectedCount}</div>
            </Card>
            <Card className="p-4 bg-white border-slate-200 shadow-sm">
              <div className="text-xs text-red-400 uppercase font-semibold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Flagged
              </div>
              <div className="text-2xl font-bold text-red-400 mt-1">{flaggedCount}</div>
            </Card>
          </div>

          {/* Filters & Search Controls */}
          <Card className="p-4 bg-white border-slate-200 shadow-sm mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Batch</label>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-sm text-slate-800 rounded-lg p-2.5 focus:border-indigo-500 outline-none"
                >
                  <option value="all">All Batches</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.status})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Domain</label>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-sm text-slate-800 rounded-lg p-2.5 focus:border-indigo-500 outline-none"
                >
                  <option value="all">All Domains</option>
                  <option value="Python Programming">Python Programming</option>
                  <option value="Full Stack Development">Full Stack Development</option>
                  <option value="Data Science & AI Basics">Data Science & AI Basics</option>
                  <option value="Cybersecurity Fundamentals">Cybersecurity Fundamentals</option>
                  <option value="Java Programming">Java Programming</option>
                  <option value="C++ Programming">C++ Programming</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Stage</label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-sm text-slate-800 rounded-lg p-2.5 focus:border-indigo-500 outline-none"
                >
                  <option value="all">All Pipeline Stages</option>
                  <option value="registered">Awaiting Interview Call (Registered)</option>
                  <option value="interview_pending">Interview Pending</option>
                  <option value="interview_completed">Interview Completed</option>
                  <option value="under_review">Under Review / Hold</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="rejected">Rejected</option>
                  <option value="flagged">⚠️ Anti-Cheat Flagged</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 text-sm text-slate-800 rounded-lg p-2.5 focus:border-indigo-500 outline-none"
                >
                  <option value="score_desc">Score: High to Low</option>
                  <option value="score_asc">Score: Low to High</option>
                  <option value="date_desc">Registration: Newest</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Search</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search candidate or reg no..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-sm text-slate-800 rounded-lg pl-9 pr-3 py-2.5 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </Card>

          {selectedIds.length > 0 && (
            <div className="sticky top-4 z-20 mb-4 bg-indigo-950/90 border border-indigo-500/50 backdrop-blur-md rounded-xl p-3 px-5 flex items-center justify-between shadow-2xl">
              <div className="flex items-center gap-3 text-sm text-indigo-200">
                <span className="font-bold text-white bg-indigo-600 px-2.5 py-0.5 rounded-full text-xs">
                  {selectedIds.length}
                </span>
                <span>Candidates selected for bulk action</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleDecision(selectedIds, 'call_interview')}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Bulk Call for Interview
                </Button>
                <Button
                  onClick={() => handleDecision(selectedIds, 'shortlist')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Bulk Shortlist
                </Button>
                <Button
                  onClick={() => handleDecision(selectedIds, 'hold')}
                  className="bg-amber-600 hover:bg-amber-500 text-white text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  Bulk Hold
                </Button>
                <Button
                  onClick={() => handleDecision(selectedIds, 'reject')}
                  className="bg-rose-600 hover:bg-rose-500 text-white text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  <UserX className="w-3.5 h-3.5" />
                  Bulk Reject
                </Button>
                <button
                  onClick={() => setSelectedIds([])}
                  className="text-xs text-slate-600 hover:text-slate-900 ml-2 underline"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Candidates List Table */}
          <Card className="overflow-hidden bg-slate-900 border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 font-bold uppercase tracking-wider">
                    <th className="p-3.5 pl-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.length > 0 && selectedIds.length === filteredCandidates.length}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds(filteredCandidates.map(c => c.id));
                          else setSelectedIds([]);
                        }}
                        className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 cursor-pointer"
                      />
                    </th>
                    <th className="p-3.5">Candidate Details</th>
                    <th className="p-3.5">Domain & Semester</th>
                    <th className="p-3.5">AI Assessment Score</th>
                    <th className="p-3.5">Domain Rank</th>
                    <th className="p-3.5">Anti-Cheat Proctor</th>
                    <th className="p-3.5">Stage</th>
                    <th className="p-3.5 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-medium bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-slate-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-500 mb-2" />
                        Loading interview pipeline candidates...
                      </td>
                    </tr>
                  ) : filteredCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-slate-500">
                        No candidates match your current search filters.
                      </td>
                    </tr>
                  ) : (
                    filteredCandidates.map(cand => {
                      const isSelected = selectedIds.includes(cand.id);
                      const isCancelled = cand.session?.status === 'cancelled_tab_switch';

                      let scoreBadgeColor = 'bg-white text-slate-500 border-slate-700';
                      if (cand.ai_score !== null) {
                        if (cand.ai_score >= 70) scoreBadgeColor = 'bg-emerald-950/70 text-emerald-400 border-emerald-800';
                        else if (cand.ai_score >= 50) scoreBadgeColor = 'bg-amber-950/70 text-amber-400 border-amber-800';
                        else scoreBadgeColor = 'bg-rose-950/70 text-rose-400 border-rose-800';
                      }

                      return (
                        <tr
                          key={cand.id}
                          className={`hover:bg-slate-50/70 transition-colors ${
                            isSelected ? 'bg-indigo-950/30' : ''
                          }`}
                        >
                          <td className="p-3.5 pl-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedIds([...selectedIds, cand.id]);
                                else setSelectedIds(selectedIds.filter(id => id !== cand.id));
                              }}
                              className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 cursor-pointer"
                            />
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              {cand.full_name}
                              {cand.batches && (
                                <span className="text-[10px] bg-slate-800 text-indigo-300 px-1.5 py-0.5 rounded border border-slate-700">
                                  {cand.batches.name}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500">{cand.email}</div>
                            <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                              Reg: {cand.university_registration_number || 'N/A'}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="text-slate-800 text-xs font-semibold">{cand.domain}</div>
                            <div className="text-[11px] text-slate-500">
                              Sem {cand.semester} • {cand.skill_level}
                            </div>
                          </td>
                          <td className="p-3.5">
                            {cand.ai_score !== null ? (
                              <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${scoreBadgeColor}`}>
                                  {cand.ai_score}%
                                </span>
                                {cand.session?.override_score !== null && cand.session?.override_score !== undefined && (
                                  <span className="text-[10px] text-indigo-400 bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-800">
                                    Overridden
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500 italic">
                                {cand.pipeline_stage === 'interview_pending' ? 'Pending test' : 'No submission'}
                              </span>
                            )}
                          </td>
                          <td className="p-3.5">
                            {cand.domain_rank ? (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700 flex items-center gap-1 w-fit">
                                <Award className="w-3 h-3 text-amber-400" />
                                #{cand.domain_rank}
                              </span>
                            ) : (
                              <span className="text-gray-500 text-xs">-</span>
                            )}
                          </td>
                          <td className="p-3.5">
                            {isCancelled ? (
                              <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-red-950 text-red-400 border border-red-800 flex items-center gap-1 w-fit">
                                <AlertOctagon className="w-3 h-3" /> Tab Switch Cancel
                              </span>
                            ) : cand.violation_count > 0 ? (
                              <span className="px-2 py-0.5 text-[11px] font-medium rounded bg-amber-950/80 text-amber-400 border border-amber-800 flex items-center gap-1 w-fit">
                                <ShieldAlert className="w-3 h-3" /> {cand.violation_count} Violation(s)
                              </span>
                            ) : (
                              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Clean
                              </span>
                            )}
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                              cand.pipeline_stage === 'registered' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                              cand.pipeline_stage === 'interview_pending' ? 'bg-indigo-950 text-indigo-400 border border-indigo-800' :
                              cand.pipeline_stage === 'shortlisted' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                              cand.pipeline_stage === 'rejected' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                              cand.pipeline_stage === 'under_review' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                              'bg-slate-800 text-gray-300 border border-slate-700'
                            }`}>
                              {cand.pipeline_stage.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-3.5 text-right pr-4">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openCandidateDetail(cand.id)}
                                className="h-8 text-xs border-slate-700 text-indigo-300 hover:bg-slate-800"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1" />
                                Review
                              </Button>
                              <button
                                onClick={() => handleDecision([cand.id], 'shortlist')}
                                title="Quick Shortlist"
                                className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-400 transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDecision([cand.id], 'reject')}
                                title="Quick Reject"
                                className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-400 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (

        /* Settings & Rubrics Tab */
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-400" />
                Domain Interview Configurations & Versioned Rubrics
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Adjust question counts, time limits, passing cutoffs, and AI evaluation guidelines per domain and difficulty.
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingSetting({
                  id: '',
                  domain: 'Full Stack Development',
                  expertise_level: 'Intermediate',
                  semester_band: 'all',
                  question_count: 3,
                  time_limit_minutes: 15,
                  difficulty_guidance: '',
                  prompt_template: '',
                  passing_threshold: 65,
                  tab_switch_cancel_enabled: true,
                  version: 1
                });
                setSettingsModalOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
            >
              + Create New Rubric
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {settingsList.map((setting) => (
              <Card key={setting.id} className="p-5 bg-white border-slate-200 shadow-sm relative hover:border-slate-300 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{setting.domain}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                        {setting.expertise_level}
                      </span>
                      <span className="text-xs bg-white text-slate-500 px-2 py-0.5 rounded border border-slate-700">
                        v{setting.version}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingSetting(setting);
                      setSettingsModalOpen(true);
                    }}
                    className="text-xs border-slate-700 text-indigo-300 hover:bg-slate-800 h-7"
                  >
                    Edit
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2 my-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Questions</div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">{setting.question_count}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Time Limit</div>
                    <div className="text-sm font-bold text-blue-400 mt-0.5">{setting.time_limit_minutes}m</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Cutoff</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">{setting.passing_threshold}%</div>
                  </div>
                </div>

                {setting.difficulty_guidance && (
                  <div className="text-xs text-slate-500 bg-white/60 p-2.5 rounded border border-slate-800 line-clamp-3 mb-2">
                    <strong className="text-gray-300 block mb-1">Guidance:</strong>
                    {setting.difficulty_guidance}
                  </div>
                )}

                <div className="text-[11px] text-gray-500 flex items-center justify-between pt-2 border-t border-slate-800">
                  <span>Anti-cheat lock: {setting.tab_switch_cancel_enabled ? 'Enforced' : 'Disabled'}</span>
                  <span>Band: {setting.semester_band}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* CANDIDATE DETAIL REVIEW MODAL */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={activeCandidate ? `Assessment Dossier: ${activeCandidate.full_name}` : 'Candidate Review'}
        size="3xl"
      >
        {detailLoading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-3" />
            Loading candidate interview session & evaluation dossier...
          </div>
        ) : activeCandidate ? (
          <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  {activeCandidate.full_name}
                  <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded border border-indigo-200">
                    {activeCandidate.domain} • {activeCandidate.skill_level}
                  </span>
                </h3>
                <div className="text-xs text-slate-600 mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                  <span>Email: {activeCandidate.email}</span>
                  <span>WhatsApp: {activeCandidate.whatsapp || 'N/A'}</span>
                  <span>Semester: {activeCandidate.semester}</span>
                  <span>University: {activeCandidate.university || 'N/A'}</span>
                  <span>Reg No: {activeCandidate.university_registration_number || 'N/A'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {activeCandidate.resume_url && (
                  <a
                    href={activeCandidate.resume_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs bg-white hover:bg-slate-50 text-indigo-700 font-semibold px-3 py-1.5 rounded-lg border border-slate-300 shadow-sm transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" /> Resume (PDF)
                  </a>
                )}
                {activeCandidate.linkedin_url && (
                  <a
                    href={activeCandidate.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs bg-white hover:bg-slate-50 text-blue-700 font-semibold px-3 py-1.5 rounded-lg border border-slate-300 shadow-sm transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> LinkedIn
                  </a>
                )}
                <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-300 shadow-sm text-xs">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) {
                        handleResendEmail(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="bg-transparent text-slate-700 font-medium text-xs outline-none cursor-pointer"
                  >
                    <option value="" disabled className="text-slate-400">Resend Email...</option>
                    <option value="interview_invite">Invite & Credentials</option>
                    <option value="shortlisted">Shortlist & 72h Payment</option>
                    <option value="approval">Approval & Acceptance</option>
                    <option value="rejection">Rejection Notice</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 bg-white border border-slate-200 shadow-sm rounded-xl text-center">
                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Final Evaluated Score</div>
                <div className="text-3xl font-black text-indigo-600 mt-1">
                  {activeSession?.override_score ?? activeSession?.ai_score ?? 'N/A'}
                  <span className="text-sm font-normal text-slate-400"> / 100</span>
                </div>
                {activeSession?.override_score !== null && activeSession?.override_score !== undefined && (
                  <div className="text-[11px] font-semibold text-amber-600 mt-1">
                    (Original AI: {activeSession?.ai_score}%)
                  </div>
                )}
              </div>

              <div className="p-4 bg-white border border-slate-200 shadow-sm rounded-xl text-center">
                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">AI Recommendation</div>
                <div className={`text-sm font-black mt-2 capitalize ${
                  activeSession?.ai_suggestion === 'shortlist' ? 'text-emerald-700 bg-emerald-50 py-0.5 px-2 rounded-full inline-block' :
                  activeSession?.ai_suggestion === 'reject' ? 'text-rose-700 bg-rose-50 py-0.5 px-2 rounded-full inline-block' : 'text-amber-700 bg-amber-50 py-0.5 px-2 rounded-full inline-block'
                }`}>
                  {activeSession?.ai_suggestion || 'Pending Review'}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Confidence: {activeSession?.ai_confidence ? `${Math.round(activeSession.ai_confidence * 100)}%` : 'N/A'}
                </div>
              </div>

              <div className="p-4 bg-white border border-slate-200 shadow-sm rounded-xl text-center">
                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Tab Violations</div>
                <div className={`text-2xl font-black mt-1 ${
                  (activeSession?.violation_count || 0) > 0 ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {activeSession?.violation_count ?? 0}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Status: {activeSession?.status || 'None'}
                </div>
              </div>

              <div className="p-4 bg-white border border-slate-200 shadow-sm rounded-xl text-center">
                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Retries Allowed</div>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {activeSession?.retry_count ?? 0} / 1
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {activeSession?.retry_count >= 1 ? 'Limit Exhausted' : 'Available'}
                </div>
              </div>
            </div>

            {/* AI Evaluation Summary & Strengths / Weaknesses */}
            {activeSession?.ai_evaluation && (
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-indigo-900">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  AI Evaluator Synthesis
                </div>
                <p className="text-sm text-slate-800 leading-relaxed font-normal">
                  {activeSession.ai_evaluation.summary || 'Candidate demonstrated foundational understanding.'}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-3">
                    <div className="text-xs font-bold text-emerald-800 mb-1.5 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Strengths Identified
                    </div>
                    <ul className="text-xs text-emerald-950 space-y-1 list-disc list-inside">
                      {(activeSession.ai_evaluation.strengths || ['Understands core principles']).map((str: string, i: number) => (
                        <li key={i}>{str}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-rose-50/80 border border-rose-200 rounded-lg p-3">
                    <div className="text-xs font-bold text-rose-800 mb-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Areas for Improvement
                    </div>
                    <ul className="text-xs text-rose-950 space-y-1 list-disc list-inside">
                      {(activeSession.ai_evaluation.weaknesses || ['Could provide more depth']).map((w: string, i: number) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Question-by-Question Answers and Grades */}
            {activeSession?.questions && activeSession.questions.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Candidate Interview Transcripts ({activeSession.questions.length} Questions)
                </h4>

                {activeSession.questions.map((q: any, idx: number) => {
                  const answer = activeSession.answers?.[idx] || 'No answer submitted';
                  const qEval = activeSession.ai_evaluation?.question_evaluations?.[idx];

                  return (
                    <div key={idx} className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center gap-4 border-b border-slate-100 pb-2">
                        <div className="text-xs font-black text-indigo-700 uppercase tracking-wider flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                            {idx + 1}
                          </span>
                          Question #{idx + 1}
                        </div>
                        {qEval && (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200">
                            Score: {qEval.score} / 10
                          </span>
                        )}
                      </div>

                      {/* Explicit dark question text on high contrast slate-50 */}
                      <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                        <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold block mb-1">
                          Question Prompt
                        </span>
                        <p className="text-sm font-bold text-slate-900 leading-relaxed">
                          {q.question}
                        </p>
                      </div>

                      {/* Candidate Answer in readable dark text */}
                      <div className="space-y-1.5">
                        <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                          <span>Candidate Response:</span>
                          <span className="text-[11px] font-normal text-slate-400">
                            Word count: {answer.trim().split(/\s+/).filter(Boolean).length} words
                          </span>
                        </div>
                        <div className="text-xs text-slate-800 bg-slate-50/50 p-3.5 rounded-lg border border-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                          {answer}
                        </div>
                      </div>

                      {qEval?.feedback && (
                        <div className="text-xs text-indigo-900 bg-indigo-50/70 p-3 rounded-lg border border-indigo-100 leading-relaxed">
                          <strong className="text-indigo-950 font-bold">AI Evaluator Feedback:</strong> {qEval.feedback}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Anti-cheat Proctoring Logs */}
            {activeSession?.violations_log && activeSession.violations_log.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wide">
                  <ShieldAlert className="w-4 h-4 text-amber-700" /> Proctoring Violation Log
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto font-mono text-[11px] text-amber-950">
                  {activeSession.violations_log.map((log: any, idx: number) => (
                    <div key={idx} className="flex justify-between py-1 border-b border-amber-200/60">
                      <span>{log.type} {log.details ? `(${log.details})` : ''}</span>
                      <span className="text-amber-700">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Decision & Overrides Controls */}
            <div className="bg-slate-50 border border-slate-200 p-4.5 rounded-xl space-y-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                Administrative Actions & Decision Authority
              </h4>

              {/* Score Override */}
              <div className="p-3.5 bg-white border border-slate-200 shadow-sm rounded-lg">
                <div className="text-xs font-bold text-slate-700 mb-2">Override Assessment Score:</div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="New Score (0-100)"
                    value={overrideScoreInput}
                    onChange={(e) => setOverrideScoreInput(e.target.value)}
                    className="w-full sm:w-36 bg-white border border-slate-300 text-sm text-slate-900 rounded p-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Mandatory reason for audit log..."
                    value={overrideReasonInput}
                    onChange={(e) => setOverrideReasonInput(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 text-sm text-slate-900 rounded p-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                  <Button
                    onClick={handleSaveScoreOverride}
                    disabled={savingOverride}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 font-semibold shadow-sm"
                  >
                    {savingOverride ? 'Saving...' : 'Save Override'}
                  </Button>
                </div>
              </div>

              {/* Decision Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {(activeCandidate?.pipeline_stage === 'registered' || !activeSession) && (
                    <Button
                      onClick={() => handleDecision([activeCandidate.id], 'call_interview')}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 flex items-center gap-1.5 shadow-sm font-semibold"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      Call for Interview
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDecision([activeCandidate.id], 'shortlist')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 flex items-center gap-1.5 shadow-sm font-semibold"
                  >
                    <UserCheck className="w-4 h-4" />
                    Shortlist & Issue 72h Payment Notice
                  </Button>
                  <Button
                    onClick={() => handleDecision([activeCandidate.id], 'hold')}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-4 flex items-center gap-1.5 shadow-sm font-semibold"
                  >
                    <Clock className="w-4 h-4" />
                    Place on Hold
                  </Button>
                  <Button
                    onClick={() => handleDecision([activeCandidate.id], 'reject')}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-4 flex items-center gap-1.5 shadow-sm font-semibold"
                  >
                    <UserX className="w-4 h-4" />
                    Reject (Release Seat)
                  </Button>
                </div>

                {/* 1-Time Retry Button */}
                {(!activeSession || activeSession.retry_count < 1) && (
                  <Button
                    variant="outline"
                    onClick={handleGrantRetry}
                    disabled={grantingRetry}
                    className="border-slate-300 bg-white text-indigo-700 hover:bg-indigo-50 text-xs flex items-center gap-1.5 shadow-sm font-semibold"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {grantingRetry ? 'Resetting...' : 'Grant 1-Time Retry'}
                  </Button>
                )}
              </div>
            </div>

            {/* Candidate Audit History */}
            {candidateAuditLogs.length > 0 && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-xs font-bold text-slate-700 mb-2">Audit Trails for this Candidate:</div>
                <div className="space-y-1.5 text-xs text-slate-600 font-mono">
                  {candidateAuditLogs.map((log: any) => (
                    <div key={log.id} className="flex justify-between py-1 border-b border-slate-200 last:border-0">
                      <span className="font-semibold text-slate-800">{log.action}</span>
                      <span className="text-slate-500">{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      {/* SETTINGS / RUBRIC MODAL */}
      <Modal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        title={editingSetting?.id ? `Edit Rubric: ${editingSetting.domain} (${editingSetting.expertise_level})` : 'New Interview Rubric'}
        size="lg"
      >
        {editingSetting && (
          <form onSubmit={handleSaveSetting} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Domain</label>
                <select
                  value={editingSetting.domain}
                  onChange={(e) => setEditingSetting({ ...editingSetting, domain: e.target.value })}
                  disabled={Boolean(editingSetting.id)}
                  className="w-full bg-white border border-slate-300 text-sm text-slate-900 rounded p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                >
                  <option value="Python Programming">Python Programming</option>
                  <option value="Full Stack Development">Full Stack Development</option>
                  <option value="Data Science & AI Basics">Data Science & AI Basics</option>
                  <option value="Cybersecurity Fundamentals">Cybersecurity Fundamentals</option>
                  <option value="Java Programming">Java Programming</option>
                  <option value="C++ Programming">C++ Programming</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Skill Level</label>
                <select
                  value={editingSetting.expertise_level}
                  onChange={(e) => setEditingSetting({ ...editingSetting, expertise_level: e.target.value })}
                  disabled={Boolean(editingSetting.id)}
                  className="w-full bg-white border border-slate-300 text-sm text-slate-900 rounded p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Questions Count (2-5)</label>
                <input
                  type="number"
                  min="2"
                  max="5"
                  value={editingSetting.question_count}
                  onChange={(e) => setEditingSetting({ ...editingSetting, question_count: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-300 text-sm text-slate-900 rounded p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Time Limit (mins)</label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={editingSetting.time_limit_minutes}
                  onChange={(e) => setEditingSetting({ ...editingSetting, time_limit_minutes: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-300 text-sm text-slate-900 rounded p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Passing Threshold (%)</label>
                <input
                  type="number"
                  min="40"
                  max="90"
                  value={editingSetting.passing_threshold}
                  onChange={(e) => setEditingSetting({ ...editingSetting, passing_threshold: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-300 text-sm text-slate-900 rounded p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Difficulty Guidance & Evaluation Focus</label>
              <textarea
                rows={3}
                value={editingSetting.difficulty_guidance || ''}
                onChange={(e) => setEditingSetting({ ...editingSetting, difficulty_guidance: e.target.value })}
                placeholder="Specific guidance for AI questions generator and evaluation rubric..."
                className="w-full bg-white border border-slate-300 text-sm text-slate-900 rounded p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="tabSwitchLock"
                checked={editingSetting.tab_switch_cancel_enabled}
                onChange={(e) => setEditingSetting({ ...editingSetting, tab_switch_cancel_enabled: e.target.checked })}
                className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="tabSwitchLock" className="text-xs font-medium text-slate-700 cursor-pointer">
                Strict Anti-Cheat: Cancel session immediately if candidate leaves full screen or switches browser tab
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSettingsModalOpen(false)}
                className="border-slate-700 text-slate-500 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={savingSetting}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4"
              >
                {savingSetting ? 'Saving...' : 'Save Configuration'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </PageWrapper>
  );
}
