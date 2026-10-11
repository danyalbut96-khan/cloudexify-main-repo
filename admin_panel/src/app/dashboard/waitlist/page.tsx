'use client';

import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Card } from '@/components/ui/Card';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/utils';
import { Search, Mail, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WaitlistPage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchWaitlist = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/waitlist');
      if (!res.ok) throw new Error('Failed to load waitlist');
      const data = await res.json();
      setSubscribers(data);
    } catch (err: any) {
      toast.error(err.message || 'Error fetching waitlist');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyEmails = () => {
    const emails = subscribers.map(s => s.email).join(', ');
    navigator.clipboard.writeText(emails);
    toast.success(`${subscribers.length} emails copied to clipboard!`);
  };

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const filteredSubscribers = subscribers.filter(s => 
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageWrapper title="Waitlist Subscribers">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-6 border-slate-100 shadow-sm flex items-center justify-between col-span-1">
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Total Subscribers</p>
            <h3 className="text-3xl font-bold text-slate-900">{subscribers.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
        </Card>
        
        <Card className="p-4 border-slate-100 shadow-sm md:col-span-2 flex flex-col justify-center gap-3">
          <div className="flex justify-end">
            <button
              onClick={handleCopyEmails}
              disabled={subscribers.length === 0}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Mail className="w-4 h-4" /> Copy All Emails
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4.5 w-4.5" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subscribers by email..."
              className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </Card>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={8} cols={2} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Email Address</th>
                  <th className="px-6 py-3.5">Subscribed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600 font-medium">
                {filteredSubscribers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="font-bold text-slate-900">{s.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {formatDate(s.created_at)}
                    </td>
                  </tr>
                ))}
                {filteredSubscribers.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-6 py-12 text-center text-slate-400">
                      No waitlist subscribers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
