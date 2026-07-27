'use client';

import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, Link as LinkIcon, BookOpen, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [batchId, setBatchId] = useState('');
  const [domain, setDomain] = useState('');
  const [durationLabel, setDurationLabel] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const domainOptions = [
    'Python Programming',
    'C++ Programming',
    'Java Programming',
    'Data Science & AI Basics',
    'Cybersecurity Fundamentals',
    'Full Stack Development'
  ];

  const fetchInitialData = async () => {
    try {
      const [tasksRes, batchesRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/batches')
      ]);
      const tasksData = await tasksRes.json();
      const batchesData = await batchesRes.json();
      
      setTasks(tasksData.tasks || []);
      setBatches(batchesData || []);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchId || !domain || !title || !durationLabel) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalFileUrl = fileUrl;
      if (file) {
        const supabase = createClient();
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('tasks')
          .upload(fileName, file);
          
        if (uploadError) throw new Error('Failed to upload file');
        
        const { data: { publicUrl } } = supabase.storage
          .from('tasks')
          .getPublicUrl(fileName);
          
        finalFileUrl = publicUrl;
      }

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch_id: batchId, domain, duration_label: durationLabel, title, description, file_url: finalFileUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success('Task created successfully!');
      setTitle('');
      setDescription('');
      setDurationLabel('');
      setFileUrl('');
      setFile(null);
      fetchInitialData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Task deleted');
      fetchInitialData();
    } catch (err) {
      toast.error('Deletion failed');
    }
  };

  return (
    <PageWrapper title="Tasks & Projects Management">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Task Creation Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" /> Upload New Task
            </h3>
            
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Batch</label>
                <select 
                  value={batchId} 
                  onChange={(e) => setBatchId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-700"
                >
                  <option value="">Select a batch</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.status})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Domain Track</label>
                <select 
                  value={domain} 
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-700"
                >
                  <option value="">Select Domain</option>
                  {domainOptions.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Task Duration / Label</label>
                <input 
                  type="text" 
                  value={durationLabel} 
                  onChange={(e) => setDurationLabel(e.target.value)}
                  placeholder="e.g. Month 1, Week 2, Final Project"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Task Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Build a To-Do App"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description (Optional)</label>
                <textarea 
                  rows={4}
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Task instructions..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Upload Document (Optional)</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="file" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>

              <div className="text-center">
                <span className="text-xs font-bold text-slate-400">OR</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">External Resource Link (Optional)</label>
                <input 
                  type="url" 
                  value={fileUrl} 
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://..."
                  disabled={!!file}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-slate-700 disabled:opacity-50"
                />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" isLoading={isSubmitting}>
                Publish Task to Portal
              </Button>
            </form>
          </div>
        </div>

        {/* Uploaded Tasks List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" /> Active Tasks
          </h3>
          
          {loading ? (
            <div className="text-sm text-slate-500">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-500">
              No tasks have been uploaded yet.
            </div>
          ) : (
            tasks.map(task => (
              <div key={task.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow relative">
                <button 
                  onClick={() => handleDeleteTask(task.id)}
                  className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded uppercase">{task.duration_label}</span>
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded uppercase">{task.domain}</span>
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded uppercase">{task.batches?.name}</span>
                </div>
                
                <h4 className="text-base font-bold text-slate-900 mb-1">{task.title}</h4>
                {task.description && (
                  <p className="text-sm text-slate-600 whitespace-pre-wrap mb-3">{task.description}</p>
                )}
                
                {task.file_url && (
                  <a href={task.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline">
                    <LinkIcon className="w-4 h-4" /> View Resource File
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
