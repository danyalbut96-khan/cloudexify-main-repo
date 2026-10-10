'use client';

import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/utils';
import { Search, Star, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/testimonials');
      if (!res.ok) throw new Error('Failed to load testimonials');
      const data = await res.json();
      setTestimonials(data);
    } catch (err: any) {
      toast.error(err.message || 'Error fetching testimonials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdating(id);
    const updateToast = toast.loading(`Marking as ${newStatus}...`);
    try {
      const res = await fetch('/api/testimonials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });

      if (!res.ok) throw new Error('Failed to update status');

      toast.success(`Testimonial ${newStatus}!`, { id: updateToast });
      fetchTestimonials();
    } catch (err: any) {
      toast.error(err.message, { id: updateToast });
    } finally {
      setUpdating(null);
    }
  };

  const filteredTestimonials = testimonials.filter(t => 
    t.interns?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.batch_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageWrapper title="Testimonials & Reviews">
      <Card className="mb-6 border-slate-100 shadow-sm p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4.5 w-4.5" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or batch..."
            className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </Card>

      <div className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={8} cols={6} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Author</th>
                  <th className="px-6 py-3.5">Rating</th>
                  <th className="px-6 py-3.5 w-1/2">Review</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
                {filteredTestimonials.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      {t.status === 'approved' ? (
                        <Badge variant="success">Approved</Badge>
                      ) : t.status === 'rejected' ? (
                        <Badge variant="danger">Rejected</Badge>
                      ) : (
                        <Badge variant="warning">Pending</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{t.interns?.full_name || 'Unknown Intern'}</p>
                      <p className="text-[10px] text-slate-500">{t.batch_name || 'No Batch'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{t.review_text}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {formatDate(t.created_at)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {t.status !== 'approved' && (
                          <button
                            onClick={() => handleStatusChange(t.id, 'approved')}
                            disabled={updating === t.id}
                            className="text-green-600 hover:bg-green-50 p-1.5 rounded-lg transition-colors disabled:opacity-50"
                            title="Approve"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        {t.status !== 'rejected' && (
                          <button
                            onClick={() => handleStatusChange(t.id, 'rejected')}
                            disabled={updating === t.id}
                            className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTestimonials.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      No testimonials submitted yet.
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
