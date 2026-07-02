'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Download, FileSignature, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatPKR, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Proposal Form State
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [proposalTitle, setProposalTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scopeOfWork, setScopeOfWork] = useState('');
  const [timeline, setTimeline] = useState('');
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [status, setStatus] = useState('draft');

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/proposals');
      if (!res.ok) throw new Error('Failed to load proposals');
      const data = await res.json();
      setProposals(data);
    } catch (err: any) {
      toast.error(err.message || 'Error loading proposals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail || !proposalTitle || !estimatedCost || !timeline) {
      toast.error('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    const proposalToast = toast.loading('Generating proposal document...');

    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: clientName,
          client_email: clientEmail,
          proposal_title: proposalTitle,
          description,
          scope_of_work: scopeOfWork,
          timeline,
          estimated_cost: estimatedCost,
          status
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save proposal');

      toast.success('Proposal saved successfully!', { id: proposalToast });

      // Trigger PDF download
      handleDownload(data.id, data.proposal_title);

      // Reset
      setClientName('');
      setClientEmail('');
      setProposalTitle('');
      setDescription('');
      setScopeOfWork('');
      setTimeline('');
      setEstimatedCost(0);
      setStatus('draft');
      setIsOpen(false);

      // Refresh list
      fetchProposals();
    } catch (err: any) {
      toast.error(err.message || 'Error saving proposal', { id: proposalToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = async (id: string, title: string) => {
    const downloadToast = toast.loading('Downloading Proposal PDF...');
    try {
      const response = await fetch(`/api/documents/proposal?proposalId=${id}`);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Proposal_${title.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Proposal downloaded successfully!', { id: downloadToast });
    } catch (err: any) {
      toast.error(err.message || 'Download failed', { id: downloadToast });
    }
  };

  return (
    <PageWrapper
      title="Proposals Tracking"
      actions={
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-1.5 shadow-md shadow-blue-200"
        >
          <Plus className="h-4 w-4" />
          <span>New Proposal</span>
        </Button>
      }
    >
      {/* Table grid */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={5} cols={7} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Proposal Title</th>
                  <th className="px-6 py-3.5">Client</th>
                  <th className="px-6 py-3.5">Estimated Cost</th>
                  <th className="px-6 py-3.5">Timeline</th>
                  <th className="px-6 py-3.5">Sent By</th>
                  <th className="px-6 py-3.5">Sent Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
                {proposals.map((prop) => (
                  <tr key={prop.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 truncate max-w-[180px]">{prop.proposal_title}</td>
                    <td className="px-6 py-4 font-semibold text-slate-950 truncate max-w-[130px]">{prop.client_name}</td>
                    <td className="px-6 py-4 font-bold text-slate-950">{formatPKR(prop.estimated_cost)}</td>
                    <td className="px-6 py-4 text-slate-500">{prop.timeline || '-'}</td>
                    <td className="px-6 py-4 text-slate-400 truncate max-w-[120px]">{prop.sent_by}</td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(prop.sent_date)}</td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          prop.status === 'accepted'
                            ? 'success'
                            : prop.status === 'sent'
                            ? 'blue'
                            : prop.status === 'rejected'
                            ? 'danger'
                            : 'neutral'
                        }
                      >
                        {prop.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(prop.id, prop.proposal_title)}
                        className="text-blue-600 hover:bg-blue-50/50 py-1 px-2.5 rounded-lg h-7 font-bold text-xs"
                      >
                        <Download className="h-3.5 w-3.5 mr-1" />
                        PDF
                      </Button>
                    </td>
                  </tr>
                ))}

                {proposals.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                      No proposals sent yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Proposal Modal Form */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Generate New Project Proposal"
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client name */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Client Name</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Buraq Ride Hailing"
                className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>

            {/* Client email */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Client Email</label>
              <input
                type="email"
                required
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="tech@buraq.pk"
                className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>

            {/* Proposal Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">Proposal / Project Title</label>
              <input
                type="text"
                required
                value={proposalTitle}
                onChange={(e) => setProposalTitle(e.target.value)}
                placeholder="e.g. Mobile App Development for Ride-Hailing Service"
                className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>

            {/* Project description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">Project Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Detail the project goals, user experiences, and key solutions..."
                className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>

            {/* Scope of Work */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">Scope of Work (line-separated bullets)</label>
              <textarea
                value={scopeOfWork}
                onChange={(e) => setScopeOfWork(e.target.value)}
                rows={3}
                placeholder="UI/UX Design in Figma&#10;Frontend React Native Apps&#10;Node.js Backend APIs and dashboard&#10;Production server deployment"
                className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>

            {/* Timeline */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Timeline</label>
              <input
                type="text"
                required
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                placeholder="e.g. 4 Months"
                className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>

            {/* Estimated cost */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Estimated Cost (PKR)</label>
              <input
                type="number"
                required
                min={0}
                value={estimatedCost || ''}
                onChange={(e) => setEstimatedCost(parseFloat(e.target.value) || 0)}
                placeholder="e.g. 1800000"
                className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          {/* Status & Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-t border-slate-100 pt-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Proposal Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="block px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex space-x-3 pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="bg-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
              >
                Save & Generate Proposal PDF
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
