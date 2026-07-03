'use client';

import React from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Cpu, Search, Mail, MessageSquare, Award, ArrowUpRight } from 'lucide-react';

export default function LeadGenDashboard() {
  return (
    <PageWrapper title="Lead Generation & Autonomous Outreach">
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 max-w-4xl mx-auto">
        
        {/* Main Hero Card */}
        <Card className="w-full relative overflow-hidden bg-slate-900 border-slate-800 text-slate-100 p-8 md:p-12 shadow-2xl rounded-2xl flex flex-col items-center text-center">
          
          {/* Decorative background glow */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

          {/* Icon Header */}
          <div className="p-4 bg-blue-950/80 text-blue-400 rounded-2xl border border-blue-900/50 mb-6 animate-pulse">
            <Cpu className="h-10 w-10" />
          </div>

          {/* Status Badge */}
          <Badge variant="blue" className="mb-4 text-[10px] font-bold px-3 py-1 bg-blue-900/50 text-blue-300 border border-blue-800/80 tracking-widest uppercase">
            Development Phase: Coming Soon
          </Badge>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-4">
            Autonomous Lead Generation Pipeline
          </h2>

          {/* Description */}
          <p className="text-slate-400 text-xs md:text-sm font-medium max-w-xl leading-relaxed mb-10">
            We are building a coordinated multi-agent AI system designed to automatically scan local target areas, enrich business records, draft personalized outreach, and handle conversation replies autonomously.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-left">
            <div className="p-4 bg-slate-950/40 border border-slate-800/60 rounded-xl flex items-start space-x-3">
              <div className="p-2 bg-blue-900/20 text-blue-400 rounded-lg mt-0.5">
                <Search className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wide">1. Discovery & Triage Agent</h4>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">
                  Autonomous scanner that retrieves target prospects without active web pages, resolves contacts, and parses initial personalization data.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-950/40 border border-slate-800/60 rounded-xl flex items-start space-x-3">
              <div className="p-2 bg-purple-900/20 text-purple-400 rounded-lg mt-0.5">
                <Mail className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wide">2. Email Outreach Agent</h4>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">
                  Drafts custom context-grounded outreach messages and schedules Resend dispatches according to verified sending configs.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-950/40 border border-slate-800/60 rounded-xl flex items-start space-x-3">
              <div className="p-2 bg-emerald-900/20 text-emerald-400 rounded-lg mt-0.5">
                <MessageSquare className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wide">3. WhatsApp Outreach & Reply Agent</h4>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">
                  Sends first-touch templates, classifies inbound customer replies, and manages chat transcripts directly inside the pipeline.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-950/40 border border-slate-800/60 rounded-xl flex items-start space-x-3">
              <div className="p-2 bg-amber-900/20 text-amber-400 rounded-lg mt-0.5">
                <Award className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wide">4. Direct CRM Sales Handoff</h4>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">
                  Identifies positive purchase intent, updates state statuses, and notifies sales founders for manual pricing and contract negotiations.
                </p>
              </div>
            </div>
          </div>
          
        </Card>

      </div>
    </PageWrapper>
  );
}
