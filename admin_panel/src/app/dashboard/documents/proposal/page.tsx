'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Download, Trash2, FileSignature, PlusCircle } from 'lucide-react';
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
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [status, setStatus] = useState('draft');

  // Scope of Work Builder State (Array of bullet strings)
  const [scopePoints, setScopePoints] = useState<string[]>(['']);

  // Timeline Phase Table Builder State
  const [timelineTable, setTimelineTable] = useState<any[]>([
    { phase: 'Phase 1: Discovery & Design', duration: '3 Weeks', deliverable: 'Figma wireframes & architecture specs' }
  ]);

  // Why CloudExify editable default text
  const [whyCloudExify, setWhyCloudExify] = useState(
    'CloudExify is a Pakistan-based software development company specializing in premium web apps, mobile apps, SaaS, and AI-powered solutions. We ship clean, secure, production-level code.'
  );

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

  const handleAddScopePoint = () => {
    setScopePoints([...scopePoints, '']);
  };

  const handleRemoveScopePoint = (idx: number) => {
    if (scopePoints.length === 1) return;
    setScopePoints(scopePoints.filter((_, i) => i !== idx));
  };

  const handleScopePointChange = (idx: number, val: string) => {
    const updated = [...scopePoints];
    updated[idx] = val;
    setScopePoints(updated);
  };

  const handleAddTimelineRow = () => {
    setTimelineTable([...timelineTable, { phase: '', duration: '', deliverable: '' }]);
  };

  const handleRemoveTimelineRow = (idx: number) => {
    if (timelineTable.length === 1) return;
    setTimelineTable(timelineTable.filter((_, i) => i !== idx));
  };

  const handleTimelineRowChange = (idx: number, field: string, value: string) => {
    const updated = [...timelineTable];
    updated[idx][field] = value;
    setTimelineTable(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail || !proposalTitle || !estimatedCost) {
      toast.error('Please complete all required fields.');
      return;
    }

    const invalidScope = scopePoints.some(pt => !pt.trim());
    if (invalidScope) {
      toast.error('Please ensure all scope of work bullets have content.');
      return;
    }

    const invalidTimeline = timelineTable.some(row => !row.phase || !row.duration || !row.deliverable);
    if (invalidTimeline) {
      toast.error('Please ensure all timeline rows have phase, duration, and deliverable.');
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
          scope_of_work: JSON.stringify(scopePoints.filter(p => p.trim() !== '')),
          timeline: JSON.stringify(timelineTable),
          estimated_cost: estimatedCost,
          why_cloudexify: whyCloudExify,
          status
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save proposal');

      toast.success('Proposal saved successfully!', { id: proposalToast });

      // Trigger PDF download
      handleDownload(data.id, data.proposal_title);

      // Reset Form and close modal
      setClientName('');
      setClientEmail('');
      setProposalTitle('');
      setDescription('');
      setScopePoints(['']);
      setTimelineTable([{ phase: 'Phase 1: Discovery & Design', duration: '3 Weeks', deliverable: 'Figma wireframes & architecture specs' }]);
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
      title="Project Proposals"
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
      {/* Proposals list grid */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={5} cols={8} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Proposal Title</th>
                  <th className="px-6 py-3.5">Client</th>
                  <th className="px-6 py-3.5">Estimated Cost</th>
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
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
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
                rows={2}
                placeholder="Detail the project goals, user experiences, and key solutions..."
                className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          {/* Scope of Work Builder */}
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-1.5 mb-2.5">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Scope of Work (Bullets)</h4>
              <button
                type="button"
                onClick={handleAddScopePoint}
                className="text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center space-x-1"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add Bullet</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-36 overflow-y-auto pr-1">
              {scopePoints.map((point, idx) => (
                <div key={idx} className="flex items-center space-x-2 bg-slate-50/50 p-2 border border-slate-100 rounded-lg">
                  <span className="text-xs text-blue-500 font-bold">•</span>
                  <input
                    type="text"
                    required
                    placeholder="Enter scope bullet point..."
                    value={point}
                    onChange={(e) => handleScopePointChange(idx, e.target.value)}
                    className="flex-1 block px-2.5 py-1 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveScopePoint(idx)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Milestones Table Builder */}
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-1.5 mb-2.5">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Timeline Milestones Table</h4>
              <button
                type="button"
                onClick={handleAddTimelineRow}
                className="text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center space-x-1"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add Phase</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
              {timelineTable.map((row, idx) => (
                <div key={idx} className="flex items-center space-x-2 bg-slate-50/50 p-2.5 border border-slate-100 rounded-xl">
                  {/* Phase */}
                  <input
                    type="text"
                    required
                    placeholder="Phase name (e.g. Discovery)"
                    value={row.phase}
                    onChange={(e) => handleTimelineRowChange(idx, 'phase', e.target.value)}
                    className="w-1/3 block px-2 py-1 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                  {/* Duration */}
                  <input
                    type="text"
                    required
                    placeholder="Duration (e.g. 2 weeks)"
                    value={row.duration}
                    onChange={(e) => handleTimelineRowChange(idx, 'duration', e.target.value)}
                    className="w-1/4 block px-2 py-1 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                  {/* Key Deliverable */}
                  <input
                    type="text"
                    required
                    placeholder="Key deliverable..."
                    value={row.deliverable}
                    onChange={(e) => handleTimelineRowChange(idx, 'deliverable', e.target.value)}
                    className="flex-1 block px-2 py-1 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveTimelineRow(idx)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Why CloudExify */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">Why CloudExify (Company Profile Statement)</label>
              <textarea
                value={whyCloudExify}
                onChange={(e) => setWhyCloudExify(e.target.value)}
                rows={2}
                placeholder="Why CloudExify section..."
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

            {/* Status Option */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Proposal Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
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
        </form>
      </Modal>
    </PageWrapper>
  );
}
