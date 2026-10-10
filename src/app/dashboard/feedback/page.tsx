'use client';

import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/utils';
import { Search, Star, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

import { createClient } from '@/lib/supabase/client';

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch('/api/feedback');
      if (!res.ok) throw new Error('Failed to load feedback');
      const data = await res.json();
      setFeedbacks(data);
    } catch (err: any) {
      toast.error(err.message || 'Error fetching feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
    
    const supabase = createClient();
    const channel = supabase
      .channel('feedback_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'intern_feedbacks' },
        () => {
          fetchFeedbacks(); // Refresh data on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredFeedbacks = feedbacks.filter(f => 
    f.interns?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    f.interns?.registration_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageWrapper title="Internship Feedback">
      <Card className="mb-6 border-slate-100 shadow-sm p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4.5 w-4.5" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by intern name or reg number..."
            className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </Card>

      <div className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={8} cols={5} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Intern</th>
                  <th className="px-6 py-3.5 w-1/2">Feedback</th>
                  <th className="px-6 py-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
                {filteredFeedbacks.map((fb) => (
                  <tr key={fb.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{fb.interns?.full_name || 'Unknown'}</p>
                      <p className="text-[10px] text-slate-500">{fb.interns?.registration_number || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{fb.feedback_text}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {formatDate(fb.created_at)}
                    </td>
                  </tr>
                ))}
                {filteredFeedbacks.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-400">
                      No feedback submitted yet.
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
