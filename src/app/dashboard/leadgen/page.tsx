'use client';

import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Search, Mail, MessageSquare, Reply, Clock, Award, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function LeadGenDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/leadgen/stats');
        if (!res.ok) throw new Error('Failed to load stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Error loading stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <PageWrapper title="Lead Generation Dashboard">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </PageWrapper>
    );
  }

  const totals = stats?.totals || {
    discovered: 0,
    emailsSent: 0,
    whatsappSent: 0,
    repliesReceived: 0,
    pendingFollowUps: 0,
    qualified: 0
  };

  const funnel = stats?.funnel || [
    { stage: 'Discovered', count: 0 },
    { stage: 'Enriched', count: 0 },
    { stage: 'Emailed', count: 0 },
    { stage: 'Replied', count: 0 },
    { stage: 'Qualified', count: 0 }
  ];

  const maxFunnelCount = Math.max(...funnel.map((f: any) => f.count), 1);

  return (
    <PageWrapper title="Lead Generation Dashboard">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card className="p-4 border-l-4 border-l-slate-400">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Discovered</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">{totals.discovered}</h3>
            </div>
            <div className="bg-slate-50 text-slate-500 p-1.5 rounded-lg border border-slate-100">
              <Search className="h-4 w-4" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Emails Sent</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">{totals.emailsSent}</h3>
            </div>
            <div className="bg-blue-50 text-blue-500 p-1.5 rounded-lg border border-blue-100">
              <Mail className="h-4 w-4" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">WhatsApp Sent</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">{totals.whatsappSent}</h3>
            </div>
            <div className="bg-emerald-50 text-emerald-500 p-1.5 rounded-lg border border-emerald-100">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-purple-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Replies</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">{totals.repliesReceived}</h3>
            </div>
            <div className="bg-purple-50 text-purple-500 p-1.5 rounded-lg border border-purple-100">
              <Reply className="h-4 w-4" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending F/U</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">{totals.pendingFollowUps}</h3>
            </div>
            <div className="bg-amber-50 text-amber-500 p-1.5 rounded-lg border border-amber-100">
              <Clock className="h-4 w-4" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-indigo-600">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Qualified</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">{totals.qualified}</h3>
            </div>
            <div className="bg-indigo-50 text-indigo-600 p-1.5 rounded-lg border border-indigo-100">
              <Award className="h-4 w-4" />
            </div>
          </div>
        </Card>
      </div>

      {/* Funnel Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-6">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Acquisition Pipeline Funnel</h2>
            <Link href="/dashboard/leadgen/leads" className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center">
              View Leads <ArrowUpRight className="h-3.5 w-3.5 ml-0.5" />
            </Link>
          </div>

          {/* Premium Custom SVG Funnel Chart */}
          <div className="flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg space-y-4">
              {funnel.map((item: any, index: number) => {
                const percentage = Math.round((item.count / maxFunnelCount) * 100);
                const widthPercent = 100 - index * 12; // Creates the tapering funnel shape
                const colors = [
                  'bg-slate-400 shadow-slate-200',
                  'bg-teal-500 shadow-teal-100',
                  'bg-blue-500 shadow-blue-100',
                  'bg-purple-500 shadow-purple-100',
                  'bg-indigo-600 shadow-indigo-200'
                ];

                return (
                  <div key={item.stage} className="group relative flex items-center space-x-4">
                    {/* Stage Label */}
                    <div className="w-24 text-right text-xs font-bold text-slate-500">{item.stage}</div>

                    {/* Trapezoidal Block */}
                    <div className="flex-1 flex items-center">
                      <div
                        className={`h-10 rounded-lg flex items-center px-4 justify-between text-white font-bold text-xs shadow-sm transition-all duration-200 group-hover:scale-[1.01] ${colors[index]}`}
                        style={{ width: `${widthPercent}%` }}
                      >
                        <span className="truncate">{item.count} Leads</span>
                        <span className="text-[10px] opacity-80">{percentage}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Lead status overview card */}
        <Card className="lg:col-span-1">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">
            Pipeline Conversion
          </h2>
          <div className="space-y-4 py-2">
            <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
              <span className="text-slate-500 font-semibold">Discovery to Enrichment</span>
              <Badge variant="blue">
                {totals.discovered > 0 ? Math.round((funnel[1].count / totals.discovered) * 100) : 0}%
              </Badge>
            </div>
            <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
              <span className="text-slate-500 font-semibold">Enrichment to Emailed</span>
              <Badge variant="blue">
                {funnel[1].count > 0 ? Math.round((funnel[2].count / funnel[1].count) * 100) : 0}%
              </Badge>
            </div>
            <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
              <span className="text-slate-500 font-semibold">Outbound Email Response</span>
              <Badge variant="blue">
                {funnel[2].count > 0 ? Math.round((funnel[3].count / funnel[2].count) * 100) : 0}%
              </Badge>
            </div>
            <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
              <span className="text-slate-500 font-semibold">Reply Qualification Rate</span>
              <Badge variant="success">
                {funnel[3].count > 0 ? Math.round((funnel[4].count / funnel[3].count) * 100) : 0}%
              </Badge>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 mt-6">
              <h4 className="text-xs font-bold text-slate-700 mb-1">Active Scope</h4>
              <p className="text-[10px] text-slate-400 leading-normal">
                Module runs in Islamabad targeted categories: Restaurants, Clinics, and Beauty Salons. Expand configs or trigger schedules via the pipeline workflow control panel.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </PageWrapper>
  );
}
