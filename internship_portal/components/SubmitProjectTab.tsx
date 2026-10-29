'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Send, GitBranch, Loader2, FileText, CheckCircle2, Clock, Star } from 'lucide-react';
import SubmittedProjectsList from './SubmittedProjectsList';
import toast from 'react-hot-toast';

export default function SubmitProjectTab({ intern, submittedCount, maxProjectsCount, onProjectSubmitted, projects = [] }: { intern: any, submittedCount: number, maxProjectsCount: number, onProjectSubmitted: () => void, projects?: any[] }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [maxReached, setMaxReached] = useState(submittedCount >= maxProjectsCount);
  
  // Review Prompt States
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  // Extract domain code for display
  const regNo = (intern.registration_number || '').toUpperCase();
  const normalizedReg = regNo.replace(/[^A-Z0-9]/g, '');
  const domainCodeMatch = normalizedReg.match(/[A-Z]{2}\d{4}([A-Z]+)\d+/);
  const domainCode = domainCodeMatch ? domainCodeMatch[1] : '';

  const [formData, setFormData] = useState({
    project_number: (submittedCount + 1).toString(),
    project_title: '',
    repo_url: '',
    description: ''
  });

  // Update maxReached state if submittedCount prop changes
  useEffect(() => {
    setMaxReached(submittedCount >= maxProjectsCount);
    setFormData(prev => ({ ...prev, project_number: (submittedCount + 1).toString() }));
  }, [submittedCount, maxProjectsCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.project_title || !formData.repo_url || !formData.project_number) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Submitting project...');

    try {
      const res = await fetch('/api/submit-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to submit project');

      toast.success('Project submitted successfully!', { id: toastId });
      
      setFormData(prev => ({
        ...prev,
        project_title: '',
        repo_url: '',
        description: ''
      }));
      
      // Notify parent to refresh dashboard counts
      onProjectSubmitted();
      
      // Trigger review prompt after short delay if not already shown/skipped
      setTimeout(() => {
        const hasSeenReviewPrompt = localStorage.getItem(`review_prompt_${intern.id}`);
        if (!hasSeenReviewPrompt) {
          setShowReviewPrompt(true);
        }
      }, 1000);
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewText) {
      toast.error('Please write a short review.');
      return;
    }
    
    setIsSubmittingReview(true);
    const toastId = toast.loading('Submitting your review...');
    
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          internId: intern.id,
          rating: reviewRating,
          reviewText: reviewText,
          batchName: intern.batches?.name || 'CloudExify Internship'
        })
      });
      
      if (!res.ok) throw new Error('Failed to submit review');
      
      toast.success('Thank you! Your review has been submitted.', { id: toastId });
      localStorage.setItem(`review_prompt_${intern.id}`, 'true');
      setShowReviewPrompt(false);
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-black text-slate-900 mb-2">Project Submission</h2>
        <p className="text-slate-500 text-sm">Submit your completed internship projects here.</p>
      </div>

      <Card className="p-8 shadow-sm border border-slate-200">
        {maxReached ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">All Projects Submitted</h3>
            <p className="text-slate-500 text-sm">
              You have successfully submitted all {maxProjectsCount} required projects for your internship. Great job!
            </p>
          </div>
        ) : (
          <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Submit Project</h3>
                    <p className="text-xs font-semibold text-slate-500">Please fill all fields accurately.</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Registration Number - Read Only */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Registration Number</label>
                    <input 
                      readOnly 
                      value={intern.registration_number || ''}
                      className="w-full bg-slate-100 text-slate-600 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none cursor-not-allowed"
                    />
                  </div>

                  {/* Intern Name - Read Only */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Intern Name</label>
                    <input 
                      readOnly 
                      value={intern.full_name || ''}
                      className="w-full bg-slate-100 text-slate-600 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none cursor-not-allowed"
                    />
                  </div>

                  {/* Domain Code - Read Only */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Domain Code</label>
                    <input 
                      readOnly 
                      value={domainCode}
                      className="w-full bg-slate-100 text-slate-600 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none cursor-not-allowed"
                    />
                  </div>

                  {/* Project Number - Select */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Project Number *</label>
                    <select 
                      required
                      value={formData.project_number}
                      onChange={(e) => setFormData({...formData, project_number: e.target.value})}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm bg-white text-slate-900"
                    >
                      <option value="" disabled>Select Project Number</option>
                      {[...Array(maxProjectsCount)].map((_, i) => (
                        <option key={i+1} value={(i+1).toString()}>Project {i+1}</option>
                      ))}
                    </select>
                  </div>

                  {/* Project Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Project Title *</label>
                    <input 
                      required 
                      placeholder="e.g. Finance Tracker App"
                      value={formData.project_title}
                      onChange={(e) => setFormData({...formData, project_title: e.target.value})}
                      className="w-full bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                    />
                  </div>

                  {/* Repo URL */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">GitHub Repository URL *</label>
                    <div className="relative">
                      <GitBranch className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                      <input 
                        required 
                        type="url"
                        placeholder="https://github.com/username/repo"
                        value={formData.repo_url}
                        onChange={(e) => setFormData({...formData, repo_url: e.target.value})}
                        className="w-full bg-white text-slate-900 placeholder:text-slate-400 pl-10 border border-slate-200 rounded-xl pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm font-mono"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Project Description (Optional)</label>
                    <textarea 
                      placeholder="Briefly describe your project..."
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm resize-none"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-base shadow-sm mt-4 ${isSubmitting ? 'opacity-80 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-5 h-5 animate-spin mr-2 inline" /> Submitting...</>
                    ) : (
                      <><Send className="w-5 h-5 mr-2 inline" /> Submit Project</>
                    )}
                  </Button>
                </form>
          </>
        )}
        
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-slate-500 font-medium text-sm">
            You have submitted <span className="font-bold text-blue-600">{submittedCount}</span> out of <span className="font-bold text-slate-900">{maxProjectsCount}</span> required projects.
          </p>
        </div>
      </Card>

      {/* Submitted Projects History & Status */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            Your Submitted Projects & Feedback
          </h3>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {projects.length} / {maxProjectsCount} Submitted
          </span>
        </div>
        <SubmittedProjectsList projects={projects} maxProjectsCount={maxProjectsCount} />
      </div>

      {/* Review Prompt Modal */}
      {showReviewPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Share Your Experience! 🎉</h3>
            <p className="text-sm text-slate-600 mb-6">Your feedback is highly valued and required to improve our program. Please take a moment to write a short review about your internship experience so far.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Rate your experience</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setReviewRating(star)} className="focus:outline-none">
                      <Star className={`w-8 h-8 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Your Kind Review</label>
                <textarea 
                  rows={4}
                  placeholder="The projects were great and..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              <div className="flex flex-col gap-2 mt-6">
                <Button onClick={handleReviewSubmit} disabled={isSubmittingReview} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 font-bold">
                  {isSubmittingReview ? 'Submitting...' : 'Submit Review (Important)'}
                </Button>
                <button onClick={() => {
                  localStorage.setItem(`review_prompt_${intern.id}`, 'true');
                  setShowReviewPrompt(false);
                }} className="text-sm text-slate-500 hover:text-slate-700 font-medium py-2">
                  Skip for now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
