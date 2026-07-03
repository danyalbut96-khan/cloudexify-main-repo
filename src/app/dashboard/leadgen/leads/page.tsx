'use client';

import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { Search, Filter, Eye, Check, X, Mail, Phone, Calendar, Star, Building2, Send, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LeadsTablePage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Drawer / details state
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [leadDetail, setLeadDetail] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  // Simulation form states
  const [simText, setSimText] = useState('');
  const [simChannel, setSimChannel] = useState<'email' | 'whatsapp'>('email');
  const [simulating, setSimulating] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search,
        category,
        status
      });

      const res = await fetch(`/api/leadgen/leads?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to load leads list');
      const data = await res.json();
      setLeads(data.leads);
      setTotal(data.total);
    } catch (err: any) {
      toast.error(err.message || 'Error fetching leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page, category, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLeads();
  };

  const handleRowClick = async (leadId: string) => {
    setSelectedLeadId(leadId);
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/leadgen/leads?leadId=${leadId}`);
      if (!res.ok) throw new Error('Failed to load lead details');
      const data = await res.json();
      setLeadDetail(data.lead);
      setHistory(data.history);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch details');
      setSelectedLeadId(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    const confirmMsg = `Are you sure you want to mark this lead as ${newStatus}?`;
    if (!window.confirm(confirmMsg)) return;

    const actionToast = toast.loading(`Updating status...`);
    try {
      const res = await fetch('/api/leadgen/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');

      toast.success(`Lead marked as ${newStatus}!`, { id: actionToast });
      fetchLeads();
      if (selectedLeadId === leadId) {
        handleRowClick(leadId); // Refresh drawer details
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating status', { id: actionToast });
    }
  };

  const handleManualOutreach = async (action: 'resend_email' | 'send_whatsapp') => {
    const channelName = action === 'resend_email' ? 'Email' : 'WhatsApp template';
    const confirmMsg = `Confirm sending outbound ${channelName} now? This will dispatch a real message via configured APIs.`;
    if (!window.confirm(confirmMsg)) return;

    const outreachToast = toast.loading(`Sending manual outreach...`);
    try {
      const res = await fetch('/api/leadgen/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, leadId: selectedLeadId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send outreach.');

      toast.success(`${channelName} sent successfully!`, { id: outreachToast });
      if (selectedLeadId) handleRowClick(selectedLeadId); // Refresh logs
      fetchLeads();
    } catch (err: any) {
      toast.error(err.message || 'Outreach failed', { id: outreachToast });
    }
  };

  const handleSimulateReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simText) return;

    setSimulating(true);
    const simToast = toast.loading('Simulating inbound response...');
    try {
      const res = await fetch('/api/leadgen/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'simulate_reply',
          leadId: selectedLeadId,
          replyText: simText,
          replyChannel: simChannel
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reply simulation failed.');

      toast.success(`Reply classified as ${data.classification.toUpperCase()}! Lead status updated to ${data.status}.`, { id: simToast });
      setSimText('');
      if (selectedLeadId) handleRowClick(selectedLeadId);
      fetchLeads();
    } catch (err: any) {
      toast.error(err.message || 'Simulation failed', { id: simToast });
    } finally {
      setSimulating(false);
    }
  };

  const getStatusBadge = (statusStr: string) => {
    const statuses: Record<string, 'neutral' | 'success' | 'blue' | 'warning' | 'danger' | 'info'> = {
      discovered: 'neutral',
      enriched: 'blue',
      emailed: 'warning',
      followed_up: 'info',
      replied: 'success',
      qualified: 'success',
      unreachable: 'danger',
      declined: 'danger'
    };
    const cleanStr = statusStr.replace('_', ' ');
    return <Badge variant={statuses[statusStr] || 'neutral'}>{cleanStr}</Badge>;
  };

  return (
    <PageWrapper title="Lead Prospect Directory">
      {/* Search & Filters */}
      <Card className="mb-6 p-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">Search Business Name</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. Islamabad Dental Clinic"
                className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">Category Filter</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none bg-white font-medium"
            >
              <option value="">All Categories</option>
              <option value="restaurant">Restaurants</option>
              <option value="clinic">Clinics</option>
              <option value="beauty_salon">Beauty Salons</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">Outreach Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none bg-white font-medium"
            >
              <option value="">All Statuses</option>
              <option value="discovered">Discovered</option>
              <option value="enriched">Enriched</option>
              <option value="emailed">Emailed</option>
              <option value="followed_up">Followed Up</option>
              <option value="replied">Replied</option>
              <option value="qualified">Qualified</option>
              <option value="unreachable">Unreachable</option>
              <option value="declined">Declined</option>
            </select>
          </div>

          <div>
            <Button type="submit" variant="primary" size="sm" className="w-full h-[34px]">
              <Filter className="h-3.5 w-3.5 mr-1" /> Apply Filter
            </Button>
          </div>
        </form>
      </Card>

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={5} cols={7} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Business Name</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Rating (Reviews)</th>
                  <th className="px-6 py-3.5">Contact Detail</th>
                  <th className="px-6 py-3.5">City</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => handleRowClick(lead.id)}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 font-bold text-slate-900 truncate max-w-[200px]">{lead.business_name}</td>
                    <td className="px-6 py-4 uppercase font-semibold text-slate-400">{lead.category.replace('_', ' ')}</td>
                    <td className="px-6 py-4 font-bold text-slate-950 flex items-center mt-0.5">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 mr-1" />
                      {lead.google_rating || 'N/A'}{' '}
                      <span className="text-[10px] text-slate-400 ml-1 font-semibold">({lead.google_review_count || 0})</span>
                    </td>
                    <td className="px-6 py-4">
                      {lead.email ? (
                        <div className="flex items-center text-slate-500"><Mail className="h-3.5 w-3.5 mr-1" /> {lead.email}</div>
                      ) : lead.phone ? (
                        <div className="flex items-center text-slate-500"><Phone className="h-3.5 w-3.5 mr-1" /> {lead.phone}</div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{lead.city}</td>
                    <td className="px-6 py-4">{getStatusBadge(lead.status)}</td>
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center space-x-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRowClick(lead.id)}
                          className="h-7 w-7 p-0"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(lead.id, 'qualified')}
                          className="h-7 w-7 p-0 hover:bg-emerald-50 text-emerald-600"
                          title="Mark Qualified"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(lead.id, 'declined')}
                          className="h-7 w-7 p-0 hover:bg-rose-50 text-rose-600"
                          title="Mark Declined"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}

                {leads.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      No leads matched the search criteria. Try triggering Discovery.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {total > limit && (
          <div className="flex justify-between items-center px-6 py-3 border-t border-slate-100 bg-slate-50">
            <span className="text-xs text-slate-500 font-semibold">Showing {(page - 1) * limit + 1} - {Math.min(page * limit, total)} of {total} prospects</span>
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="bg-white"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page * limit >= total}
                onClick={() => setPage(page + 1)}
                className="bg-white"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Side Details Drawer */}
      {selectedLeadId && leadDetail && (
        <>
          {/* Overlay background */}
          <div
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedLeadId(null)}
          />

          {/* Drawer container */}
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full transform transition-transform duration-300 overflow-y-auto">
            {/* Header info */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{leadDetail.category.replace('_', ' ')}</span>
                <h3 className="text-lg font-black text-slate-900 mt-1">{leadDetail.business_name}</h3>
                <div className="flex space-x-1.5 mt-2">
                  {getStatusBadge(leadDetail.status)}
                  <Badge variant="neutral" className="bg-slate-100 text-slate-600 border-none">{leadDetail.city}</Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLeadId(null)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content areas */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {/* Grounded Factual details */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Prospect Profile</h4>
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600 bg-slate-50/70 border border-slate-100 rounded-xl p-4">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Phone</span>
                    {leadDetail.phone || 'N/A'}
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Email</span>
                    {leadDetail.email || 'N/A'}
                  </div>
                  <div className="col-span-2 border-t border-slate-100 pt-2.5">
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Address</span>
                    {leadDetail.address || 'N/A'}
                  </div>
                  {leadDetail.facebook_url && (
                    <div className="col-span-2 border-t border-slate-100 pt-2.5">
                      <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Facebook Profile</span>
                      <a href={leadDetail.facebook_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{leadDetail.facebook_url}</a>
                    </div>
                  )}
                </div>
              </div>

              {/* Personalization copy */}
              {leadDetail.personalization_detail && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Personalization Context</h4>
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-xs text-blue-900 font-medium italic leading-relaxed">
                    &quot;{leadDetail.personalization_detail}&quot;
                  </div>
                </div>
              )}

              {/* Action Toolbar */}
              <div className="space-y-3 border-t border-b border-slate-100 py-6">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Outreach Commands</h4>
                <div className="grid grid-cols-2 gap-3.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!leadDetail.email}
                    onClick={() => handleManualOutreach('resend_email')}
                    className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50/30 flex items-center justify-center font-bold"
                  >
                    <Mail className="h-3.5 w-3.5 mr-1.5" /> Mail Outreach
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!leadDetail.phone}
                    onClick={() => handleManualOutreach('send_whatsapp')}
                    className="bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50/30 flex items-center justify-center font-bold"
                  >
                    <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> WhatsApp Follow
                  </Button>
                </div>
              </div>

              {/* Chronological Outreach Logs / Conversation Thread */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Outreach Log Thread</h4>
                <div className="space-y-4">
                  {history.map((evt, idx) => {
                    const isOutbound = evt.direction === 'outbound';
                    return (
                      <div
                        key={evt.id}
                        className={`flex flex-col space-y-1.5 max-w-[85%] ${isOutbound ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                      >
                        <div className="flex items-center space-x-1.5 text-[9px] text-slate-400 font-semibold uppercase">
                          <span>{evt.channel}</span>
                          <span>•</span>
                          <span>{new Date(evt.created_at).toLocaleString()}</span>
                          {evt.status === 'failed' && <span className="text-rose-500 font-extrabold">(failed)</span>}
                        </div>
                        <div
                          className={`p-3.5 rounded-xl text-xs font-medium leading-relaxed ${
                            isOutbound
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-slate-100 text-slate-800 rounded-bl-none'
                          }`}
                        >
                          {evt.content}
                        </div>
                      </div>
                    );
                  })}

                  {history.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-6">No communication log entries recorded for this prospect.</p>
                  )}
                </div>
              </div>

              {/* Developer simulated responses */}
              <div className="space-y-3.5 border-t border-slate-100 pt-6">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4.5 w-4.5 text-slate-400" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Local Reply Simulator</h4>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Use this debugger panel to mimic an inbound reply and trigger OpenRouter categorization without real provider configuration.
                </p>
                <form onSubmit={handleSimulateReply} className="space-y-3">
                  <textarea
                    value={simText}
                    onChange={(e) => setSimText(e.target.value)}
                    required
                    placeholder="e.g. Yes we are looking for a website redesign, call me tomorrow at 10am."
                    className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none bg-white font-medium"
                    rows={2}
                  />
                  <div className="flex space-x-2">
                    <select
                      value={simChannel}
                      onChange={(e) => setSimChannel(e.target.value as any)}
                      className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg text-slate-600 focus:outline-none bg-white font-semibold"
                    >
                      <option value="email">Simulate Email reply</option>
                      <option value="whatsapp">Simulate WhatsApp reply</option>
                    </select>
                    <Button
                      type="submit"
                      variant="secondary"
                      size="sm"
                      isLoading={simulating}
                      className="flex-1 font-bold text-xs"
                    >
                      <Send className="h-3 w-3 mr-1" /> Inject Reply
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </PageWrapper>
  );
}
