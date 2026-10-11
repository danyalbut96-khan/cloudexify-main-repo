'use client';

import React, { useState } from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MessageSquare, Search, Send, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PortalSupportPage() {
  const [tab, setTab] = useState<'create' | 'track'>('create');
  
  // Create ticket state
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<any>(null);

  // Track ticket state
  const [searchTicketNo, setSearchTicketNo] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundTicket, setFoundTicket] = useState<any>(null);
  
  // Reply state
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const t = toast.loading('Submitting ticket...');
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_name: userName, user_email: userEmail, subject, description })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit ticket');
      
      setCreatedTicket(data.ticket);
      toast.success('Support ticket submitted successfully!', { id: t });
    } catch (err: any) {
      toast.error(err.message, { id: t });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTicketNo) return;
    
    setIsSearching(true);
    setFoundTicket(null);
    const t = toast.loading('Looking up ticket...');
    try {
      const res = await fetch(`/api/support?ticket_number=${encodeURIComponent(searchTicketNo)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ticket not found');
      
      setFoundTicket(data.ticket);
      toast.success('Ticket found!', { id: t });
    } catch (err: any) {
      toast.error(err.message, { id: t });
    } finally {
      setIsSearching(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundTicket || !replyText.trim()) return;

    setIsReplying(true);
    const t = toast.loading('Sending reply...');
    try {
      const res = await fetch('/api/support', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: foundTicket.id,
          reply_text: replyText,
          sender: 'user',
          status: 'open'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success('Reply sent successfully!', { id: t });
      setFoundTicket({ ...foundTicket, ...data.ticket });
      setReplyText('');
    } catch (err: any) {
      toast.error(err.message, { id: t });
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-white flex items-center justify-center gap-3">
            <MessageSquare className="w-8 h-8 text-blue-500" />
            Support Center
          </h1>
          <p className="text-slate-400 mt-2">Submit a request or track an existing ticket.</p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-slate-900/50 p-1.5 rounded-xl border border-slate-800 flex gap-1">
            <button
              onClick={() => { setTab('create'); setCreatedTicket(null); }}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'create' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Submit New Ticket
            </button>
            <button
              onClick={() => { setTab('track'); setFoundTicket(null); }}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'track' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Track Existing Ticket
            </button>
          </div>
        </div>

        {tab === 'create' && (
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 md:p-8">
            {createdTicket ? (
              <div className="text-center space-y-5 py-6">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <h2 className="text-xl font-bold text-white">Ticket Submitted Successfully!</h2>
                <div className="bg-slate-800/50 rounded-xl p-4 max-w-sm mx-auto border border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Your Ticket ID is:</p>
                  <p className="text-2xl font-mono font-black tracking-wider text-blue-400">{createdTicket.ticket_number}</p>
                </div>
                <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                  Please save this Ticket ID. You can use it to track the status of your request and read admin replies in the &quot;Track Existing Ticket&quot; tab.
                </p>
                <Button onClick={() => setCreatedTicket(null)} className="mt-4">Submit Another</Button>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Full Name</label>
                    <input type="text" required value={userName} onChange={e => setUserName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-colors" placeholder="e.g. Ali Khan" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Email Address</label>
                    <input type="email" required value={userEmail} onChange={e => setUserEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-colors" placeholder="ali@example.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Subject</label>
                  <input type="text" required value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-colors" placeholder="Brief summary of your issue" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Description</label>
                  <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={5} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-colors resize-none" placeholder="Explain your issue in detail..." />
                </div>
                <div className="pt-2">
                  <Button type="submit" isLoading={isSubmitting} className="w-full py-3.5 flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" /> Submit Ticket
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {tab === 'track' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 md:p-8">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text" 
                  value={searchTicketNo} 
                  onChange={e => setSearchTicketNo(e.target.value)} 
                  placeholder="Enter Ticket ID (e.g. CX-SUP-2026-ABCD)"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none font-mono"
                />
                <Button type="submit" isLoading={isSearching} className="px-8 whitespace-nowrap">
                  <Search className="w-4 h-4 mr-2" /> Lookup
                </Button>
              </form>
            </div>

            {foundTicket && (
              <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
                <div className="flex items-start justify-between border-b border-slate-800 pb-5">
                  <div>
                    <h3 className="text-xl font-bold text-white">{foundTicket.subject}</h3>
                    <p className="text-xs text-slate-400 mt-1 font-mono">{foundTicket.ticket_number} • Submitted on {new Date(foundTicket.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    foundTicket.status === 'open' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                    foundTicket.status === 'answered' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                    'bg-slate-700/50 text-slate-400 border border-slate-600'
                  }`}>
                    {foundTicket.status}
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Legacy User Message */}
                  {(!foundTicket.messages || foundTicket.messages.length === 0) && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Your Message</h4>
                      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-950 p-4 rounded-xl border border-slate-800/50">
                        {foundTicket.description}
                      </p>
                    </div>
                  )}

                  {/* Legacy Admin Reply */}
                  {(!foundTicket.messages || foundTicket.messages.length === 0) && (
                    foundTicket.admin_reply ? (
                      <div>
                        <h4 className="text-xs font-bold text-blue-400 uppercase mb-2 flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" /> Support Reply
                        </h4>
                        <p className="text-sm text-blue-100 leading-relaxed whitespace-pre-wrap bg-blue-900/20 p-4 rounded-xl border border-blue-500/20">
                          {foundTicket.admin_reply}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-amber-400/90 text-sm">
                        <Clock className="w-5 h-5 shrink-0" />
                        <p>Our support team is reviewing your ticket and will reply soon. Check back later!</p>
                      </div>
                    )
                  )}

                  {/* New Chat History */}
                  {foundTicket.messages && foundTicket.messages.length === 0 && (
                     <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-amber-400/90 text-sm">
                        <Clock className="w-5 h-5 shrink-0" />
                        <p>Our support team is reviewing your ticket and will reply soon. Check back later!</p>
                     </div>
                  )}

                  {foundTicket.messages && foundTicket.messages.map((msg: any, idx: number) => {
                    if (msg.sender === 'user') {
                      return (
                        <div key={idx}>
                          <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center justify-between">
                            <span>Your Message</span>
                            <span className="text-[10px] text-slate-600 font-normal">{new Date(msg.timestamp).toLocaleString()}</span>
                          </h4>
                          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-950 p-4 rounded-xl border border-slate-800/50">
                            {msg.text}
                          </p>
                        </div>
                      );
                    } else {
                      return (
                        <div key={idx}>
                          <h4 className="text-xs font-bold text-blue-400 uppercase mb-2 flex items-center justify-between">
                            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Support Reply</span>
                            <span className="text-[10px] text-blue-500/50 font-normal">{new Date(msg.timestamp).toLocaleString()}</span>
                          </h4>
                          <p className="text-sm text-blue-100 leading-relaxed whitespace-pre-wrap bg-blue-900/20 p-4 rounded-xl border border-blue-500/20">
                            {msg.text}
                          </p>
                        </div>
                      );
                    }
                  })}
                </div>

                {/* Reply Form */}
                {foundTicket.status !== 'closed' ? (
                  <div className="pt-6 border-t border-slate-800">
                    <form onSubmit={handleReply} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Add a Reply</label>
                        <textarea
                          required
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          rows={3}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-colors resize-none"
                          placeholder="Type your reply here..."
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" isLoading={isReplying} className="px-6">
                          Send Reply
                        </Button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="pt-6 border-t border-slate-800 text-center">
                    <p className="text-sm text-slate-500">This ticket has been closed. If you have a new issue, please submit a new ticket.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
