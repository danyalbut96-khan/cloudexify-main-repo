'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, BookOpen, Clock, Building2, ChevronDown, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

const DOMAINS = [
  'Python Programming',
  'C++ Programming',
  'Java Programming',
  'Data Science & AI Basics',
  'Cybersecurity Fundamentals',
  'Full Stack Development'
];

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const GENDERS = ['Male', 'Female', 'Other'];
const REFERRAL_SOURCES = ['LinkedIn', 'WhatsApp', 'Friend', 'Advertisement', 'Other'];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsapp: '',
    gender: '',
    university: '',
    semester: '',
    domain: '',
    skillLevel: '',
    availableHours: '',
    referralSource: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [comingBatches, setComingBatches] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/batches')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setComingBatches(data.filter((b: any) => b.status === 'coming'));
        }
      })
      .catch(() => {});
  }, []);
  const [successData, setSuccessData] = useState<{ intern?: any; message?: string; isWaitlisted?: boolean } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading('Submitting registration...');

    try {
      const res = await fetch('/api/portal/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      if (data.isWaitlisted) {
        toast.success('Added to waitlist!', { id: toastId });
      } else {
        toast.success('Registration successful!', { id: toastId });
      }
      setSuccessData(data);
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  if (successData) {
    if (successData.isWaitlisted) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-slate-900/60 backdrop-blur-md border border-amber-500/30 shadow-2xl shadow-amber-900/20 rounded-2xl p-8 text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-amber-500/20 border border-amber-500/30 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white mb-2">Waitlist Subscribed!</h2>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                {successData.message}
              </p>
              <Link href="/portal" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors mt-4">
                <ArrowLeft className="w-4 h-4" /> Return to Portal
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-slate-900/60 backdrop-blur-md border border-green-500/30 shadow-2xl shadow-green-900/20 rounded-2xl p-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            
            <div>
              <h2 className="text-2xl font-black text-white mb-2">Registration Successful!</h2>
              <p className="text-green-400 font-medium bg-green-500/10 inline-block px-3 py-1 rounded-full text-sm border border-green-500/20">
                ID: {successData.intern?.registration_number}
              </p>
            </div>
            
            <p className="text-slate-400 text-sm leading-relaxed">
              Congratulations, <strong>{successData.intern?.full_name}</strong>! Your application for the <strong>{successData.intern?.domain}</strong> internship has been received.
            </p>
            
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 text-left space-y-2">
              <p className="text-xs text-slate-300">
                ✅ We will review your application shortly and notify you via email.
              </p>
              <p className="text-xs text-slate-300">
                💬 If you have any questions, feel free to contact us on WhatsApp or email.
              </p>
            </div>

            <Link href="/portal" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors mt-4">
              <ArrowLeft className="w-4 h-4" /> Return to Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl z-10">
        <div className="text-center mb-8">
          <Link href="/portal" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Portal
          </Link>
          <h2 className="text-3xl font-black text-white tracking-tight">Intern Registration</h2>
          <p className="mt-2 text-sm text-slate-400">Join the CloudExify Internship Program and level up your skills.</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 shadow-xl rounded-2xl p-6 sm:p-10">
          {comingBatches.length > 0 && (
            <div className="mb-8 space-y-3">
              {comingBatches.map(batch => (
                <div key={batch.id} className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-blue-100">Upcoming Batch: {batch.name}</h3>
                    <p className="text-xs text-blue-200/70 mt-1">
                      Starting on {new Date(batch.start_date).toLocaleDateString()}. Apply today to secure your spot for the upcoming cohort!
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

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
                  <input type="email" required name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors" />
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
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">University <span className="text-red-400">*</span></label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input required name="university" value={formData.university} onChange={handleChange} placeholder="Your University Name" className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
              </div>

              {/* Semester */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Semester <span className="text-red-400">*</span></label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="number" min="1" max="10" required name="semester" value={formData.semester} onChange={handleChange} placeholder="e.g. 5" className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
              </div>

              {/* Domain */}
              <div className="md:col-span-2 border-t border-slate-800 pt-6 mt-2">
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Internship Domain <span className="text-red-400">*</span></label>
                <select required name="domain" value={formData.domain} onChange={handleChange} className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none font-semibold">
                  <option value="" disabled>Select your field of interest</option>
                  {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              {/* Skill Level */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Skill Level <span className="text-red-400">*</span></label>
                <select required name="skillLevel" value={formData.skillLevel} onChange={handleChange} className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none">
                  <option value="" disabled>Select Skill Level</option>
                  {SKILL_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Available Hours */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Available Hours (per week) <span className="text-red-400">*</span></label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="number" min="5" max="40" required name="availableHours" value={formData.availableHours} onChange={handleChange} placeholder="e.g. 20" className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
              </div>

              {/* Referral Source */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">How did you hear about us? <span className="text-red-400">*</span></label>
                <select required name="referralSource" value={formData.referralSource} onChange={handleChange} className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none">
                  <option value="" disabled>Select Source</option>
                  {REFERRAL_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:opacity-90 disabled:opacity-50 text-white font-bold rounded-xl py-3.5 text-sm transition-all shadow-lg shadow-blue-900/30"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? 'Submitting Application...' : 'Submit Registration'}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}
