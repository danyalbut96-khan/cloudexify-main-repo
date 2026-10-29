'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock, Sparkles, CreditCard, ShieldCheck, ArrowRight, AlertTriangle, PhoneCall } from 'lucide-react';

interface PipelineStatusTrackerProps {
  intern: {
    id: string;
    full_name: string;
    domain: string;
    status: string;
    pipeline_stage?: string;
    registration_number: string;
    batch_name?: string;
  };
}

export default function PipelineStatusTracker({ intern }: PipelineStatusTrackerProps) {
  const stage = String(intern.pipeline_stage || intern.status || 'registered').toLowerCase();

  // Determine stage progression (1 to 5)
  // Stages: 1. registered, 2. interview_pending, 3. under_review, 4. payment_pending/shortlisted, 5. approved/accepted
  let currentStep = 1;
  if (stage === 'interview_pending') currentStep = 2;
  else if (stage === 'under_review' || stage === 'interview_completed') currentStep = 3;
  else if (stage === 'shortlisted' || stage === 'payment_pending') currentStep = 4;
  else if (stage === 'approved' || stage === 'accepted') currentStep = 5;

  const steps = [
    { num: 1, title: 'Registered', desc: 'Application Received' },
    { num: 2, title: 'Interview', desc: 'Technical Assessment' },
    { num: 3, title: 'Under Review', desc: 'Mentor Evaluation' },
    { num: 4, title: 'Seat Payment', desc: 'Shortlisted Verification' },
    { num: 5, title: 'Approved', desc: 'Full Portal Access' }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
            Admissions Pipeline
          </span>
          <h3 className="text-lg font-black text-slate-900 mt-1">Application Progress</h3>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Reg ID: <span className="font-mono font-bold text-slate-800">{intern.registration_number}</span>
        </div>
      </div>

      {/* Progress Stepper Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {steps.map((s) => {
          const isDone = s.num < currentStep || currentStep === 5;
          const isCurrent = s.num === currentStep && currentStep !== 5;

          return (
            <div
              key={s.num}
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                isDone
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : isCurrent
                  ? 'bg-blue-50 border-blue-300 text-blue-950 shadow-sm'
                  : 'bg-slate-50/50 border-slate-200 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  isDone ? 'bg-emerald-200/60 text-emerald-800' : isCurrent ? 'bg-blue-200/70 text-blue-800' : 'bg-slate-200 text-slate-500'
                }`}>
                  Step {s.num}
                </span>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : isCurrent ? (
                  <Clock className="w-4 h-4 text-blue-600 animate-pulse" />
                ) : null}
              </div>
              <div>
                <p className={`text-xs font-bold ${isCurrent ? 'text-blue-900' : isDone ? 'text-emerald-900' : 'text-slate-600'}`}>
                  {s.title}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stage 1: Registered (Awaiting Interview Call) */}
      {stage === 'registered' && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-start gap-3.5 shadow-sm">
          <Clock className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-xs text-slate-800 space-y-1">
            <p className="font-bold text-slate-900 text-sm">Application Under Initial Review</p>
            <p className="text-slate-600 leading-relaxed">
              Hello <strong>{intern.full_name}</strong>! Your application for the <strong>{intern.domain}</strong> track has been received. Our admissions team is currently reviewing your profile and will issue your <strong>Technical Interview Call</strong> shortly.
            </p>
            <p className="text-slate-500 text-[11px] pt-1">
              Once called, the interview room button will activate here automatically, and you will receive an invitation email.
            </p>
          </div>
        </div>
      )}

      {/* Stage 2: Interview Pending (Called for Interview) */}
      {stage === 'interview_pending' && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-blue-900/20">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-200 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-300" /> Action Required - You Are Called for Interview!
            </div>
            <h4 className="text-base font-bold text-white">Your Technical Interview is Ready</h4>
            <p className="text-xs text-blue-100/90 leading-relaxed max-w-xl">
              You are invited to complete your technical assessment for the <strong>{intern.domain}</strong> track. The test is timed and monitored in fullscreen mode.
            </p>
          </div>
          <Link
            href="/interview"
            className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-extrabold px-6 py-3 rounded-xl text-xs transition-all shadow-md shrink-0"
          >
            Take Your Interview Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Stage 3: Under Review / Interview Completed */}
      {(stage === 'under_review' || stage === 'interview_completed') && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-xs text-amber-900">
            <p className="font-bold text-amber-950">Technical Interview Completed & Under Evaluation</p>
            <p className="mt-0.5 text-amber-800 leading-relaxed">
              Your interview responses have been securely received. Our admissions committee is evaluating your performance. You will receive an email and portal update once shortlisting decisions are finalized.
            </p>
          </div>
        </div>
      )}

      {/* Waitlist Status */}
      {stage === 'waitlisted' && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-xs text-amber-900">
            <p className="font-bold">Official Waitlist Status</p>
            <p className="mt-0.5 text-amber-800 leading-relaxed">
              All regular seats for {intern.domain} are filled. You are on the priority waitlist. As soon as a candidate drops out or is released, our automated seat manager will promote you and notify your email.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
