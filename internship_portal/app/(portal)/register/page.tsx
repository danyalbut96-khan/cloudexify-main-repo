'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, BookOpen, Clock, Building2, CheckCircle, Loader2, ArrowLeft, Hash, Globe, FileUp, Sparkles, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const DOMAINS = [
  'Python Programming',
  'C++ Programming',
  'Java Programming',
  'Data Science & AI Basics',
  'Cybersecurity Fundamentals',
  'Full Stack Development'
];

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Expert'];
const GENDERS = ['Male', 'Female', 'Other'];
const REFERRAL_SOURCES = ['LinkedIn', 'WhatsApp', 'Friend', 'Advertisement', 'University Notice', 'Other'];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsapp: '',
    gender: '',
    university: '',
    universityRegistrationNumber: '',
    semester: '',
    domain: '',
    skillLevel: 'Beginner',
    availableHours: '15',
    referralSource: 'LinkedIn',
    interest: '',
    linkedinUrl: '',
    resumeUrl: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [resumeFileName, setResumeFileName] = useState('');
  const [activeBatch, setActiveBatch] = useState<any>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState<boolean | null>(null);
  const [successData, setSuccessData] = useState<{ intern: any; isWaitlisted: boolean; message: string } | null>(null);

  useEffect(() => {
    fetch('/api/batches')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const accepting = data.find((b: any) => b.status === 'accepting');
          setActiveBatch(accepting || null);
        }
      })
      .catch(() => { });

    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setIsRegistrationOpen(data.submitSettings?.registration_open ?? true);
        }
      })
      .catch(() => setIsRegistrationOpen(true));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Resume must be under 5MB');
      return;
    }

    setIsUploadingResume(true);
    const toastId = toast.loading('Uploading resume...');

    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop() || 'pdf';
      const cleanName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;

      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(cleanName, file, { upsert: true });

      if (error) throw error;

      const { data: pubData } = supabase.storage
        .from('resumes')
        .getPublicUrl(cleanName);

      setFormData(prev => ({ ...prev, resumeUrl: pubData.publicUrl }));
      setResumeFileName(file.name);
      toast.success('Resume uploaded successfully!', { id: toastId });
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload resume', { id: toastId });
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const sem = parseInt(formData.semester, 10);
    if (isNaN(sem) || sem < 2) {
      toast.error('Eligibility Error: Minimum 2 completed semesters are required to apply.');
      return;
    }

    if (!formData.universityRegistrationNumber.trim()) {
      toast.error('University Registration Number is required.');
      return;
    }

    if (!formData.interest.trim()) {
      toast.error('Please share your interest and goals for this internship.');
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading('Submitting registration...');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      toast.success(data.message || 'Registration completed!', { id: toastId });
      setSuccessData(data);
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  if (successData) {
    const isWait = successData.isWaitlisted;
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="sm:mx-auto sm:w-full sm:max-w-lg">
          <div className={`bg-slate-900/80 backdrop-blur-md border shadow-2xl rounded-2xl p-8 text-center space-y-6 ${
            isWait ? 'border-amber-500/30 shadow-amber-900/20' : 'border-emerald-500/30 shadow-emerald-900/20'
          }`}>
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center border ${
              isWait ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
            }`}>
              {isWait ? <Clock className="w-8 h-8" /> : <CheckCircle className="w-8 h-8" />}
            </div>

            <div>
              <h2 className="text-2xl font-black text-white mb-2">
                {isWait ? 'Added to Official Waitlist' : 'Registration Confirmed!'}
              </h2>
              <span className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold border ${
                isWait ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
              }`}>
                ID: {successData.intern?.registration_number}
              </span>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed">
              Hello <strong>{successData.intern?.full_name}</strong>! Your application for <strong>{successData.intern?.domain}</strong> has been received.
            </p>

            {isWait ? (
              <div className="bg-amber-950/40 p-4 rounded-xl border border-amber-800/60 text-left space-y-2">
                <p className="text-xs text-amber-200 font-semibold">
                  ? All regular seats for this domain are currently occupied.
                </p>
                <p className="text-xs text-amber-300/80 leading-relaxed">
                  You are registered on the official waitlist. As soon as a candidate drops out, fails the payment deadline, or a seat is released, our system will automatically promote you and notify your email.
                </p>
              </div>
            ) : (
              <div className="bg-slate-800/60 p-5 rounded-xl border border-slate-700/60 text-left space-y-3">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" /> Next Step: Timed AI Text Interview
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Log in to the Student Portal with your <strong>Email</strong> and <strong>Registration Number</strong> to take your 2 to 5 question timed interview.
                </p>
                <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-700/80 font-mono text-xs text-slate-300">
                  <div><strong>Email:</strong> {successData.intern?.email}</div>
                  <div><strong>Registration Number:</strong> <span className="text-blue-400 font-bold">{successData.intern?.registration_number}</span></div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2">
              {!isWait && (
                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:opacity-90 text-white font-bold rounded-xl py-3 text-sm transition-all shadow-lg shadow-blue-900/30"
                >
                  Proceed to Login & Take Interview ?
                </Link>
              )}
              <Link href="/" className="inline-flex items-center justify-center gap-2 text-slate-400 hover:text-white text-xs font-semibold transition-colors py-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const semesterNum = parseInt(formData.semester, 10);
  const isSemesterBlocked = !isNaN(semesterNum) && semesterNum < 2;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-3xl z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h2 className="text-3xl font-black text-white tracking-tight">Internship Registration</h2>
          <p className="mt-2 text-sm text-slate-400">Join CloudExify and kickstart your engineering journey with mentorship & live projects.</p>
        </div>

        <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800 shadow-xl rounded-2xl p-6 sm:p-10">
          {activeBatch && (
            <div className="mb-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-blue-100">Active Batch: {activeBatch.name}</h3>
                <p className="text-xs text-blue-200/80 mt-1">
                  Registration Deadline: {activeBatch.registration_deadline ? new Date(activeBatch.registration_deadline).toLocaleDateString() : 'Rolling Admission'}. Apply early to secure domain seats.
                </p>
              </div>
            </div>
          )}

          {isRegistrationOpen === false ? (
            <div className="text-center py-12 bg-slate-800/40 rounded-xl border border-slate-700/50">
              <h3 className="text-xl font-bold text-slate-300 mb-2">Registration is Closed</h3>
              <p className="text-slate-400 text-sm">We are not accepting new registrations at this time. Please check back later.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Full Name <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input required name="fullName" value={formData.fullName} onChange={handleChange} placeholder="e.g. Danyaal Khan" className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Email Address <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="email" required name="email" value={formData.email} onChange={handleChange} placeholder="you@university.edu" className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">WhatsApp Number <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="tel" required name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="+92 300 1234567" className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Gender <span className="text-red-400">*</span></label>
                  <select required name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none">
                    <option value="" disabled>Select Gender</option>
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                {/* University */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">University Name <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input required name="university" value={formData.university} onChange={handleChange} placeholder="e.g. COMSATS, NUST, FAST" className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                </div>

                {/* University Registration Number (NEW & REQUIRED) */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                    University Reg / Roll No. <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      required
                      name="universityRegistrationNumber"
                      value={formData.universityRegistrationNumber}
                      onChange={handleChange}
                      placeholder="e.g. FA21-BCS-042 or 2022-CS-108"
                      className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Official ID assigned by your university.</p>
                </div>

                {/* Semester with Eligibility Rule */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Current Semester <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="number"
                      min="1"
                      max="12"
                      required
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      placeholder="e.g. 4"
                      className={`w-full bg-slate-800/60 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors ${
                        isSemesterBlocked ? 'border-amber-500/80 focus:border-amber-500' : 'border-slate-700 focus:border-blue-500'
                      }`}
                    />
                  </div>
                  {isSemesterBlocked ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-400 mt-1.5 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      Minimum 2 completed semesters are required.
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 mt-1">Must have completed at least 2 semesters.</p>
                  )}
                </div>

                {/* Skill / Expertise Level */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Expertise Level <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    name="skillLevel"
                    value={formData.skillLevel}
                    onChange={handleChange}
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                  >
                    {SKILL_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">Interview difficulty will calibrate to your level.</p>
                </div>

                {/* Domain Selection */}
                <div className="md:col-span-2 border-t border-slate-800/80 pt-5">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Internship Domain Track <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    name="domain"
                    value={formData.domain}
                    onChange={handleChange}
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none font-semibold"
                  >
                    <option value="" disabled>Select your desired technical track</option>
                    {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                {/* Interest & Objectives (NEW & REQUIRED) */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Why do you want to join this track? <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    name="interest"
                    value={formData.interest}
                    onChange={handleChange}
                    placeholder="Briefly describe your interest in this domain and what you aim to achieve during this internship..."
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>

                {/* LinkedIn URL (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                    LinkedIn Profile (Optional)
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      name="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Resume Upload (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Resume / CV (Optional PDF, max 5MB)
                  </label>
                  <div className="relative">
                    <label className={`w-full flex items-center justify-between bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-400 cursor-pointer hover:border-slate-500 transition-colors ${
                      isUploadingResume ? 'opacity-50 cursor-not-allowed' : ''
                    }`}>
                      <span className="truncate">{resumeFileName || 'Choose PDF file...'}</span>
                      <FileUp className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                      <input
                        type="file"
                        accept=".pdf"
                        disabled={isUploadingResume}
                        onChange={handleResumeUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Available Hours */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Available Hours (per week) <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="number" min="5" max="40" required name="availableHours" value={formData.availableHours} onChange={handleChange} placeholder="e.g. 15" className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                </div>

                {/* Referral Source */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Referral Source <span className="text-red-400">*</span></label>
                  <select required name="referralSource" value={formData.referralSource} onChange={handleChange} className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none">
                    {REFERRAL_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading || isSemesterBlocked || isUploadingResume}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:opacity-90 disabled:opacity-50 text-white font-bold rounded-xl py-3.5 text-sm transition-all shadow-lg shadow-blue-900/30"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isLoading ? 'Submitting Application...' : 'Submit Application'}
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
}