'use client';

import React, { useEffect, useState } from 'react';
import { Plus, FolderKanban, Calendar, TrendingUp, DollarSign, Building } from 'lucide-react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatPKR, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [status, setStatus] = useState<'inquiry' | 'in_progress' | 'completed'>('inquiry');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [valuePkr, setValuePkr] = useState<number>(0);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to load projects');
      const data = await res.json();
      setProjects(data);
    } catch (err: any) {
      toast.error(err.message || 'Error loading projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleUpdateStatus = async (id: string, currentProj: any, newStatus: string) => {
    const statusToast = toast.loading(`Updating status to ${newStatus}...`);
    try {
      const res = await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentProj,
          id,
          status: newStatus
        })
      });

      if (!res.ok) throw new Error('Status update failed');
      toast.success('Project status updated!', { id: statusToast });
      fetchProjects();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status', { id: statusToast });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName || !clientName) {
      toast.error('Project Name and Client Name are required.');
      return;
    }

    setIsSubmitting(true);
    const saveToast = toast.loading('Saving project...');

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_name: projectName,
          client_name: clientName,
          status,
          start_date: startDate || null,
          end_date: endDate || null,
          value_pkr: valuePkr
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save project');

      toast.success('Project successfully logged!', { id: saveToast });
      
      // Reset
      setProjectName('');
      setClientName('');
      setStatus('inquiry');
      setStartDate('');
      setEndDate('');
      setValuePkr(0);
      setIsOpen(false);

      fetchProjects();
    } catch (err: any) {
      toast.error(err.message || 'Error saving project', { id: saveToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper
      title="Projects Tracking"
      actions={
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-1.5 shadow-md shadow-blue-200"
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </Button>
      }
    >
      {/* Grid displaying status columns */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={5} cols={7} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Project Name</th>
                  <th className="px-6 py-3.5">Client Name</th>
                  <th className="px-6 py-3.5">Value (PKR)</th>
                  <th className="px-6 py-3.5">Start Date</th>
                  <th className="px-6 py-3.5">End Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-center">Change Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
                {projects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 truncate max-w-[180px]">{proj.project_name}</td>
                    <td className="px-6 py-4 font-semibold text-slate-950 truncate max-w-[130px]">{proj.client_name}</td>
                    <td className="px-6 py-4 font-bold text-slate-950">{formatPKR(proj.value_pkr)}</td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(proj.start_date)}</td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(proj.end_date)}</td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          proj.status === 'completed'
                            ? 'success'
                            : proj.status === 'in_progress'
                            ? 'blue'
                            : 'neutral'
                        }
                      >
                        {proj.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <select
                        value={proj.status}
                        onChange={(e) => handleUpdateStatus(proj.id, proj, e.target.value)}
                        className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg text-slate-600 focus:outline-none bg-white font-semibold shadow-sm cursor-pointer"
                      >
                        <option value="inquiry">Inquiry</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))}

                {projects.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      No projects currently logged.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Project Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add New Project Record"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-slate-700">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Project Name</label>
            <input
              type="text"
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. Corporate Finance Portal"
              className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Client Name</label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Habib Bank Ltd"
              className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Value (PKR)</label>
              <input
                type="number"
                min={0}
                value={valuePkr || ''}
                onChange={(e) => setValuePkr(parseFloat(e.target.value) || 0)}
                placeholder="Value in PKR"
                className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-600 focus:outline-none bg-white"
              >
                <option value="inquiry">Inquiry</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

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
              Log Project
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
