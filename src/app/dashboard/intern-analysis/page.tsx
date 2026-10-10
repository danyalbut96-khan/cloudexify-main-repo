'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Card } from '@/components/ui/Card';
import toast from 'react-hot-toast';
import {
  BrainCircuit, Trophy, Users, FolderGit2, CheckCircle2, Clock,
  XCircle, Loader2, GitBranch, ChevronDown, ChevronUp, BarChart3,
  Zap, RefreshCw, ExternalLink, AlertCircle, Medal, Star
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

const DOMAINS = [
  { code: 'PY', label: 'Python', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
  { code: 'CPP', label: 'C++', color: 'from-purple-500 to-pink-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400' },
  { code: 'JAVA', label: 'Java', color: 'from-orange-500 to-red-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400' },
  { code: 'DS', label: 'Data Science', color: 'from-green-500 to-teal-500', bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400' },
  { code: 'CYB', label: 'Cybersecurity', color: 'from-red-500 to-rose-600', bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400' },
  { code: 'GEN', label: 'Full Stack', color: 'from-indigo-500 to-violet-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400' },
];

const ALL_DOMAIN = { code: 'ALL', label: 'All Domains', color: 'from-slate-700 to-slate-900', bg: 'bg-slate-800', border: 'border-slate-700', text: 'text-slate-200' };
const LEADERBOARD_DOMAINS = [ALL_DOMAIN, ...DOMAINS];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: <Clock className="w-3 h-3" /> },
  analyzing: { label: 'Analyzing…', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: <Loader2 className="w-3 h-3 animate-spin" /> },
  done: { label: 'Done', color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: <CheckCircle2 className="w-3 h-3" /> },
  failed: { label: 'Failed', color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: <XCircle className="w-3 h-3" /> },
};

const RANK_MEDALS = ['🥇', '🥈', '🥉'];

interface Project {
  id: string;
  intern_id: string;
  intern_name: string;
  registration_number: string;
  project_title: string;
  repo_url: string;
  domain_code: string;
  project_number: number;
  description: string | null;
  submitted_at: string;
  ai_score: number | null;
  ai_feedback: any;
  ai_analyzed_at: string | null;
  analysis_status: string;
  is_feedback_hidden?: boolean;
  interns?: {
    batch_id: string;
    batches: { id: string; name: string; status: string };
  };
}

interface InternSummary {
  intern_id: string;
  intern_name: string;
  registration_number: string;
  domain_code: string;
  projects: Project[];
  totalScore: number;
  analyzedCount: number;
  maxProjects: number;
}

type ActiveTab = 'overview' | 'leaderboard' | 'queue';

export default function InternAnalysisPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [activeDomain, setActiveDomain] = useState('ALL');
  const [expandedIntern, setExpandedIntern] = useState<string | null>(null);
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());
  const [bulkAnalyzing, setBulkAnalyzing] = useState(false);
  const [maxProjects, setMaxProjects] = useState(4);

  const [batches, setBatches] = useState<any[]>([]);
  const [topTab, setTopTab] = useState<'active' | 'archive'>('active');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('all');

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const [projRes, batchRes] = await Promise.all([
        fetch('/api/analysis/projects'),
        fetch('/api/batches')
      ]);
      if (!projRes.ok) throw new Error('Failed to load projects');
      const data = await projRes.json();
      setProjects(data.projects || []);
      setMaxProjects(data.maxProjects || 4);

      if (batchRes.ok) {
        const bData = await batchRes.json();
        setBatches(bData || []);

        // Default batch: ongoing or accepting
        const activeB = bData.find((b: any) => b.status === 'ongoing' || b.status === 'accepting');
        if (activeB) setSelectedBatchId(activeB.id);
        else setSelectedBatchId('all');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  // Compute filtered projects
  const activeBatches = batches.filter(b => b.status !== 'completed');
  const archivedBatches = batches.filter(b => b.status === 'completed');

  const filteredProjects = projects.filter(p => {
    const pBatchStatus = p.interns?.batches?.status || 'coming';
    const pBatchId = p.interns?.batch_id;
    const isCompleted = pBatchStatus === 'completed';

    if (topTab === 'active' && isCompleted) return false;
    if (topTab === 'archive' && !isCompleted) return false;

    if (selectedBatchId !== 'all' && pBatchId !== selectedBatchId) return false;

    return true;
  });

  const toggleFeedbackVisibility = async (projectId: string, currentHidden: boolean) => {
    try {
      const res = await fetch(`/api/analysis/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_feedback_hidden: !currentHidden })
      });
      if (!res.ok) throw new Error('Failed to update visibility');
      toast.success(currentHidden ? 'Feedback is now visible to intern' : 'Feedback hidden from intern');
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, is_feedback_hidden: !currentHidden } : p));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const editFeedback = async (projectId: string, currentFeedback: any) => {
    if (!currentFeedback) return;
    const newText = window.prompt("Edit overall AI feedback:", currentFeedback.overall_feedback);
    if (newText !== null && newText.trim() !== "") {
      const updatedFeedback = { ...currentFeedback, overall_feedback: newText.trim() };
      try {
        const res = await fetch(`/api/analysis/projects/${projectId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ai_feedback: updatedFeedback })
        });
        if (!res.ok) throw new Error('Failed to update feedback');
        toast.success('Feedback updated successfully');
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ai_feedback: updatedFeedback } : p));
      } catch (err: any) {
        toast.error(err.message);
      }
    }
  };

  const analyzeProject = async (projectId: string) => {
    setAnalyzingIds(prev => new Set(prev).add(projectId));
    // Optimistically set status
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, analysis_status: 'analyzing' } : p));
    try {
      const res = await fetch('/api/analysis/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId })
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Analysis failed');
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, analysis_status: 'failed' } : p));
      } else {
        toast.success('Analysis complete!');
        setProjects(prev => prev.map(p => p.id === projectId ? data.project : p));
      }
    } catch {
      toast.error('Network error during analysis');
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, analysis_status: 'failed' } : p));
    } finally {
      setAnalyzingIds(prev => { const s = new Set(prev); s.delete(projectId); return s; });
    }
  };

  const analyzeAllPending = async () => {
    const pending = filteredProjects.filter(p => p.analysis_status === 'pending' || p.analysis_status === 'failed');
    if (pending.length === 0) { toast('No pending projects to analyze'); return; }
    setBulkAnalyzing(true);
    toast(`Analyzing ${pending.length} projects sequentially…`);
    for (const p of pending) {
      await analyzeProject(p.id);
      await new Promise(r => setTimeout(r, 800)); // small delay between requests
    }
    setBulkAnalyzing(false);
    toast.success('Bulk analysis complete!');
  };

  // Stats
  const totalProjects = filteredProjects.length;
  const analyzedCount = filteredProjects.filter(p => p.analysis_status === 'done').length;
  const pendingCount = filteredProjects.filter(p => p.analysis_status === 'pending').length;
  const failedCount = filteredProjects.filter(p => p.analysis_status === 'failed').length;
  const uniqueInterns = new Set(filteredProjects.map(p => p.intern_id)).size;
  const completionPct = totalProjects > 0 ? Math.round((analyzedCount / totalProjects) * 100) : 0;

  const pieData = [
    { name: 'Analyzed', value: analyzedCount, color: '#10b981' },
    { name: 'Pending', value: pendingCount, color: '#f59e0b' },
    { name: 'Failed', value: failedCount, color: '#ef4444' }
  ].filter(d => d.value > 0);

  // Build intern summaries for leaderboard
  const buildLeaderboard = (domainCode: string): InternSummary[] => {
    const domainProjects = domainCode === 'ALL' ? filteredProjects : filteredProjects.filter(p => p.domain_code === domainCode);
    const byIntern = new Map<string, Project[]>();
    domainProjects.forEach(p => {
      if (!byIntern.has(p.intern_id)) byIntern.set(p.intern_id, []);
      byIntern.get(p.intern_id)!.push(p);
    });

    const summaries: InternSummary[] = [];
    byIntern.forEach((projs, internId) => {
      const totalScore = projs.reduce((s, p) => s + (p.ai_score ?? 0), 0);
      const analyzedCount = projs.filter(p => p.analysis_status === 'done').length;
      summaries.push({
        intern_id: internId,
        intern_name: projs[0].intern_name,
        registration_number: projs[0].registration_number,
        domain_code: projs[0].domain_code,
        projects: projs.sort((a, b) => a.project_number - b.project_number),
        totalScore,
        analyzedCount,
        maxProjects,
      });
    });
    return summaries.sort((a, b) => b.totalScore - a.totalScore);
  };

  const leaderboard = buildLeaderboard(activeDomain);
  const activeDomainInfo = LEADERBOARD_DOMAINS.find(d => d.code === activeDomain)!;

  if (loading) {
    return (
      <PageWrapper title="Intern Analysis">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Intern Analysis">
      <div className="space-y-6 p-6">

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-100/50 border border-slate-200 rounded-xl p-1 w-fit">
          {([
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
            { id: 'queue', label: 'Project Queue', icon: FolderGit2 },
          ] as { id: ActiveTab; label: string; icon: any }[]).map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Top-Level Filter for Batches */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setTopTab('active'); setSelectedBatchId('all'); }}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${topTab === 'active' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              Active View
            </button>
            <button
              onClick={() => { setTopTab('archive'); setSelectedBatchId('all'); }}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${topTab === 'archive' ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              Archive (Completed)
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-sm font-semibold text-slate-500">Filter by Batch:</span>
            <select
              value={selectedBatchId}
              onChange={e => setSelectedBatchId(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1 sm:w-64 font-medium"
            >
              <option value="all">All {topTab === 'active' ? 'Active' : 'Archived'} Batches</option>
              {(topTab === 'active' ? activeBatches : archivedBatches).map(b => (
                <option key={b.id} value={b.id}>{b.name} ({b.status})</option>
              ))}
            </select>
          </div>
        </div>

        {/* ====== TAB: OVERVIEW ====== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Interns', value: uniqueInterns, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: 'Projects Submitted', value: totalProjects, icon: FolderGit2, color: 'text-violet-400', bg: 'bg-violet-500/10' },
                { label: 'Analyzed', value: analyzedCount, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
                { label: 'Pending / Failed', value: `${pendingCount} / ${failedCount}`, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              ].map((stat, i) => {
                const Icon = stat.icon;
                const borderColors = ['border-l-blue-600', 'border-l-violet-600', 'border-l-green-600', 'border-l-amber-500'];
                return (
                  <Card key={stat.label} className={`border-l-4 ${borderColors[i]} relative overflow-hidden`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center text-slate-500 font-bold text-sm mb-1.5">
                          <Icon className={`h-4 w-4 mr-1.5 ${stat.color}`} />
                          {stat.label}
                        </div>
                        <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                      </div>
                      <div className={`${stat.bg} ${stat.color.replace('text-', 'text-').replace('-400', '-600')} p-2.5 rounded-lg border border-slate-100`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Progress + Bulk Analyze */}
            <Card className="p-6">
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-700"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>0%</span>
                <span className="font-semibold text-slate-900">{completionPct}% complete</span>
                <span>100%</span>
              </div>
            </Card>

            {/* Domain breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {DOMAINS.map(domain => {
                const domainProjs = filteredProjects.filter(p => p.domain_code === domain.code);
                const domainDone = domainProjs.filter(p => p.analysis_status === 'done').length;
                const domainInterns = new Set(domainProjs.map(p => p.intern_id)).size;
                const pct = domainProjs.length > 0 ? Math.round((domainDone / domainProjs.length) * 100) : 0;
                return (
                  <Card
                    key={domain.code}
                    className="p-4 cursor-pointer hover:border-slate-300 transition-all bg-white"
                    onClick={() => { setActiveDomain(domain.code); setActiveTab('leaderboard'); }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded bg-gradient-to-r ${domain.color} text-white`}>{domain.code}</span>
                      <span className="text-xs text-slate-500">{domainInterns} interns</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mb-1">{domain.label}</p>
                    <p className="text-xs text-slate-500 mb-3">{domainDone}/{domainProjs.length} analyzed</p>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${domain.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ====== TAB: LEADERBOARD ====== */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-5">
            {/* Domain selector */}
            <div className="flex flex-wrap gap-2">
              {LEADERBOARD_DOMAINS.map(domain => (
                <button
                  key={domain.code}
                  onClick={() => { setActiveDomain(domain.code); setExpandedIntern(null); }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${activeDomain === domain.code
                      ? `bg-gradient-to-r ${domain.color} text-white border-transparent shadow-lg`
                      : `${domain.bg} ${domain.border} ${domain.text} hover:opacity-80`
                    }`}
                >
                  {domain.code} — {domain.label}
                </button>
              ))}
            </div>

            {/* Leaderboard table */}
            <Card className="overflow-hidden">
              <div className={`h-1 bg-gradient-to-r ${activeDomainInfo.color}`} />
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className={`w-4 h-4 ${activeDomainInfo.text.replace('text-', 'text-').replace('-400', '-600')}`} />
                  <h3 className="font-semibold text-slate-900 text-sm">{activeDomainInfo.label} Leaderboard</h3>
                  <span className="text-xs text-slate-500">({leaderboard.length} interns)</span>
                </div>
                <button onClick={fetchProjects} className="text-slate-400 hover:text-slate-700 transition-colors">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {leaderboard.length === 0 ? (
                <div className="p-10 text-center text-slate-500 text-sm">
                  No projects found for {activeDomainInfo.label} domain yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {leaderboard.map((intern, idx) => {
                    const isExpanded = expandedIntern === intern.intern_id;
                    const isTop3 = idx < 3;
                    return (
                      <div key={intern.intern_id}>
                        <button
                          className="w-full text-left"
                          onClick={() => setExpandedIntern(isExpanded ? null : intern.intern_id)}
                        >
                          <div className={`px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors ${isTop3 ? 'bg-blue-50/50' : ''}`}>
                            {/* Rank */}
                            <div className="w-10 text-center shrink-0">
                              {idx < 3 ? (
                                <span className="text-xl">{RANK_MEDALS[idx]}</span>
                              ) : (
                                <span className="text-sm font-bold text-slate-400">#{idx + 1}</span>
                              )}
                            </div>

                            {/* Name & reg */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-slate-900 text-sm truncate">{intern.intern_name}</p>
                                {idx === 0 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">TOP</span>}
                              </div>
                              <p className="text-[10px] text-slate-500 font-mono">{intern.registration_number}</p>
                            </div>

                            {/* Projects done */}
                            <div className="hidden sm:flex items-center gap-1 shrink-0">
                              {Array.from({ length: intern.maxProjects }).map((_, i) => (
                                <div key={i} className={`w-2 h-2 rounded-full ${i < intern.analyzedCount ? `bg-gradient-to-br ${activeDomainInfo.color}` : 'bg-slate-200'}`} />
                              ))}
                              <span className="text-xs text-slate-400 ml-1">{intern.analyzedCount}/{intern.maxProjects}</span>
                            </div>

                            {/* Score */}
                            <div className="text-right shrink-0">
                              <p className={`text-lg font-black ${isTop3 ? activeDomainInfo.text.replace('text-', 'text-').replace('-400', '-600') : 'text-slate-900'}`}>
                                {intern.totalScore.toFixed(1)}
                              </p>
                              <p className="text-[10px] text-slate-500">/ {intern.maxProjects * 25} pts</p>
                            </div>

                            <div className="text-slate-400 shrink-0">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                          </div>
                        </button>

                        {/* Expanded: per-project breakdown */}
                        {isExpanded && (
                          <div className="bg-slate-50/70 border-t border-slate-100 p-4 space-y-3">
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Project Breakdown</h4>
                            {intern.projects.map(proj => (
                              <div key={proj.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-[10px] font-bold text-slate-500">PROJECT #{proj.project_number}</span>
                                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border ${STATUS_CONFIG[proj.analysis_status]?.color}`}>
                                        {STATUS_CONFIG[proj.analysis_status]?.icon}
                                        {STATUS_CONFIG[proj.analysis_status]?.label}
                                      </span>
                                    </div>
                                    <p className="font-semibold text-slate-900 text-sm mt-0.5">{proj.project_title}</p>
                                    {proj.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{proj.description}</p>}
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <a href={proj.repo_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-500 transition-colors">
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                    {(proj.analysis_status === 'pending' || proj.analysis_status === 'failed') && (
                                      <button
                                        onClick={() => analyzeProject(proj.id)}
                                        disabled={analyzingIds.has(proj.id)}
                                        className="flex items-center gap-1 px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-400 rounded-lg text-[10px] font-semibold transition-all disabled:opacity-50"
                                      >
                                        {analyzingIds.has(proj.id) ? <Loader2 className="w-3 h-3 animate-spin" /> : <BrainCircuit className="w-3 h-3" />}
                                        Analyze
                                      </button>
                                    )}
                                    {proj.analysis_status === 'done' && (
                                      <div className="flex items-center gap-3">
                                        <button
                                          onClick={() => toggleFeedbackVisibility(proj.id, proj.is_feedback_hidden ?? false)}
                                          className={`px-2 py-1 text-[10px] font-bold rounded border ${proj.is_feedback_hidden ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}`}
                                        >
                                          {proj.is_feedback_hidden ? 'Feedback Hidden' : 'Feedback Visible'}
                                        </button>
                                        <button
                                          onClick={() => editFeedback(proj.id, proj.ai_feedback)}
                                          className="px-2 py-1 text-[10px] font-bold rounded border bg-blue-50 text-blue-600 border-blue-200"
                                        >
                                          Edit Feedback
                                        </button>
                                        <span className={`text-base font-black ${activeDomainInfo.text.replace('text-', 'text-').replace('-400', '-600')}`}>{proj.ai_score?.toFixed(1)}<span className="text-[10px] text-slate-500 font-normal">/25</span></span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* AI criteria breakdown */}
                                {proj.analysis_status === 'done' && proj.ai_feedback?.criteria && (
                                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                                    {proj.ai_feedback.criteria.map((c: any, i: number) => (
                                      <div key={i} className="space-y-0.5">
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="text-slate-700 font-medium">{c.name}</span>
                                          <span className={`font-bold ${c.score >= 4 ? 'text-green-600' : c.score >= 2.5 ? 'text-amber-500' : 'text-red-500'}`}>{c.score}/5</span>
                                        </div>
                                        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                          <div className={`h-full rounded-full bg-gradient-to-r ${activeDomainInfo.color}`} style={{ width: `${(c.score / 5) * 100}%` }} />
                                        </div>
                                        {c.comment && <p className="text-[10px] text-slate-500 leading-relaxed">{c.comment}</p>}
                                      </div>
                                    ))}
                                    {proj.ai_feedback.overall_feedback && (
                                      <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <p className="text-[10px] text-slate-600 leading-relaxed"><Star className="w-3 h-3 inline mr-1 text-amber-500" />{proj.ai_feedback.overall_feedback}</p>
                                      </div>
                                    )}
                                    {proj.ai_feedback.strengths && proj.ai_feedback.strengths.length > 0 && (
                                      <div className="mt-2 px-2">
                                        <p className="text-[10px] font-bold text-green-600 mb-1">Strengths:</p>
                                        <ul className="list-disc pl-4 text-[10px] text-slate-600 space-y-0.5">
                                          {proj.ai_feedback.strengths.map((s: string, idx: number) => <li key={idx}>{s}</li>)}
                                        </ul>
                                      </div>
                                    )}
                                    {proj.ai_feedback.improvements && proj.ai_feedback.improvements.length > 0 && (
                                      <div className="mt-2 px-2">
                                        <p className="text-[10px] font-bold text-red-500 mb-1">Areas to Improve:</p>
                                        <ul className="list-disc pl-4 text-[10px] text-slate-600 space-y-0.5">
                                          {proj.ai_feedback.improvements.map((s: string, idx: number) => <li key={idx}>{s}</li>)}
                                        </ul>
                                      </div>
                                    )}
                                    {proj.ai_feedback.next_steps && proj.ai_feedback.next_steps.length > 0 && (
                                      <div className="mt-2 px-2">
                                        <p className="text-[10px] font-bold text-blue-500 mb-1">Next Steps:</p>
                                        <ul className="list-disc pl-4 text-[10px] text-slate-600 space-y-0.5">
                                          {proj.ai_feedback.next_steps.map((s: string, idx: number) => <li key={idx}>{s}</li>)}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ====== TAB: PROJECT QUEUE ====== */}
        {activeTab === 'queue' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">{totalProjects} total projects · {pendingCount} pending</p>
              <button onClick={fetchProjects} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>

            <Card className="overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-slate-100 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                <div className="col-span-1">Status</div>
                <div className="col-span-3">Intern</div>
                <div className="col-span-1">Domain</div>
                <div className="col-span-1">#</div>
                <div className="col-span-3">Project</div>
                <div className="col-span-1">Score</div>
                <div className="col-span-2">Action</div>
              </div>

              {filteredProjects.length === 0 ? (
                <div className="p-10 text-center text-slate-500 text-sm">No projects submitted yet.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredProjects.map(proj => {
                    const domainInfo = DOMAINS.find(d => d.code === proj.domain_code);
                    const statusCfg = STATUS_CONFIG[proj.analysis_status] || STATUS_CONFIG.pending;
                    return (
                      <div key={proj.id} className="grid grid-cols-12 gap-2 px-4 py-3.5 items-center hover:bg-slate-50 transition-colors">
                        {/* Status */}
                        <div className="col-span-1">
                          <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded border ${statusCfg.color}`}>
                            {statusCfg.icon}
                          </span>
                        </div>
                        {/* Intern */}
                        <div className="col-span-3 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">{proj.intern_name}</p>
                          <p className="text-[9px] text-slate-500 font-mono truncate">{proj.registration_number}</p>
                        </div>
                        {/* Domain */}
                        <div className="col-span-1">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-r ${domainInfo?.color ?? 'from-slate-500 to-slate-400'} text-white`}>
                            {proj.domain_code}
                          </span>
                        </div>
                        {/* Project # */}
                        <div className="col-span-1">
                          <span className="text-xs text-slate-500 font-medium">#{proj.project_number}</span>
                        </div>
                        {/* Title */}
                        <div className="col-span-3 min-w-0">
                          <p className="text-xs text-slate-900 truncate">{proj.project_title}</p>
                          <a href={proj.repo_url} target="_blank" rel="noopener noreferrer" className="text-[9px] text-slate-500 hover:text-blue-500 transition-colors flex items-center gap-0.5">
                            <GitBranch className="w-2.5 h-2.5" />
                            <span className="truncate">{proj.repo_url.replace('https://github.com/', '')}</span>
                          </a>
                        </div>
                        {/* Score */}
                        <div className="col-span-1">
                          {proj.analysis_status === 'done' && proj.ai_score !== null ? (
                            <span className={`text-sm font-black ${domainInfo?.text.replace('text-', 'text-').replace('-400', '-600') ?? 'text-slate-900'}`}>
                              {proj.ai_score.toFixed(1)}<span className="text-[9px] text-slate-500">/25</span>
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </div>
                        {/* Action */}
                        <div className="col-span-2">
                          {(proj.analysis_status === 'pending' || proj.analysis_status === 'failed') ? (
                            <button
                              onClick={() => analyzeProject(proj.id)}
                              disabled={analyzingIds.has(proj.id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-400 rounded-lg text-[10px] font-semibold transition-all disabled:opacity-50 whitespace-nowrap"
                            >
                              {analyzingIds.has(proj.id) ? <Loader2 className="w-3 h-3 animate-spin" /> : <BrainCircuit className="w-3 h-3" />}
                              Analyze
                            </button>
                          ) : proj.analysis_status === 'done' ? (
                            <button
                              onClick={() => { setActiveDomain(proj.domain_code); setActiveTab('leaderboard'); }}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-green-600/10 hover:bg-green-600/20 border border-green-500/20 text-green-400 rounded-lg text-[10px] font-medium transition-all whitespace-nowrap"
                            >
                              <Medal className="w-3 h-3" />
                              View
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-600">Processing…</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
