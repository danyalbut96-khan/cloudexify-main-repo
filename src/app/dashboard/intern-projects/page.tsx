'use client';

import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';
import { Search, ExternalLink, CheckCircle, XCircle, Clock, Eye, MessageSquare, BrainCircuit } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function InternProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [marks, setMarks] = useState<number | ''>('');
  const [feedback, setFeedback] = useState('');
  const [analysisStatus, setAnalysisStatus] = useState('');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/intern-projects');
      if (!res.ok) throw new Error('Failed to load projects');
      const data = await res.json();
      setProjects(data);
    } catch (err: any) {
      toast.error(err.message || 'Error fetching projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openReviewModal = (project: any) => {
    setSelectedProject(project);
    setMarks(project.marks ?? '');
    setFeedback(project.feedback || '');
    setAnalysisStatus(project.analysis_status || 'pending');
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    setIsSubmitting(true);
    const saveToast = toast.loading('Saving review...');
    try {
      const res = await fetch('/api/intern-projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedProject.id,
          analysis_status: analysisStatus,
          marks: marks === '' ? null : Number(marks),
          feedback
        })
      });

      if (!res.ok) throw new Error('Failed to save review');

      toast.success('Review saved successfully!', { id: saveToast });
      setSelectedProject(null);
      fetchProjects();
    } catch (err: any) {
      toast.error(err.message, { id: saveToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnalyzeWithAI = async (projectId: string) => {
    const aiToast = toast.loading('Sending project to AI...');
    try {
      const res = await fetch('/api/analysis/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId })
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Analysis failed', { id: aiToast });
      } else {
        toast.success('Analysis initiated successfully!', { id: aiToast });
        router.push('/dashboard/intern-analysis');
      }
    } catch {
      toast.error('Network error during analysis', { id: aiToast });
    }
  };

  const filteredProjects = projects.filter(p => 
    p.intern_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.registration_number?.toLowerCase().includes(search.toLowerCase()) ||
    p.project_title?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge variant="success">Approved</Badge>;
      case 'rejected': return <Badge variant="danger">Rejected</Badge>;
      case 'done': return <Badge variant="success">AI Done</Badge>;
      case 'failed': return <Badge variant="danger">AI Failed</Badge>;
      case 'analyzing': return <Badge variant="blue">Analyzing</Badge>;
      default: return <Badge variant="warning">Pending</Badge>;
    }
  };

  return (
    <PageWrapper title="Intern Project Submissions">
      <Card className="mb-6 border-slate-100 shadow-sm p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4.5 w-4.5" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by intern name, reg number, or project title..."
            className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </Card>

      <div className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={8} cols={7} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Intern</th>
                  <th className="px-6 py-3.5">Domain</th>
                  <th className="px-6 py-3.5">Project</th>
                  <th className="px-6 py-3.5">Repo URL</th>
                  <th className="px-6 py-3.5">Marks</th>
                  <th className="px-6 py-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
                {filteredProjects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">{getStatusBadge(proj.analysis_status)}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{proj.intern_name}</p>
                      <p className="text-[10px] text-slate-500">{proj.registration_number}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold text-[10px]">
                        {proj.domain_code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900 truncate max-w-[150px]">
                        #{proj.project_number}: {proj.project_title}
                      </p>
                      <p className="text-[10px] text-slate-500">{formatDate(proj.submitted_at)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <a href={proj.repo_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center">
                        <ExternalLink className="w-3.5 h-3.5 mr-1" /> View Repo
                      </a>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {proj.marks !== null ? `${proj.marks} / 10` : '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openReviewModal(proj)}
                          className="text-blue-600 hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4 mr-1.5" /> Review
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAnalyzeWithAI(proj.id)}
                          className="text-purple-600 hover:bg-purple-50"
                          disabled={proj.analysis_status === 'done' || proj.analysis_status === 'analyzing'}
                        >
                          <BrainCircuit className="w-4 h-4 mr-1.5" /> 
                          {proj.analysis_status === 'done' ? 'Analyzed' : (proj.analysis_status === 'analyzing' ? 'Analyzing...' : 'Analyze')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProjects.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      No project submissions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedProject && (
        <Modal
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          title={`Review Submission`}
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
              <p className="text-xs text-slate-500 font-bold uppercase mb-1">Intern Details</p>
              <p className="font-semibold text-slate-900">{selectedProject.intern_name} ({selectedProject.registration_number})</p>
              <p className="text-xs text-slate-600 mt-1">Domain: {selectedProject.domain_code}</p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p className="text-xs text-blue-500 font-bold uppercase mb-1">Project Details</p>
              <p className="font-bold text-blue-900">#{selectedProject.project_number}: {selectedProject.project_title}</p>
              {selectedProject.description && (
                <p className="text-xs text-blue-800 mt-2 bg-white/50 p-2 rounded">
                  {selectedProject.description}
                </p>
              )}
              <a href={selectedProject.repo_url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-600 hover:underline mt-2 inline-flex items-center">
                <ExternalLink className="w-3.5 h-3.5 mr-1" /> Open Repository
              </a>
            </div>

            {selectedProject.ai_score !== null && (
              <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                <p className="text-xs text-purple-500 font-bold uppercase mb-1">AI Analysis Score</p>
                <p className="font-black text-purple-900 text-lg">{selectedProject.ai_score} <span className="text-xs font-normal text-purple-600">/ 25</span></p>
              </div>
            )}

            <form onSubmit={handleSaveReview} className="space-y-4 pt-4 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Marks (out of 10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={marks}
                    onChange={(e) => setMarks(e.target.value ? Number(e.target.value) : '')}
                    className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. 8.5"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Status</label>
                  <select
                    value={analysisStatus}
                    onChange={(e) => setAnalysisStatus(e.target.value)}
                    className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center">
                  <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  Written Feedback (Optional)
                </label>
                <textarea
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Leave constructive feedback for the intern..."
                  className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setSelectedProject(null)} type="button">Cancel</Button>
                <Button type="submit" variant="primary" isLoading={isSubmitting}>Save Review</Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </PageWrapper>
  );
}
