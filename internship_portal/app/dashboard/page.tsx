'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Cloud, FileText, Download, CheckCircle2, Clock, XCircle, LogOut, Briefcase, LayoutDashboard, UserCircle, Menu, Star, MessageCircle, Send } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Skeleton } from '@/components/ui/Skeleton'
import Link from 'next/link'
import SubmitProjectTab from '@/components/SubmitProjectTab'
import SubmittedProjectsList from '@/components/SubmittedProjectsList'
import PipelineStatusTracker from '@/components/pipeline/PipelineStatusTracker'
import CandidatePaymentSection from '@/components/pipeline/CandidatePaymentSection'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

export default function StudentDashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [appealNote, setAppealNote] = useState('')
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editProfileForm, setEditProfileForm] = useState({ full_name: '', email: '', whatsapp: '', university: '', semester: '', profile_picture_url: '' })
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: '' })
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [feedbackForm, setFeedbackForm] = useState({ text: '' })
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [isUploadingPic, setIsUploadingPic] = useState(false)

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard', { cache: 'no-store' })
      if (res.status === 401) {
        router.push('/login')
        return
      }
      
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      
      setData(json)
      if (json.intern) {
        setEditProfileForm({
          full_name: json.intern.full_name || '',
          email: json.intern.email || '',
          whatsapp: json.intern.whatsapp || '',
          university: json.intern.university || '',
          semester: json.intern.semester || '',
          profile_picture_url: json.intern.profile_picture_url || ''
        })
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(() => {
      fetchDashboardData()
    }, 8000)
    const onFocus = () => fetchDashboardData()
    window.addEventListener('focus', onFocus)
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [fetchDashboardData])

  // Realtime subscription: auto-refresh when candidate stage or status changes
  useEffect(() => {
    if (!data?.intern?.id) return
    const supabase = createClient()
    const channel = supabase
      .channel(`intern_pipeline_${data.intern.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'interns',
          filter: `id=eq.${data.intern.id}`
        },
        () => {
          fetchDashboardData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [data?.intern?.id, fetchDashboardData])

  const handleLogout = async () => {
    document.cookie = "intern_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    toast.success('Logged out successfully')
    router.push('/')
  }

  const handleAppealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealNote.trim() || appealNote.trim().length < 10) {
      toast.error('Please provide a detailed justification for your review request (at least 10 characters).');
      return;
    }
    setIsSubmittingAppeal(true);
    const toastId = toast.loading('Submitting review appeal...');
    try {
      const res = await fetch('/api/appeal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appeal_note: appealNote.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review request');
      toast.success(data.message || 'Appeal submitted successfully!', { id: toastId });
      setAppealNote('');
      fetchDashboardData();
    } catch (err: any) {
      toast.error(err.message || 'Error submitting appeal', { id: toastId });
    } finally {
      setIsSubmittingAppeal(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingProfile(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProfileForm)
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      
      toast.success(json.message)
      setIsEditingProfile(false)
      fetchDashboardData()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsUploadingPic(true)
    const toastId = toast.loading('Uploading profile picture...')
    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${data.intern.id}-${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(fileName, file, { upsert: true })
        
      if (uploadError) {
        if (uploadError.message.includes('Bucket not found')) {
          throw new Error('Please ask admin to create a public storage bucket named "profiles" in Supabase.')
        }
        throw new Error(uploadError.message)
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(fileName)
        
      setEditProfileForm(prev => ({ ...prev, profile_picture_url: publicUrl }))
      toast.success('Picture uploaded! Click Save Changes to apply.', { id: toastId })
    } catch (err: any) {
      toast.error('Upload failed: ' + err.message, { id: toastId })
    } finally {
      setIsUploadingPic(false)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingReview(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          internId: data.intern.id,
          rating: reviewForm.rating,
          reviewText: reviewForm.text,
          batchName: data.intern.batches?.name || 'CloudExify Internship'
        })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success('Review submitted successfully! It will be visible on the main page after approval.')
      setReviewForm({ rating: 5, text: '' })
      fetchDashboardData() // Refresh to get updated has_reviewed state
      setActiveTab('dashboard')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingFeedback(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback_text: feedbackForm.text,
        })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success(json.message)
      setFeedbackForm({ text: '' })
      setActiveTab('dashboard')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (!data) return null

  const { intern, documents, tasks } = data
  const isApprovedCandidate = intern?.status === 'Accepted' || intern?.pipeline_stage === 'approved'

    const renderStatusScreen = () => {
    const currentStage = String(intern.pipeline_stage || '').toLowerCase();
    const internStatus = String(intern.status || '').toLowerCase();
    const isApprovedCandidate = intern.status === 'Accepted' || currentStage === 'approved';
    const isRejected = currentStage === 'rejected' || (internStatus === 'rejected' && !['shortlisted', 'payment_pending', 'interview_pending', 'under_review', 'approved'].includes(currentStage));

    // 1. REJECTION CHECK MUST COME FIRST
    if (isRejected) {
      const rejectionTime = intern.rejected_at ? new Date(intern.rejected_at).getTime() : new Date(intern.created_at).getTime();
      const hoursSinceRejection = (Date.now() - rejectionTime) / (1000 * 60 * 60);
      const isWithin48h = hoursSinceRejection <= 48;
      const hoursRemaining = Math.max(0, Math.ceil(48 - hoursSinceRejection));

      return (
        <div className="max-w-xl mx-auto mt-10 space-y-6">
          <Card className="p-8 text-center shadow-xl border-red-100 bg-white rounded-3xl">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Application Status Update</h2>
            <p className="text-slate-600 text-sm font-medium mb-4 leading-relaxed">
              Dear <strong>{intern.full_name}</strong>,
              <br/><br/>
              Thank you for applying to the <strong>{intern.domain}</strong> internship track at CloudExify. After careful evaluation of candidate assessments and batch seat quotas, we regret to inform you that we are unable to offer you admission for this cohort.
            </p>

            {intern.final_rejection_reason && (
              <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl text-xs text-rose-800 mb-5 text-left font-medium">
                <strong>Evaluation Feedback:</strong> {intern.final_rejection_reason}
              </div>
            )}

            {/* Appeal / 1-Time Review Request Section */}
            {intern.review_requested || intern.appeal_submitted_at ? (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-left space-y-2 mt-4">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wide">
                  <Clock className="w-4 h-4 text-blue-600" /> Review Request Under Committee Evaluation
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  You have submitted your 1-time admissions appeal. The committee is re-evaluating your dossier. You will receive an official notification via email once finalized.
                </p>
                {intern.appeal_note && (
                  <div className="text-[11px] bg-white p-2.5 rounded-lg border border-blue-100 text-slate-600 font-mono mt-2">
                    &ldquo;{intern.appeal_note}&rdquo;
                  </div>
                )}
              </div>
            ) : isWithin48h ? (
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-left space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-500" /> Request Admissions Review (1-Time Appeal)
                  </span>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                    {hoursRemaining}h window remaining
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  You are eligible to submit a 1-time reconsideration request within 48 hours of decision notice. Provide any additional portfolio context, test clarification, or justification:
                </p>
                <form onSubmit={handleAppealSubmit} className="space-y-3 pt-1">
                  <textarea
                    rows={3}
                    required
                    value={appealNote}
                    onChange={(e) => setAppealNote(e.target.value)}
                    placeholder="Enter your appeal justification and relevant links..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-900 placeholder:text-slate-400 bg-white"
                  />
                  <Button
                    type="submit"
                    disabled={isSubmittingAppeal}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition-all"
                  >
                    {isSubmittingAppeal ? 'Submitting Appeal...' : 'Submit Reconsideration Request (1-Time Only)'}
                  </Button>
                </form>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic mt-4">
                The 48-hour admissions reconsideration period has expired.
              </p>
            )}

            {data.upcoming_batch && (
              <div className="pt-4 border-t border-slate-100 mt-6">
                <Link
                  href={`/register?batch_id=${data.upcoming_batch.id}`}
                  className="inline-block w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md"
                >
                  Apply for Next Cohort ({data.upcoming_batch.name})
                </Link>
              </div>
            )}
          </Card>
        </div>
      );
    }

    // If Candidate is Shortlisted or Payment Pending, render payment verification UI
    if (currentStage === 'shortlisted' || currentStage === 'payment_pending') {
      return (
        <div className="max-w-4xl mx-auto space-y-6">
          <PipelineStatusTracker intern={intern} />
          <CandidatePaymentSection intern={intern} onSuccess={fetchDashboardData} />

          <Card className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
            <h3 className="font-bold text-slate-900 text-base mb-4">Candidate Application Profile</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold uppercase block mb-1">Track</span>
                <span className="font-extrabold text-slate-800 text-sm">{intern.domain}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold uppercase block mb-1">University</span>
                <span className="font-extrabold text-slate-800 text-sm">{intern.university || 'N/A'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold uppercase block mb-1">University Roll/Reg No</span>
                <span className="font-extrabold text-slate-800 text-sm font-mono">{intern.university_registration_number || 'N/A'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold uppercase block mb-1">Semester</span>
                <span className="font-extrabold text-slate-800 text-sm">Semester {intern.semester}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold uppercase block mb-1">Expertise Level</span>
                <span className="font-extrabold text-slate-800 text-sm">{intern.skill_level || 'Beginner'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold uppercase block mb-1">Batch</span>
                <span className="font-extrabold text-slate-800 text-sm">{intern.batches?.name || 'Current Batch'}</span>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    if (!isApprovedCandidate && intern.status !== 'Rejected' && currentStage !== 'rejected' && currentStage !== 'cancelled_non_payment') {
      return (
        <div className="max-w-4xl mx-auto space-y-6">
          <PipelineStatusTracker intern={intern} />

          <Card className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
            <h3 className="font-bold text-slate-900 text-base mb-4">Candidate Application Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold uppercase block mb-1">Track</span>
                <span className="font-extrabold text-slate-800 text-sm">{intern.domain}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold uppercase block mb-1">University</span>
                <span className="font-extrabold text-slate-800 text-sm">{intern.university || 'N/A'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold uppercase block mb-1">University Roll/Reg No</span>
                <span className="font-extrabold text-slate-800 text-sm font-mono">{intern.university_registration_number || 'N/A'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold uppercase block mb-1">Semester</span>
                <span className="font-extrabold text-slate-800 text-sm">Semester {intern.semester}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold uppercase block mb-1">Expertise Level</span>
                <span className="font-extrabold text-slate-800 text-sm">{intern.skill_level || 'Beginner'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold uppercase block mb-1">Batch</span>
                <span className="font-extrabold text-slate-800 text-sm">{intern.batches?.name || 'Current Batch'}</span>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    // TASK 6: FINAL STATES BARRIER (cancelled_non_payment)
    if (intern.status === 'cancelled_non_payment' || currentStage === 'cancelled_non_payment') {
      return (
        <Card className="max-w-lg mx-auto mt-20 p-8 text-center shadow-xl border-amber-200 bg-white rounded-3xl">
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Seat Released - Non Payment
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-3 mb-2">Admission Window Expired</h2>
          <p className="text-slate-600 text-sm font-medium mb-4 leading-relaxed">
            Dear <strong>{intern.full_name}</strong>,
            <br/><br/>
            Your reserved seat for the <strong>{intern.domain}</strong> track in <strong>{intern.batches?.name || 'Current Batch'}</strong> has been released because verification fee payment was not completed within the mandatory 72-hour deadline.
            <br/><br/>
            In accordance with CloudExify cohort rules, expired seats are automatically reassigned to waitlisted applicants. This is a final status for this specific batch.
          </p>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 mb-6 text-left">
            <strong>What are your options?</strong><br/>
            You are warmly welcome to register for our next upcoming cohort when applications open. Your previous assessment record does not prevent you from competing in future batches.
          </div>
          {data.upcoming_batch ? (
            <Link
              href={`/register?batch_id=${data.upcoming_batch.id}`}
              className="inline-block w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md"
            >
              Apply for Next Cohort ({data.upcoming_batch.name})
            </Link>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                You will be notified via email (<strong>{intern.email}</strong>) when the next cohort opens.
              </div>
              <button
                type="button"
                onClick={() => toast.success('Opt-in recorded! You are on the priority waitlist for the next cohort.')}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-all"
              >
                Opt-in to Next Cohort Notification Waitlist
              </button>
            </div>
          )}
        </Card>
      );
    }

    if (intern.status === 'Rejected') {
      return (
        <Card className="max-w-lg mx-auto mt-20 p-8 text-center shadow-xl border-red-100 bg-white">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Application Status Update</h2>
          <p className="text-slate-600 font-medium mb-4 leading-relaxed">
            Dear <strong>{intern.full_name}</strong>,
            <br/><br/>
            Thank you for applying to the <strong>{intern.domain}</strong> internship program at CloudExify. We sincerely appreciate the time and effort you invested in your application.
            <br/><br/>
            After careful review of your profile, we regret to inform you that we are unable to move forward with your application at this time. This was a difficult decision, as we received many highly qualified applications this cohort.
            <br/><br/>
            Please do not let this discourage you. We encourage you to continue developing your skills and hope you will re-apply for future opportunities with us. We wish you the absolute best in your professional journey!
          </p>
          {intern.final_rejection_reason && (
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-xs text-rose-800 mb-4 text-left font-medium">
              <strong>Evaluation Feedback:</strong> {intern.final_rejection_reason}
            </div>
          )}
          {data.upcoming_batch ? (
            <Link
              href={`/register?batch_id=${data.upcoming_batch.id}`}
              className="inline-block w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md mb-4"
            >
              Apply for Next Cohort ({data.upcoming_batch.name})
            </Link>
          ) : (
            <div className="space-y-3 mb-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                You will be notified via email (<strong>{intern.email}</strong>) when the next cohort opens.
              </div>
              <button
                type="button"
                onClick={() => toast.success('Opt-in recorded! You are on the priority waitlist for the next cohort.')}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-all"
              >
                Opt-in to Next Cohort Notification Waitlist
              </button>
            </div>
          )}
          <div className="text-xs text-slate-400 font-semibold border-t pt-4">
            CloudExify Talent Acquisition Team
          </div>
        </Card>
      )
    }

    // Accepted State
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <PipelineStatusTracker intern={intern} />

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="z-10 text-center md:text-left mb-6 md:mb-0">
            <Badge variant="blue" className="bg-white/20 text-white border-none mb-3 backdrop-blur-sm shadow-sm px-3 py-1 text-xs">
              {intern.batches?.name || 'Internship Program'}
            </Badge>
            <h1 className="text-3xl font-black tracking-tight mb-2">Welcome aboard, {intern.full_name}!</h1>
            <p className="text-blue-100 font-medium">Domain: {intern.domain} • Reg: {intern.registration_number}</p>
          </div>
          <div className="z-10 flex items-center bg-white/10 px-6 py-4 rounded-2xl backdrop-blur-sm border border-white/20">
            <CheckCircle2 className="w-8 h-8 text-green-400 mr-3" />
            <div>
              <p className="text-xs text-blue-100 font-bold uppercase tracking-wider">Status</p>
              <p className="text-lg font-black text-white">Accepted</p>
            </div>
          </div>
        </div>

        {/* Batch Status Alert */}
        {intern.batches && intern.batches.status === 'completed' && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl flex items-center">
            <Clock className="w-5 h-5 text-amber-500 mr-3" />
            <p className="text-sm font-medium text-amber-800">
              Your internship batch has concluded. You can still download your final certificates and documents below.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8">
          {/* Main Tasks Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
              Your Monthly Tasks
            </h2>
            
            {tasks && tasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {tasks.map((task: any, index: number) => {
                  const now = new Date();
                  const startDate = task.start_date ? new Date(task.start_date) : null;
                  const endDate = task.end_date ? new Date(task.end_date) : null;
                  const isBeforeStart = startDate && now < startDate;
                  const isAfterEnd = endDate && now > endDate;
                  const isOpen = !isBeforeStart && !isAfterEnd;

                  // Find if corresponding project was submitted
                  const matchingProj = (data.projects || []).find((p: any) => p.project_number === index + 1 || p.project_number === task.task_number);

                  return (
                    <Card key={task.id} className="p-6 border border-slate-200/90 hover:border-blue-300 hover:shadow-lg transition-all rounded-2xl bg-white flex flex-col justify-between relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600"></div>
                      
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                            {task.duration_label || ('Task #' + (index + 1))}
                          </span>

                          {matchingProj ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Submitted
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                              <Clock className="w-3.5 h-3.5" /> Pending Submission
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{task.title}</h3>
                        <p className="text-xs text-slate-600 mt-2 whitespace-pre-wrap leading-relaxed line-clamp-4">{task.description}</p>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-2.5">
                        {isBeforeStart && (
                          <div className="inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-500 text-xs font-bold py-2.5 px-3 rounded-xl shadow-sm cursor-not-allowed">
                            <Clock className="w-3.5 h-3.5" />
                            Opens on {startDate?.toLocaleDateString()}
                          </div>
                        )}
                        {isAfterEnd && (
                          <div className="inline-flex items-center justify-center gap-2 bg-rose-50 text-rose-600 text-xs font-bold py-2.5 px-3 rounded-xl shadow-sm cursor-not-allowed">
                            <XCircle className="w-3.5 h-3.5" />
                            Closed on {endDate?.toLocaleDateString()}
                          </div>
                        )}
                        {isOpen && task.file_url && (
                          <a
                            href={task.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow-sm border border-blue-100"
                          >
                            <Download className="w-3.5 h-3.5" />
                            View & Download Task Doc
                          </a>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-1">
                          <span>Timeline: {startDate ? startDate.toLocaleDateString() : 'N/A'} - {endDate ? endDate.toLocaleDateString() : 'Ongoing'}</span>
                          {matchingProj ? (
                            <span className="font-bold text-emerald-600">? Done</span>
                          ) : (
                            <button
                              onClick={() => setActiveTab('submit-project')}
                              className="font-bold text-blue-600 hover:underline"
                            >
                              Submit Now ?
                            </button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-8 text-center border-dashed border-2 border-slate-200 bg-slate-50 rounded-2xl">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700">No Tasks Assigned Yet</h3>
                <p className="text-sm text-slate-500 mt-1">Your mentor will assign tasks for your batch shortly.</p>
              </Card>
            )}
          </div>

          {/* Submitted Projects Review & AI Feedback Overview on Main Dashboard */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center">
                  <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-600" />
                  Your Project Submissions & Feedback
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track mentor evaluations, live marks, and AI review summaries.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('submit-project')}
                className="text-xs font-bold text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                Submit New Project
              </Button>
            </div>

            <SubmittedProjectsList
              projects={data.projects || []}
              maxProjectsCount={data.max_projects_count || 4}
            />
          </div>

        </div>
      </div>
    )
  }

  const renderProfileScreen = () => {
    return (
      <Card className="max-w-4xl mx-auto p-8 shadow-sm bg-white border border-slate-200/90 rounded-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              Candidate Dossier
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">My Profile</h2>
          </div>
          {!isEditingProfile && (
            <Button variant="outline" onClick={() => setIsEditingProfile(true)} className="text-xs">
              Edit Contact Info
            </Button>
          )}
        </div>
        
        {isEditingProfile ? (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Full Name</label>
                <input required value={editProfileForm.full_name} onChange={e => setEditProfileForm(p => ({...p, full_name: e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Email Address</label>
                <input required type="email" value={editProfileForm.email} onChange={e => setEditProfileForm(p => ({...p, email: e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">WhatsApp Number</label>
                <input required value={editProfileForm.whatsapp} onChange={e => setEditProfileForm(p => ({...p, whatsapp: e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">University Name</label>
                <input required value={editProfileForm.university} onChange={e => setEditProfileForm(p => ({...p, university: e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">University Roll / Reg No</label>
                <input value={intern.university_registration_number || ''} disabled className="w-full border rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-500 cursor-not-allowed font-mono" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Semester</label>
                <input required type="number" value={editProfileForm.semester} onChange={e => setEditProfileForm(p => ({...p, semester: e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Assigned Track (Domain)</label>
                <input disabled value={intern.domain} className="w-full border rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Skill Level</label>
                <input disabled value={intern.skill_level || 'Beginner'} className="w-full border rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-500 cursor-not-allowed" />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
              <Button type="button" variant="ghost" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
              <Button type="submit" disabled={isSavingProfile}>{isSavingProfile ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              <div className="p-4 bg-slate-50/70 border border-slate-200/70 rounded-xl">
                <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider mb-1">Full Name</span>
                <span className="font-extrabold text-slate-900 text-base">{intern.full_name}</span>
              </div>
              <div className="p-4 bg-blue-50/60 border border-blue-200/70 rounded-xl">
                <span className="text-blue-500 font-bold block text-[10px] uppercase tracking-wider mb-1">CloudExify Reg ID</span>
                <span className="font-black text-blue-700 font-mono text-sm">{intern.registration_number}</span>
              </div>
              <div className="p-4 bg-slate-50/70 border border-slate-200/70 rounded-xl">
                <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider mb-1">Email Address</span>
                <span className="font-bold text-slate-800 text-xs break-all">{intern.email}</span>
              </div>
              <div className="p-4 bg-slate-50/70 border border-slate-200/70 rounded-xl">
                <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider mb-1">WhatsApp Number</span>
                <span className="font-bold text-slate-800 text-xs">{intern.whatsapp || 'N/A'}</span>
              </div>
              <div className="p-4 bg-slate-50/70 border border-slate-200/70 rounded-xl">
                <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider mb-1">University</span>
                <span className="font-bold text-slate-800 text-xs">{intern.university || 'N/A'}</span>
              </div>
              <div className="p-4 bg-slate-50/70 border border-slate-200/70 rounded-xl">
                <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider mb-1">University Roll/Reg No</span>
                <span className="font-bold text-slate-800 font-mono text-xs">{intern.university_registration_number || 'N/A'}</span>
              </div>
              <div className="p-4 bg-slate-50/70 border border-slate-200/70 rounded-xl">
                <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider mb-1">Academic Semester</span>
                <span className="font-bold text-slate-800 text-xs">Semester {intern.semester || 'N/A'}</span>
              </div>
              <div className="p-4 bg-slate-50/70 border border-slate-200/70 rounded-xl">
                <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider mb-1">Internship Track</span>
                <span className="font-extrabold text-indigo-700 text-xs">{intern.domain}</span>
              </div>
              <div className="p-4 bg-slate-50/70 border border-slate-200/70 rounded-xl">
                <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider mb-1">Expertise / Skill Level</span>
                <span className="font-bold text-slate-800 text-xs">{intern.skill_level || 'Beginner'}</span>
              </div>
              <div className="p-4 bg-slate-50/70 border border-slate-200/70 rounded-xl">
                <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider mb-1">Assigned Cohort Batch</span>
                <span className="font-bold text-slate-800 text-xs">{intern.batches?.name || 'Active Batch'}</span>
              </div>
              <div className="p-4 bg-slate-50/70 border border-slate-200/70 rounded-xl">
                <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider mb-1">Admissions Pipeline Stage</span>
                <span className="font-bold text-emerald-700 text-xs capitalize">{intern.pipeline_stage || intern.status || 'Registered'}</span>
              </div>
              <div className="p-4 bg-slate-50/70 border border-slate-200/70 rounded-xl">
                <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider mb-1">Registration Date</span>
                <span className="font-bold text-slate-800 text-xs">{new Date(intern.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )}
      </Card>
    );
  };

  const renderDocumentsScreen = () => {
    // Individual document_lock_override takes precedence over batch lock
    const isDocsLocked = intern.document_lock_override !== null && intern.document_lock_override !== undefined
      ? Boolean(intern.document_lock_override)
      : Boolean(intern.batches?.documents_locked);

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900">My Official Documents</h2>
            <p className="text-xs text-slate-500 mt-1">
              Access your verified credential documents, internship offer letter, and completion certificates.
            </p>
          </div>
          {isDocsLocked && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs font-semibold">
              <span>?? Documents Locked by Administration</span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DocumentCard title="Offer Letter" url={documents?.offer_letter_url} locked={isDocsLocked} icon={<FileText className="w-6 h-6 text-blue-500" />} />
          <DocumentCard title="Internship Certificate" url={documents?.certificate_url} locked={isDocsLocked} icon={<CheckCircle2 className="w-6 h-6 text-emerald-500" />} requiresProjects={4} submittedProjects={data.submitted_projects_count || 0} />
          <DocumentCard title="Recommendation Letter" url={documents?.recommendation_letter_url} locked={isDocsLocked} icon={<UserCircle className="w-6 h-6 text-amber-500" />} requiresProjects={4} submittedProjects={data.submitted_projects_count || 0} />
        </div>
      </div>
    )
  }

  const renderReviewScreen = () => {
    if (data.has_reviewed) {
      return (
        <Card className="max-w-2xl mx-auto p-8 shadow-sm text-center border border-green-100 bg-green-50/30">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Review Submitted</h2>
          <p className="text-slate-600 font-medium">Thank you for sharing your experience! Your review has been recorded and will be featured upon approval.</p>
        </Card>
      )
    }

    return (
      <Card className="max-w-2xl mx-auto p-8 shadow-sm">
        <h2 className="text-2xl font-black text-slate-900 mb-2">Submit Your Review</h2>
        <p className="text-slate-500 text-sm mb-6">Share your experience during the {intern.batches?.name || 'CloudExify Internship'}. Your review may be featured on our landing page!</p>
        
        <form onSubmit={handleSubmitReview} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  type="button" 
                  key={star} 
                  onClick={() => setReviewForm(p => ({...p, rating: star}))}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star className={`w-8 h-8 ${star <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Your Review</label>
            <textarea 
              required 
              rows={5}
              placeholder="Write about your learning experience, projects, or anything else..."
              value={reviewForm.text} 
              onChange={e => setReviewForm(p => ({...p, text: e.target.value}))} 
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm bg-white text-slate-900 placeholder:text-slate-400" 
            />
          </div>
          <Button type="submit" disabled={isSubmittingReview} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-base">
            {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </Card>
    )
  }

  const renderFeedbackScreen = () => {
    return (
      <Card className="max-w-2xl mx-auto p-8 shadow-sm">
        <h2 className="text-2xl font-black text-slate-900 mb-2">Course Feedback</h2>
        <p className="text-slate-500 text-sm mb-6">Let us know what issues you faced during the internship or how we can improve the program.</p>
        
        <form onSubmit={handleSubmitFeedback} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Your Feedback</label>
            <textarea 
              required 
              rows={5}
              placeholder="Write your feedback here..."
              value={feedbackForm.text} 
              onChange={e => setFeedbackForm(p => ({...p, text: e.target.value}))} 
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm bg-white text-slate-900 placeholder:text-slate-400" 
            />
          </div>
          <Button type="submit" disabled={isSubmittingFeedback} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 text-base">
            {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </form>
      </Card>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight text-white flex items-center">
              CloudExify<span className="text-blue-500 font-extrabold text-2xl ml-0.5">.</span>
            </span>
          </div>
        </div>

        <nav className="p-4 space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3 px-4">Menu</div>
          
          <button 
            onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false) }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-bold ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>{isApprovedCandidate ? 'Dashboard' : 'Application Status'}</span>
          </button>
          
          {isApprovedCandidate && (
            <>
              <button 
                onClick={() => { setActiveTab('documents'); setIsSidebarOpen(false) }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-bold ${activeTab === 'documents' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
              >
                <FileText className="w-5 h-5" />
                <span>Documents</span>
              </button>
              
              <button 
                onClick={() => { setActiveTab('submit-project'); setIsSidebarOpen(false) }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-bold ${activeTab === 'submit-project' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
              >
                <Briefcase className="w-5 h-5" />
                <span>Project Submission</span>
              </button>
            </>
          )}
          
          <button 
            onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false) }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-bold ${activeTab === 'profile' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <UserCircle className="w-5 h-5" />
            <span>My Profile</span>
          </button>
          
          {isApprovedCandidate && (
            <>
              <button 
                onClick={() => { setActiveTab('review'); setIsSidebarOpen(false) }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-bold ${activeTab === 'review' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
              >
                <Star className="w-5 h-5" />
                <span>Submit Review</span>
              </button>

              <button 
                onClick={() => { setActiveTab('feedback'); setIsSidebarOpen(false) }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-bold ${activeTab === 'feedback' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
              >
                <MessageCircle className="w-5 h-5" />
                <span>Course Feedback</span>
              </button>
            </>
          )}
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-slate-800">
          <Button variant="outline" className="w-full bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <button className="lg:hidden text-slate-500 hover:text-slate-700" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1 flex justify-end items-center space-x-4">
            <span className="text-sm font-bold text-slate-700">{intern.full_name}</span>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
              {intern.full_name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {(!isApprovedCandidate || activeTab === 'dashboard') && activeTab !== 'profile' && renderStatusScreen()}
          {activeTab === 'profile' && renderProfileScreen()}
          {isApprovedCandidate && activeTab === 'documents' && renderDocumentsScreen()}
          {isApprovedCandidate && activeTab === 'review' && renderReviewScreen()}
          {isApprovedCandidate && activeTab === 'feedback' && renderFeedbackScreen()}
          {isApprovedCandidate && activeTab === 'submit-project' && (
            <SubmitProjectTab 
              intern={intern} 
              submittedCount={data.submitted_projects_count} 
              maxProjectsCount={data.max_projects_count || 4} 
              onProjectSubmitted={() => fetchDashboardData()} 
              projects={data.projects || []}
            />
          )}
        </main>
      </div>
    </div>
  )
}

function DocumentCard({ title, url, locked, icon, requiresProjects, submittedProjects = 0 }: { title: string, url: string | undefined | null, locked?: boolean, icon: React.ReactNode, requiresProjects?: number, submittedProjects?: number }) {
  if (requiresProjects && submittedProjects < requiresProjects) {
    return (
      <Card className="p-6 border border-slate-200 bg-slate-50/50 opacity-75 flex flex-col justify-between h-48">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-200 rounded-xl">{icon}</div>
          <div><h3 className="font-bold text-slate-700">{title}</h3><p className="text-[10px] text-red-500 font-bold mt-1">Requires {requiresProjects} projects (You: {submittedProjects})</p></div>
        </div>
      </Card>
    )
  }
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!url || locked) return;
    try {
      toast.loading('Downloading...', { id: 'download' });
      const res = await fetch(url);
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('Download complete', { id: 'download' });
    } catch (err) {
      toast.error('Download failed', { id: 'download' });
    }
  }

  if (!url) {
    return (
      <Card className="p-6 border border-slate-200 bg-slate-50/50 opacity-75 flex flex-col justify-between h-48">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-200 rounded-xl">{icon}</div>
          <div><h3 className="font-bold text-slate-700">{title}</h3><p className="text-xs text-slate-400">Not generated yet</p></div>
        </div>
      </Card>
    )
  }

  if (locked) {
    return (
      <Card className="p-6 border border-amber-200 bg-amber-50/30 flex flex-col justify-between h-48 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-2 h-full bg-amber-400" />
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 rounded-xl">{icon}</div>
          <div><h3 className="font-bold text-slate-800">{title}</h3><p className="text-xs font-semibold text-amber-600">Locked by Admin</p></div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all flex flex-col justify-between h-48 bg-white group">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-50 group-hover:bg-blue-100 transition-colors rounded-xl">{icon}</div>
        <div><h3 className="font-bold text-slate-800">{title}</h3><p className="text-xs font-semibold text-emerald-600">Ready to view/download</p></div>
      </div>
      <div className="flex items-center gap-3 mt-6">
        <button onClick={() => window.open(url, '_blank')} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
          View
        </button>
        <button onClick={handleDownload} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow-sm shadow-blue-200">
          <Download className="w-4 h-4" /> Download
        </button>
      </div>
    </Card>
  )
}
