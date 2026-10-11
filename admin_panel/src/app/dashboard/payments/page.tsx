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
  CreditCard, CheckCircle2, Clock, XCircle, AlertTriangle, RefreshCw,
  Search, Filter, ExternalLink, ShieldAlert, Sparkles, Check, X,
  Eye, FileText, ArrowUpDown, Copy, UserCheck, UserX, AlertOctagon, Mail
} from 'lucide-react';

interface PaymentCandidate {
  id: string;
  full_name: string;
  email: string;
  whatsapp?: string;
  domain: string;
  semester: number;
  registration_number: string;
  university_registration_number?: string;
  university?: string;
  pipeline_stage: string;
  status: string;
  payment_deadline?: string;
  payment_method?: string;
  payment_transaction_id?: string;
  payment_screenshot_url?: string;
  payment_status?: string;
  payment_verified_at?: string;
  payment_verified_by?: string;
  batch_id?: string;
  batches?: { id: string; name: string; status: string };
  is_duplicate_tid: boolean;
  is_deadline_expired: boolean;
  created_at: string;
  updated_at?: string;
}

interface Batch {
  id: string;
  name: string;
  status: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentCandidate[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // View / Inspection Modal state
  const [inspectModalOpen, setInspectModalOpen] = useState<boolean>(false);
  const [activePayment, setActivePayment] = useState<PaymentCandidate | null>(null);

  // Reject Proof modal state
  const [rejectModalOpen, setRejectModalOpen] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [rejectingCandidateId, setRejectingCandidateId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<boolean>(false);
  const [runningExpiryCheck, setRunningExpiryCheck] = useState<boolean>(false);

  // 1. Fetch Payments Data
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedBatch !== 'all') params.set('batch_id', selectedBatch);
      if (selectedDomain !== 'all') params.set('domain', selectedDomain);
      if (selectedStatus !== 'all') params.set('status', selectedStatus);

      const res = await fetch(`/api/payments?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch payment records');

      setPayments(data.payments || []);
      setBatches(data.batches || []);
    } catch (err: any) {
      toast.error(err.message || 'Error fetching payments');
    } finally {
      setLoading(false);
    }
  }, [selectedBatch, selectedDomain, selectedStatus]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('realtime_payments_admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'interns' }, () => {
        fetchPayments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPayments]);

  // Handle Verify & Enroll
  const handleVerifyPayment = async (candidate: PaymentCandidate) => {
    if (!confirm(`Verify payment and officially enroll ${candidate.full_name}? This will unlock full dashboard access immediately.`)) {
      return;
    }

    setProcessingAction(true);
    const toastId = toast.loading('Enrolling candidate & unlocking portal...');
    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intern_id: candidate.id,
          action: 'approve'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      toast.success(data.message || 'Enrolled successfully!', { id: toastId });
      fetchPayments();
      if (inspectModalOpen) setInspectModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Error approving payment', { id: toastId });
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle Reject Receipt
  const handleRejectReceipt = async () => {
    if (!rejectingCandidateId) return;

    setProcessingAction(true);
    const toastId = toast.loading('Rejecting receipt proof...');
    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intern_id: rejectingCandidateId,
          action: 'reject',
          rejection_reason: rejectionReason.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');

      toast.success(data.message, { id: toastId });
      setRejectModalOpen(false);
      setRejectionReason('');
      setRejectingCandidateId(null);
      fetchPayments();
      if (inspectModalOpen) setInspectModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Error rejecting receipt', { id: toastId });
    } finally {
      setProcessingAction(false);
    }
  };

  // Run Expiry Check
  const handleRunExpiryCheck = async () => {
    if (!confirm('Run automated deadline expiry check? Unpaid candidates past 72h will have seats released.')) {
      return;
    }

    setRunningExpiryCheck(true);
    const toastId = toast.loading('Checking expired deadlines & promoting waitlist...');
    try {
      const res = await fetch('/api/payments/deadlines', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Expiry check failed');

      toast.success(`Done! Released: ${data.expired_count}, Promoted: ${data.promoted_count}`, { id: toastId });
      fetchPayments();
    } catch (err: any) {
      toast.error(err.message || 'Expiry check error', { id: toastId });
    } finally {
      setRunningExpiryCheck(false);
    }
  };

  // Resend Shortlist Notification
  const handleResendEmail = async (candidateId: string) => {
    const toastId = toast.loading('Resending payment notice email...');
    try {
      const res = await fetch('/api/interview/admin/resend-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intern_id: candidateId,
          email_type: 'shortlisted'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend notice');
      toast.success(data.message || 'Payment notice email sent!', { id: toastId });
    } catch (err: any) {
      toast.error(err.message || 'Failed to send email', { id: toastId });
    }
  };

  // Filter candidates
  const filteredPayments = payments.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      p.full_name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      (p.registration_number && p.registration_number.toLowerCase().includes(q)) ||
      (p.payment_transaction_id && p.payment_transaction_id.toLowerCase().includes(q));

    return matchesSearch;
  });

  const totalCount = payments.length;
  const verifiedCount = payments.filter(p => p.payment_status === 'verified' || p.pipeline_stage === 'approved').length;
  const pendingProofCount = payments.filter(p => !p.payment_screenshot_url && p.pipeline_stage !== 'cancelled_non_payment').length;
  const submittedProofCount = payments.filter(p => p.payment_screenshot_url && p.payment_status !== 'verified').length;
  const expiredCount = payments.filter(p => p.pipeline_stage === 'cancelled_non_payment' || p.is_deadline_expired).length;

  return (
    <PageWrapper
      title="Fee Payments & Enrollment Desk"
      actions={
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={fetchPayments}
            className="flex items-center gap-1.5 text-xs text-slate-700 border-slate-300 hover:bg-slate-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            onClick={handleRunExpiryCheck}
            disabled={runningExpiryCheck}
            className="flex items-center gap-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-white"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Run 72h Expiry Check
          </Button>
        </div>
      }
    >
      {/* Summary KPI Cards matching Main System */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 shadow-sm border-slate-200">
          <h3 className="text-xs font-semibold text-slate-500 mb-1 flex items-center">
            <CreditCard className="w-4 h-4 mr-1.5 text-slate-400" /> Total Shortlisted
          </h3>
          <p className="text-2xl font-bold text-slate-800">{totalCount}</p>
        </Card>

        <Card className="p-4 shadow-sm border-slate-200">
          <h3 className="text-xs font-semibold text-amber-600 mb-1 flex items-center">
            <Clock className="w-4 h-4 mr-1.5 text-amber-500" /> Awaiting Proof
          </h3>
          <p className="text-2xl font-bold text-amber-700">{pendingProofCount}</p>
        </Card>

        <Card className="p-4 shadow-sm border-slate-200">
          <h3 className="text-xs font-semibold text-blue-600 mb-1 flex items-center">
            <FileText className="w-4 h-4 mr-1.5 text-blue-500" /> Proof Submitted
          </h3>
          <p className="text-2xl font-bold text-blue-700">{submittedProofCount}</p>
        </Card>

        <Card className="p-4 shadow-sm border-slate-200">
          <h3 className="text-xs font-semibold text-emerald-600 mb-1 flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-500" /> Verified & Enrolled
          </h3>
          <p className="text-2xl font-bold text-emerald-700">{verifiedCount}</p>
        </Card>

        <Card className="p-4 shadow-sm border-slate-200">
          <h3 className="text-xs font-semibold text-rose-600 mb-1 flex items-center">
            <XCircle className="w-4 h-4 mr-1.5 text-rose-500" /> Expired / Released
          </h3>
          <p className="text-2xl font-bold text-rose-700">{expiredCount}</p>
        </Card>
      </div>

      {/* Filter Toolbar matching Main System */}
      <Card className="p-4 border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Batch</label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full bg-white border border-slate-200 text-xs text-slate-800 rounded-lg p-2.5 focus:border-blue-500 outline-none"
            >
              <option value="all">All Batches</option>
              {batches.map(b => (
                <option key={b.id} value={b.id}>{b.name} ({b.status})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Domain Track</label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full bg-white border border-slate-200 text-xs text-slate-800 rounded-lg p-2.5 focus:border-blue-500 outline-none"
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
            <label className="text-xs font-semibold text-slate-500 block mb-1">Verification Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-white border border-slate-200 text-xs text-slate-800 rounded-lg p-2.5 focus:border-blue-500 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Proof Submitted (Needs Review)</option>
              <option value="verified">Verified & Enrolled</option>
              <option value="pending">Awaiting Payment Upload</option>
              <option value="expired">Expired (72h Exceeded)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Search Candidate</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by name, email, TID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 text-xs text-slate-800 rounded-lg pl-9 pr-3 py-2.5 focus:border-blue-500 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Main Payments Table matching Main System */}
      <Card className="overflow-hidden border-slate-200 shadow-sm p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Candidate Profile</th>
                <th className="px-6 py-3.5">Payment Method & TID</th>
                <th className="px-6 py-3.5">Receipt Proof</th>
                <th className="px-6 py-3.5">72h Reservation</th>
                <th className="px-6 py-3.5">Verification Status</th>
                <th className="px-6 py-3.5 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-medium bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    Loading fee payment submissions...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    No payment records match the current filters.
                  </td>
                </tr>
              ) : (
                filteredPayments.map(p => {
                  const isVerified = p.payment_status === 'verified' || p.pipeline_stage === 'approved';
                  const isExpired = p.pipeline_stage === 'cancelled_non_payment' || (p.is_deadline_expired && !isVerified);
                  const hasProof = Boolean(p.payment_screenshot_url);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Candidate Column */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          {p.full_name}
                          {p.batches && (
                            <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 font-semibold">
                              {p.batches.name}
                            </span>
                          )}
                        </div>
                        <div className="text-slate-500 text-xs">{p.email}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          ID: <strong className="text-blue-600">{p.registration_number}</strong> • Track: {p.domain}
                        </div>
                      </td>

                      {/* Method & TID Column */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">
                          {p.payment_method || 'Unspecified'}
                        </div>
                        {p.payment_transaction_id ? (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {p.payment_transaction_id}
                            </span>
                            {p.is_duplicate_tid && (
                              <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                                <AlertTriangle className="w-3 h-3 text-rose-500" /> Duplicate TID
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No TID entered</span>
                        )}
                      </td>

                      {/* Receipt Proof Column */}
                      <td className="px-6 py-4">
                        {p.payment_screenshot_url ? (
                          <button
                            onClick={() => {
                              setActivePayment(p);
                              setInspectModalOpen(true);
                            }}
                            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-bold bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-all"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            View Receipt Proof
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-300" /> Not uploaded yet
                          </span>
                        )}
                      </td>

                      {/* 72h Countdown Column */}
                      <td className="px-6 py-4">
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5" /> Expired (Released)
                          </span>
                        ) : isVerified ? (
                          <span className="text-xs text-emerald-700 font-medium">Verified Enrolled</span>
                        ) : p.payment_deadline ? (
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-800 flex items-center gap-1 text-xs">
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                              {new Date(p.payment_deadline) > new Date() ? (
                                <span>
                                  {Math.max(0, Math.ceil((new Date(p.payment_deadline).getTime() - Date.now()) / (1000 * 60 * 60)))}h left
                                </span>
                              ) : (
                                <span className="text-rose-600 font-bold">Past Deadline</span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 block">
                              Until {new Date(p.payment_deadline).toLocaleDateString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      {/* Status Column */}
                      <td className="px-6 py-4">
                        {isVerified ? (
                          <Badge variant="success">Verified & Enrolled</Badge>
                        ) : p.payment_status === 'submitted' || hasProof ? (
                          <Badge variant="blue">Proof Submitted</Badge>
                        ) : isExpired ? (
                          <Badge variant="danger">Seat Released</Badge>
                        ) : (
                          <Badge variant="warning">Awaiting Payment</Badge>
                        )}
                      </td>

                      {/* Actions Column */}
                      <td className="px-6 py-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* VIEW DETAILS BUTTON (Always present as requested by user!) */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setActivePayment(p);
                              setInspectModalOpen(true);
                            }}
                            className="h-8 text-xs border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-600" />
                            View Details
                          </Button>

                          {!isVerified && p.pipeline_stage !== 'cancelled_non_payment' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleVerifyPayment(p)}
                                disabled={processingAction}
                                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 font-bold shadow-sm"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Verify & Enroll
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setRejectingCandidateId(p.id);
                                  setRejectModalOpen(true);
                                }}
                                disabled={processingAction}
                                className="h-8 text-xs border-slate-300 text-rose-600 hover:bg-rose-50"
                              >
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
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

      {/* COMPREHENSIVE VIEW & INSPECTION MODAL */}
      <Modal
        isOpen={inspectModalOpen}
        onClose={() => setInspectModalOpen(false)}
        title={activePayment ? `Payment Dossier: ${activePayment.full_name}` : 'Payment Inspection'}
        size="lg"
      >
        {activePayment && (
          <div className="space-y-6">
            {/* Header Details Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  {activePayment.full_name}
                  <span className="text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                    {activePayment.domain}
                  </span>
                </h4>
                <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                  <span>Reg ID: <strong className="font-mono text-slate-800">{activePayment.registration_number}</strong></span>
                  <span>Batch: <strong className="text-slate-800">{activePayment.batches?.name || 'Active Batch'}</strong></span>
                  <span>Semester: {activePayment.semester}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleResendEmail(activePayment.id)}
                  className="text-xs flex items-center gap-1 border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-600" /> Resend Notice
                </Button>
              </div>
            </div>

            {/* Candidate Contact & Profile Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-slate-400 font-bold uppercase block text-[10px] mb-1">Email Address</span>
                <span className="font-bold text-slate-900 break-all">{activePayment.email}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-slate-400 font-bold uppercase block text-[10px] mb-1">WhatsApp</span>
                <span className="font-bold text-slate-900">{activePayment.whatsapp || 'N/A'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-slate-400 font-bold uppercase block text-[10px] mb-1">University</span>
                <span className="font-bold text-slate-900">{activePayment.university || 'N/A'}</span>
              </div>
            </div>

            {/* Payment Submission Section */}
            <div className="border border-slate-200 rounded-2xl p-5 space-y-4 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h5 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-blue-600" /> Payment Proof & Verification
                </h5>
                <div>
                  {activePayment.payment_status === 'verified' || activePayment.pipeline_stage === 'approved' ? (
                    <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified & Enrolled
                    </span>
                  ) : activePayment.payment_screenshot_url ? (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-bold">
                      Proof Submitted (Pending Review)
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold">
                      Awaiting Candidate Proof
                    </span>
                  )}
                </div>
              </div>

              {/* 72-Hour Deadline Details */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-500 font-medium block">72-Hour Seat Reservation:</span>
                  <span className="font-bold text-slate-800">
                    {activePayment.payment_deadline ? new Date(activePayment.payment_deadline).toLocaleString() : 'No deadline recorded'}
                  </span>
                </div>
                {activePayment.payment_deadline && (
                  <span className={`font-extrabold px-2.5 py-1 rounded-md ${
                    new Date(activePayment.payment_deadline) > new Date()
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {new Date(activePayment.payment_deadline) > new Date()
                      ? `${Math.max(0, Math.ceil((new Date(activePayment.payment_deadline).getTime() - Date.now()) / (1000 * 60 * 60)))}h Remaining`
                      : 'Expired'}
                  </span>
                )}
              </div>

              {/* Receipt screenshot image if uploaded */}
              {activePayment.payment_screenshot_url ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 font-bold uppercase block text-[10px] mb-1">Payment Method</span>
                      <span className="font-extrabold text-slate-900">{activePayment.payment_method || 'Unspecified'}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 font-bold uppercase block text-[10px] mb-1">Transaction ID (TID)</span>
                      <span className="font-mono font-extrabold text-blue-700 text-sm">{activePayment.payment_transaction_id || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-2 bg-slate-50 text-center">
                    <span className="text-[11px] font-bold text-slate-500 block mb-2">Submitted Payment Receipt Screenshot:</span>
                    <a href={activePayment.payment_screenshot_url} target="_blank" rel="noreferrer" className="inline-block relative group">
                      <img
                        src={activePayment.payment_screenshot_url}
                        alt="Payment Receipt"
                        className="max-h-80 mx-auto rounded-lg shadow-sm border border-slate-200 object-contain hover:opacity-95 transition-all"
                      />
                      <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] px-2 py-1 rounded font-bold flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> Click to open original
                      </span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-amber-50/70 border border-amber-200/80 rounded-xl text-center space-y-1">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="font-bold text-amber-900 text-sm">Receipt Not Yet Uploaded</p>
                  <p className="text-xs text-amber-700 max-w-md mx-auto">
                    The candidate has received their 72-hour shortlist notice but has not yet submitted proof of transaction in their portal.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Bottom Action Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <Button variant="ghost" onClick={() => setInspectModalOpen(false)} className="text-xs">
                Close
              </Button>

              <div className="flex items-center gap-2">
                {activePayment.payment_screenshot_url && activePayment.payment_status !== 'verified' && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRejectingCandidateId(activePayment.id);
                      setRejectModalOpen(true);
                    }}
                    disabled={processingAction}
                    className="text-xs border-rose-300 text-rose-600 hover:bg-rose-50"
                  >
                    Reject Receipt Proof
                  </Button>
                )}

                {activePayment.payment_status !== 'verified' && activePayment.pipeline_stage !== 'approved' && (
                  <Button
                    onClick={() => handleVerifyPayment(activePayment)}
                    disabled={processingAction}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 flex items-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    Verify Payment & Officially Enroll
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* REJECT RECEIPT MODAL */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Payment Receipt"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Specify why this receipt proof is being rejected (e.g., Unverifiable TID, Invalid Amount, Fake Slip). The candidate will be notified to re-upload before their 72h window expires.
          </p>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Rejection Reason</label>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Transaction ID could not be found in bank statement..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:border-rose-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setRejectModalOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button
              onClick={handleRejectReceipt}
              disabled={processingAction}
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
