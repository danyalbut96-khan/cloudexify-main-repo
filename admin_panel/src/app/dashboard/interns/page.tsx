'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Lock,
  LockOpen,
  Search, 
  Download, 
  Filter, 
  Eye, 
  Award, 
  FileSpreadsheet, 
  RefreshCw, 
  FileText, 
  ArrowUpRight, 
  CheckCircle, 
  XCircle,
  Calendar,
  Layers,
  GraduationCap
} from 'lucide-react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import toast from 'react-hot-toast';

export default function InternsPage() {
  const router = useRouter();
  const [interns, setInterns] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  // Profile Modal State
  const [selectedIntern, setSelectedIntern] = useState<any | null>(null);
  
  // Search & Filters State
  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState('');
  const [semester, setSemester] = useState('');
  const [offerStatus, setOfferStatus] = useState('');
  const [certStatus, setCertStatus] = useState('');
  const [batchStatus, setBatchStatus] = useState<string>('all');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('all');

  // Load Batches list
  const fetchBatches = async () => {
    try {
      const res = await fetch('/api/batches');
      if (res.ok) {
        const data = await res.json();
        setBatches(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Error fetching batches:', e);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchInterns = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (domain) params.append('domain', domain);
      if (semester) params.append('semester', semester);
      if (offerStatus) params.append('offer_letter_status', offerStatus);
      if (certStatus) params.append('certificate_status', certStatus);
      if (batchStatus && batchStatus !== 'all') params.append('batch_status', batchStatus);
      if (selectedBatchId && selectedBatchId !== 'all') params.append('batch_id', selectedBatchId);

      const res = await fetch(`/api/interns?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load interns list');
      const data = await res.json();
      setInterns(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(error.message || 'Error fetching interns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const timestamp = localStorage.getItem('cx_interns_last_synced');
      if (timestamp) {
        setLastSynced(timestamp);
      }
    }

    const timer = setTimeout(() => {
      fetchInterns();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, domain, semester, offerStatus, certStatus, batchStatus, selectedBatchId]);

  // Sync Google Sheets
  const handleSyncSheets = async () => {
    setIsSyncing(true);
    const syncToast = toast.loading('Syncing Google Sheet connections for Interns...');
    try {
      const res = await fetch('/api/sheets/fetch?mappedTo=interns');
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sync Google Sheets');
      }

      toast.success(data.message || 'Synchronization completed successfully!', { id: syncToast });
      const nowString = new Date().toLocaleString();
      setLastSynced(nowString);
      if (typeof window !== 'undefined') {
        localStorage.setItem('cx_interns_last_synced', nowString);
      }
      fetchInterns();
    } catch (err: any) {
      toast.error(err.message || 'Synchronization error', { id: syncToast });
    } finally {
      setIsSyncing(false);
    }
  };

  // Export to CSV
  const handleExport = () => {
    if (interns.length === 0) {
      toast.error('No interns available to export.');
      return;
    }

    const headers = [
      'Registration Number',
      'Name',
      'Email',
      'Whatsapp',
      'Batch',
      'Batch Status',
      'Gender',
      'University',
      'Semester',
      'Domain',
      'Skill Level',
      'Status',
      'Pipeline Stage',
      'Offer Letter',
      'Certificate',
      'Exp Certificate',
      'Rec Letter'
    ];

    const rows = interns.map(item => [
      item.registration_number,
      item.full_name,
      item.email,
      item.whatsapp || '',
      item.batches?.name || 'Unassigned',
      item.batches?.status || 'N/A',
      item.gender || '',
      item.university || '',
      item.semester || '',
      item.domain,
      item.skill_level || '',
      item.status || 'Pending',
      item.pipeline_stage || 'registered',
      item.intern_documents?.offer_letter_generated ? 'Generated' : 'Pending',
      item.intern_documents?.certificate_generated ? 'Generated' : 'Pending',
      item.intern_documents?.experience_certificate_generated ? 'Generated' : 'Pending',
      item.intern_documents?.recommendation_letter_generated ? 'Generated' : 'Pending'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CloudExify_Interns_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Grid data exported successfully to CSV!');
  };

  const handleDownloadDoc = async (docType: string, id: string, name: string) => {
    const downloadToast = toast.loading(`Downloading ${docType.replace('-', ' ')} PDF...`);
    try {
      const response = await fetch(`/api/documents/${docType}?internId=${id}`);
      if (!response.ok) throw new Error('Document download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${name}_${docType.replace('-', '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Document downloaded successfully!', { id: downloadToast });
    } catch (err: any) {
      toast.error(err.message || 'Download failed', { id: downloadToast });
    }
  };

  const updateInternStatus = async (id: string, newStatus: 'Accepted' | 'Rejected') => {
    const actionToast = toast.loading(`Marking as ${newStatus}...`);
    try {
      const res = await fetch(`/api/interns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to update status');
      
      toast.success(`Intern ${newStatus} successfully!`, { id: actionToast });
      setSelectedIntern({ ...selectedIntern, status: newStatus });
      fetchInterns();
    } catch (err: any) {
      toast.error(err.message || 'Status update failed', { id: actionToast });
    }
  };

  const updateInternDocLock = async (id: string, overrideValue: boolean | null) => {
    const actionToast = toast.loading('Updating document lock setting...');
    try {
      const res = await fetch(`/api/interns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_lock_override: overrideValue })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update document lock');

      const statusText = overrideValue === false 
        ? 'Documents unlocked for this intern!' 
        : overrideValue === true 
        ? 'Documents locked for this intern!' 
        : 'Reset to batch default lock setting!';

      toast.success(statusText, { id: actionToast });
      if (selectedIntern && selectedIntern.id === id) {
        setSelectedIntern({ ...selectedIntern, document_lock_override: overrideValue });
      }
      fetchInterns();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update lock', { id: actionToast });
    }
  };

  const domainOptions = [
    'Python Programming',
    'C++ Programming',
    'Java Programming',
    'Data Science & AI Basics',
    'Cybersecurity Fundamentals',
    'Full Stack Development'
  ];

  // Helper for batch badge styling
  const renderBatchBadge = (batch: any) => {
    if (!batch) return <span className="text-slate-400 text-xs italic">Unassigned</span>;

    const status = String(batch.status || '').toLowerCase();
    let badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
    let label = batch.name;

    if (status === 'accepting' || status === 'registration_open') {
      badgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
    } else if (status === 'ongoing' || status === 'active') {
      badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else if (status === 'upcoming') {
      badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
    } else if (status === 'completed') {
      badgeClass = 'bg-slate-100 text-slate-600 border-slate-200';
    }

    return (
      <div className="flex flex-col gap-1 items-start">
        <span className="font-semibold text-slate-900 text-xs">{batch.name}</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass} capitalize`}>
          {status === 'accepting' ? 'Registration Open' : status}
        </span>
      </div>
    );
  };

  return (
    <PageWrapper
      title="Interns Registry"
      actions={
        <div className="flex items-center space-x-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncSheets}
            isLoading={isSyncing}
            className="flex items-center space-x-1.5 font-semibold text-slate-700 bg-white border-slate-300 shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 text-blue-500 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync Sheets</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex items-center space-x-1.5 font-semibold text-slate-700 bg-white border-slate-300 shadow-sm"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Export CSV</span>
          </Button>
        </div>
      }
    >
      {/* Last Sync Timestamp Indicator */}
      {lastSynced && (
        <div className="text-[10px] text-slate-400 font-semibold mb-3 tracking-wide text-right uppercase">
          Last Synced: {lastSynced}
        </div>
      )}

      {/* COHORT / BATCH STATUS FILTER TABS */}
      <div className="bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200 flex flex-wrap gap-1.5 mb-5 shadow-sm">
        <button
          onClick={() => { setBatchStatus('all'); setSelectedBatchId('all'); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            batchStatus === 'all' && selectedBatchId === 'all'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          All Cohorts & Batches
        </button>

        <button
          onClick={() => setBatchStatus('accepting')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            batchStatus === 'accepting'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
          Registration Open
        </button>

        <button
          onClick={() => setBatchStatus('ongoing')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            batchStatus === 'ongoing' || batchStatus === 'active'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Active / Ongoing
        </button>

        <button
          onClick={() => setBatchStatus('upcoming')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            batchStatus === 'upcoming'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          Upcoming Cohorts
        </button>

        <button
          onClick={() => setBatchStatus('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            batchStatus === 'completed'
              ? 'bg-slate-800 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
          Completed Batches
        </button>
      </div>

      {/* Search and Filters grid */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4.5 w-4.5" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, reg no..."
              className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Specific Batch Dropdown */}
          <div>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white font-medium"
            >
              <option value="all">All Specific Batches</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.status})
                </option>
              ))}
            </select>
          </div>

          {/* Domain Filter */}
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white font-medium"
          >
            <option value="">All Domains</option>
            {domainOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>

          {/* Semester Filter */}
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white font-medium"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
          {/* Offer Letter Filter */}
          <select
            value={offerStatus}
            onChange={(e) => setOfferStatus(e.target.value)}
            className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white font-medium"
          >
            <option value="">Offer Letter (All)</option>
            <option value="generated">Generated</option>
            <option value="pending">Pending</option>
          </select>

          {/* Certificate Filter */}
          <select
            value={certStatus}
            onChange={(e) => setCertStatus(e.target.value)}
            className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white font-medium"
          >
            <option value="">Completion Certificate (All)</option>
            <option value="generated">Generated</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Interns Table Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8"><TableSkeleton rows={8} cols={9} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Admission</th>
                  <th className="px-5 py-3.5">Batch / Cohort</th>
                  <th className="px-5 py-3.5">Reg No</th>
                  <th className="px-5 py-3.5">Name & Email</th>
                  <th className="px-5 py-3.5">Domain</th>
                  <th className="px-5 py-3.5">Doc Access</th>
                  <th className="px-5 py-3.5">Offer Letter</th>
                  <th className="px-5 py-3.5">Certificate</th>
                  <th className="px-5 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                {interns.map((intern) => (
                  <tr key={intern.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Status */}
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        intern.status === 'Accepted'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : intern.status === 'Rejected'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {intern.status || 'Pending'}
                      </span>
                    </td>

                    {/* Batch */}
                    <td className="px-5 py-4">
                      {renderBatchBadge(intern.batches)}
                    </td>

                    {/* Reg No */}
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">{intern.registration_number}</td>

                    {/* Name & Email */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{intern.full_name}</div>
                      <div className="text-[11px] text-slate-500 font-normal truncate max-w-[170px]">{intern.email}</div>
                    </td>

                    {/* Domain */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">{intern.domain}</div>
                      <div className="text-[11px] text-slate-500 font-normal">Sem {intern.semester || '-'} • {intern.skill_level || 'Beginner'}</div>
                    </td>

                    {/* Document Access Status & Quick Action */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        {intern.document_lock_override === false ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <LockOpen className="w-3 h-3 text-emerald-600" /> Unlocked
                          </span>
                        ) : intern.document_lock_override === true ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                            <Lock className="w-3 h-3 text-rose-600" /> Locked
                          </span>
                        ) : intern.batches?.documents_locked ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                            <Lock className="w-3 h-3 text-amber-600" /> Batch Lock
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-200 flex items-center gap-1">
                            <LockOpen className="w-3 h-3 text-slate-500" /> Open
                          </span>
                        )}

                        <button
                          onClick={() => {
                            const currentlyLocked = intern.document_lock_override !== null && intern.document_lock_override !== undefined
                              ? intern.document_lock_override
                              : Boolean(intern.batches?.documents_locked);
                            updateInternDocLock(intern.id, !currentlyLocked);
                          }}
                          title={
                            intern.document_lock_override === false 
                              ? "Click to Lock Documents specifically for this intern" 
                              : "Click to Unlock Documents specifically for this intern"
                          }
                          className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                        >
                          {intern.document_lock_override === false ? (
                            <Lock className="w-3.5 h-3.5 text-slate-400 hover:text-rose-600" />
                          ) : (
                            <LockOpen className="w-3.5 h-3.5 text-slate-400 hover:text-emerald-600" />
                          )}
                        </button>
                      </div>
                    </td>
                    
                    {/* Offer Letter status */}
                    <td className="px-5 py-4">
                      {intern.status === 'Pending' || intern.status === 'Rejected' ? (
                         <span className="text-slate-400 font-medium text-[11px]">Locked</span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          intern.intern_documents?.offer_letter_generated
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                          {intern.intern_documents?.offer_letter_generated ? 'Generated' : 'Pending'}
                        </span>
                      )}
                    </td>

                    {/* Certificate status */}
                    <td className="px-5 py-4">
                      {intern.status === 'Pending' || intern.status === 'Rejected' ? (
                         <span className="text-slate-400 font-medium text-[11px]">Locked</span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          intern.intern_documents?.certificate_generated
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                          {intern.intern_documents?.certificate_generated ? 'Generated' : 'Pending'}
                        </span>
                      )}
                    </td>

                    {/* Actions button */}
                    <td className="px-5 py-4 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedIntern(intern)}
                        className="text-indigo-700 bg-white hover:bg-indigo-50 border-indigo-200 py-1 px-3 rounded-lg h-7 font-bold text-xs shadow-sm"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1 text-indigo-600" />
                        Dossier
                      </Button>
                    </td>
                  </tr>
                ))}

                {interns.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-14 text-center text-slate-400">
                      No interns match your current batch status or filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Intern Profile Slide-Over/Modal Details */}
      {selectedIntern && (
        <Modal
          isOpen={!!selectedIntern}
          onClose={() => setSelectedIntern(null)}
          title={`Candidate Dossier: ${selectedIntern.full_name}`}
          size="xl"
        >
          <div className="space-y-6 text-slate-700 font-sans leading-normal">
            
            {/* 1. Core Profile Details Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Registration Number</p>
                <p className="text-xs font-black text-slate-900 font-mono mt-0.5">{selectedIntern.registration_number}</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Cohort / Batch</p>
                <p className="text-xs font-bold text-indigo-700 mt-0.5">{selectedIntern.batches?.name || 'Unassigned'}</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pipeline Stage</p>
                <p className="text-xs font-bold text-slate-900 capitalize mt-0.5">{(selectedIntern.pipeline_stage || 'registered').replace('_', ' ')}</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Domain Track</p>
                <p className="text-xs font-semibold text-slate-900 mt-0.5">{selectedIntern.domain}</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Skill Level</p>
                <p className="text-xs font-semibold text-slate-900 mt-0.5">{selectedIntern.skill_level || 'Beginner'}</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Semester</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">Semester {selectedIntern.semester || '-'}</p>
              </div>

              <div className="col-span-2">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Email Address</p>
                <p className="text-xs font-medium text-slate-800 break-all mt-0.5">{selectedIntern.email}</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">WhatsApp</p>
                <p className="text-xs font-medium text-slate-800 mt-0.5">{selectedIntern.whatsapp || '-'}</p>
              </div>

              <div className="col-span-2">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">University / College</p>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">{selectedIntern.university || '-'}</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">University Reg No</p>
                <p className="text-xs font-mono font-bold text-slate-800 mt-0.5">{selectedIntern.university_registration_number || '-'}</p>
              </div>
            </div>

            {/* Review Actions */}
            {(!selectedIntern.status || selectedIntern.status === 'Pending' || selectedIntern.status === 'Rejected') && (
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4.5">
                <h4 className="text-sm font-bold text-indigo-950 mb-1">Administrative Decision Authority</h4>
                <p className="text-xs text-indigo-800/80 mb-3.5 leading-relaxed">
                  Verify the candidate details. Accepting unlocks their official portal access and allows generation of authentic credential documents.
                </p>
                <div className="flex gap-2.5">
                  <Button 
                    onClick={() => updateInternStatus(selectedIntern.id, 'Accepted')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" /> Accept Intern
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => updateInternStatus(selectedIntern.id, 'Rejected')}
                    className="border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </Button>
                </div>
              </div>
            )}

            {/* Individual Document Lock Authority */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    {selectedIntern.document_lock_override === false ? (
                      <LockOpen className="w-4 h-4 text-emerald-600" />
                    ) : selectedIntern.document_lock_override === true ? (
                      <Lock className="w-4 h-4 text-rose-600" />
                    ) : selectedIntern.batches?.documents_locked ? (
                      <Lock className="w-4 h-4 text-amber-600" />
                    ) : (
                      <LockOpen className="w-4 h-4 text-emerald-600" />
                    )}
                    Individual Document Lock Authority
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Batch default: <strong>{selectedIntern.batches?.name || 'Cohort'}</strong> is currently{' '}
                    <span className={selectedIntern.batches?.documents_locked ? 'text-amber-700 font-bold' : 'text-emerald-700 font-bold'}>
                      {selectedIntern.batches?.documents_locked ? 'Locked' : 'Unlocked'}
                    </span>.
                  </p>
                </div>

                <div className="shrink-0">
                  {selectedIntern.document_lock_override === false ? (
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-[11px] font-bold flex items-center gap-1">
                      <LockOpen className="w-3.5 h-3.5 text-emerald-700" /> Individually Unlocked
                    </span>
                  ) : selectedIntern.document_lock_override === true ? (
                    <span className="px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-full text-[11px] font-bold flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-rose-700" /> Individually Locked
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-slate-200 text-slate-700 border border-slate-300 rounded-full text-[11px] font-bold flex items-center gap-1">
                      Following Batch Default
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button
                  size="sm"
                  onClick={() => updateInternDocLock(selectedIntern.id, false)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 shadow-sm flex items-center gap-1.5"
                >
                  <LockOpen className="w-3.5 h-3.5" /> Unlock Documents for this Intern
                </Button>
                <Button
                  size="sm"
                  onClick={() => updateInternDocLock(selectedIntern.id, true)}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-8 shadow-sm flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" /> Lock Documents for this Intern
                </Button>
                {selectedIntern.document_lock_override !== null && selectedIntern.document_lock_override !== undefined && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateInternDocLock(selectedIntern.id, null)}
                    className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-bold text-xs h-8 shadow-sm flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3 h-3 text-slate-500" /> Reset to Batch Default
                  </Button>
                )}
              </div>
            </div>

            {/* 2. Documents History Tracker and Actions */}
            <div className={selectedIntern.status !== 'Accepted' ? 'opacity-50 pointer-events-none' : ''}>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Official Credential Documents {selectedIntern.status !== 'Accepted' && '(Locked until Accepted)'}
              </h4>
              
              <div className="space-y-3">
                {/* Offer Letter */}
                <div className="flex items-center justify-between border border-slate-200 rounded-xl p-3 bg-white shadow-sm">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-indigo-500" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Offer Letter</p>
                      <p className="text-[10px] text-slate-500">
                        {selectedIntern.intern_documents?.offer_letter_generated ? 'Generated and logged' : 'Not generated yet'}
                      </p>
                    </div>
                  </div>
                  <div>
                    {selectedIntern.intern_documents?.offer_letter_generated ? (
                      <button
                        onClick={() => handleDownloadDoc('offer-letter', selectedIntern.id, selectedIntern.full_name)}
                        className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-colors"
                      >
                        Download PDF
                      </button>
                    ) : (
                      <button
                        onClick={() => router.push(`/dashboard/documents/offer-letter?internId=${selectedIntern.id}`)}
                        className="inline-flex items-center px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-transform shadow-sm"
                      >
                        Generate Letter <ArrowUpRight className="h-3 w-3 ml-1" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Completion Certificate */}
                <div className="flex items-center justify-between border border-slate-200 rounded-xl p-3 bg-white shadow-sm">
                  <div className="flex items-center space-x-3">
                    <Award className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Completion Certificate</p>
                      <p className="text-[10px] text-slate-500">
                        {selectedIntern.intern_documents?.certificate_generated ? 'Generated and logged' : 'Not generated yet'}
                      </p>
                    </div>
                  </div>
                  <div>
                    {selectedIntern.intern_documents?.certificate_generated ? (
                      <button
                        onClick={() => handleDownloadDoc('certificate', selectedIntern.id, selectedIntern.full_name)}
                        className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-colors"
                      >
                        Download PDF
                      </button>
                    ) : (
                      <button
                        onClick={() => router.push(`/dashboard/documents/certificate?internId=${selectedIntern.id}`)}
                        className="inline-flex items-center px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-transform shadow-sm"
                      >
                        Generate Certificate <ArrowUpRight className="h-3 w-3 ml-1" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </Modal>
      )}
    </PageWrapper>
  );
}
