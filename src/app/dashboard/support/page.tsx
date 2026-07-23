'use client';

import React, { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Card, CardTitle, CardValue } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LifeBuoy, Filter, Mail, Reply, CheckCircle2, Clock, MessageSquare, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SupportDashboard() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'answered' | 'closed'>('all');
  
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [replyStatus, setReplyStatus] = useState('answered');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/support');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTickets(data.tickets || []);
    } catch (err: any) {
      toast.error('Failed to load tickets: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    
    setIsReplying(true);
    const t = toast.loading('Sending reply...');
    try {
      const res = await fetch('/api/support', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedTicket.id,
          admin_reply: replyText,
          status: replyStatus
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success('Reply sent successfully!', { id: t });
      
      // Update local state
      setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, ...data.ticket } : t));
      setSelectedTicket({ ...selectedTicket, ...data.ticket });
      setReplyText('');
    } catch (err: any) {
      toast.error(err.message, { id: t });
    } finally {
      setIsReplying(false);
    }
  };

  const filteredTickets = tickets.filter(t => filter === 'all' ? true : t.status === filter);

  return (
    <PageWrapper
      title="Support Tickets"
      description="Manage and respond to intern support requests"
      icon={<LifeBuoy className="h-5 w-5 text-indigo-500" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Ticket List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {(['all', 'open', 'answered', 'closed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-colors ${filter === f ? 'bg-slate-800 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {f} {f === 'all' && `(${tickets.length})`}
                {f === 'open' && `(${tickets.filter(t => t.status === 'open').length})`}
              </button>
            ))}
          </div>

          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center p-8 bg-slate-50 border border-slate-100 rounded-xl text-slate-500 text-sm">
                No tickets found.
              </div>
            ) : (
              filteredTickets.map(ticket => (
                <div 
                  key={ticket.id}
                  onClick={() => { setSelectedTicket(ticket); setReplyText(ticket.admin_reply || ''); setReplyStatus(ticket.status === 'open' ? 'answered' : ticket.status); }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedTicket?.id === ticket.id ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 hover:border-indigo-300'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono text-slate-500 font-medium">{ticket.ticket_number}</span>
                    {ticket.status === 'open' && <Badge className="bg-amber-100 text-amber-700 text-[10px]">Open</Badge>}
                    {ticket.status === 'answered' && <Badge className="bg-blue-100 text-blue-700 text-[10px]">Answered</Badge>}
                    {ticket.status === 'closed' && <Badge className="bg-slate-100 text-slate-700 text-[10px]">Closed</Badge>}
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1 truncate">{ticket.subject}</h4>
                  <p className="text-xs text-slate-500 truncate mb-3">{ticket.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {ticket.user_name}</span>
                    <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Ticket Details & Reply */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <Card className="h-full border-slate-200 shadow-sm flex flex-col">
              <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50 rounded-t-xl">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-slate-900">{selectedTicket.subject}</h2>
                    {selectedTicket.status === 'open' && <Badge className="bg-amber-100 text-amber-700">Open</Badge>}
                    {selectedTicket.status === 'answered' && <Badge className="bg-blue-100 text-blue-700">Answered</Badge>}
                    {selectedTicket.status === 'closed' && <Badge className="bg-slate-100 text-slate-700">Closed</Badge>}
                  </div>
                  <p className="text-sm font-mono text-slate-500">{selectedTicket.ticket_number} • Created {new Date(selectedTicket.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                {/* User Message */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <span className="text-indigo-700 font-bold text-xs">{selectedTicket.user_name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{selectedTicket.user_name}</span>
                      <span className="text-xs text-slate-500">&lt;{selectedTicket.user_email}&gt;</span>
                    </div>
                    <div className="bg-white border border-slate-200 p-4 rounded-xl rounded-tl-none shadow-sm text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {selectedTicket.description}
                    </div>
                  </div>
                </div>

                {/* Admin Reply History */}
                {selectedTicket.admin_reply && (
                  <div className="flex gap-4 flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                      <LifeBuoy className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 space-y-1 flex flex-col items-end">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">Support Admin</span>
                        <span className="text-xs text-slate-500">(Previous Reply)</span>
                      </div>
                      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl rounded-tr-none shadow-sm text-sm text-blue-900 whitespace-pre-wrap leading-relaxed text-right">
                        {selectedTicket.admin_reply}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Reply Form */}
              <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-xl">
                <form onSubmit={handleReply} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                      <Reply className="w-3.5 h-3.5" /> Your Reply
                    </label>
                    <textarea
                      required
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      rows={4}
                      className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none shadow-sm"
                      placeholder="Type your response here..."
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-semibold text-slate-600">Set Status:</label>
                      <select 
                        value={replyStatus} 
                        onChange={e => setReplyStatus(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none"
                      >
                        <option value="open">Open</option>
                        <option value="answered">Answered</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                    <Button type="submit" isLoading={isReplying} className="px-6">
                      Send Reply
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          ) : (
            <div className="h-full min-h-[400px] border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center p-8 bg-slate-50/50">
              <MessageSquare className="w-12 h-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-700">No Ticket Selected</h3>
              <p className="text-sm text-slate-500 max-w-sm mt-2">Select a ticket from the list on the left to view details and send a reply.</p>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
