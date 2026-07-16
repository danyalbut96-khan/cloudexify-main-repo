'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  FolderGit2,
  FileSignature,
  Receipt,
  GraduationCap,
  ArrowRight,
  TrendingUp,
  Award,
  FileText,
  BadgeAlert,
  Building,
  BrainCircuit,
} from 'lucide-react';
import { Card, CardTitle, CardValue } from '@/components/ui/Card';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPKR, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard/stats');
        if (!res.ok) throw new Error('Failed to load dashboard metrics');
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <PageWrapper title="Dashboard Overview">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </PageWrapper>
    );
  }

  const internData = stats?.interns || {
    total: 0,
    domainBreakdown: {},
    offerLetters: { generated: 0, pending: 0 },
    certificates: { generated: 0, pending: 0 },
    experienceCertificates: { generated: 0, pending: 0 },
    recommendationLetters: { generated: 0, pending: 0 },
  };

  const projectData = stats?.projects || {
    active: 0,
    completed: 0,
    inquiries: 0,
    proposalsSentCount: 0,
    recentProposals: [],
    invoicesCount: 0,
    invoicesAmount: 0,
    adminBreakdown: {},
  };

  return (
    <PageWrapper title="Dashboard Overview">
      {/* 3 Main Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Clickable Intern Stats Card */}
        <Card
          hoverEffect
          onClick={() => router.push('/dashboard/interns')}
          className="border-l-4 border-l-blue-600 relative overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center text-slate-500 font-bold">
                <Users className="h-4 w-4 mr-1.5 text-blue-500" />
                Intern Management
              </CardTitle>
              <CardValue>{internData.total}</CardValue>
              <p className="text-xs text-slate-400 mt-1.5 flex items-center font-medium">
                Active Intern profiles registered
              </p>
            </div>
            <div className="bg-blue-50 text-blue-600 p-2.5 rounded-lg border border-blue-100">
              <GraduationCap className="h-5 w-5" />
            </div>
          </div>
          {/* Arrow hint */}
          <div className="absolute bottom-4 right-4 text-blue-500 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="h-4 w-4" />
          </div>
        </Card>

        {/* Project Stats Card */}
        <Card className="border-l-4 border-l-emerald-600">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center text-slate-500 font-bold">
                <FolderGit2 className="h-4 w-4 mr-1.5 text-emerald-500" />
                Project Tracking
              </CardTitle>
              <CardValue>{projectData.active + projectData.completed}</CardValue>
              <p className="text-xs text-slate-400 mt-1.5 font-medium">
                {projectData.active} Active | {projectData.completed} Completed
              </p>
            </div>
            <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-lg border border-emerald-100">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </Card>

        {/* Invoice PKR Totals Card */}
        <Card className="border-l-4 border-l-indigo-600">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center text-slate-500 font-bold">
                <Receipt className="h-4 w-4 mr-1.5 text-indigo-500" />
                Finance & Invoicing
              </CardTitle>
              <CardValue>{formatPKR(projectData.invoicesAmount)}</CardValue>
              <p className="text-xs text-slate-400 mt-1.5 font-medium">
                From {projectData.invoicesCount} generated invoices
              </p>
            </div>
            <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-lg border border-indigo-100">
              <Receipt className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Grid: Intern Domain breakdown & Document generation states */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Intern Domain breakdown */}
        <Card className="lg:col-span-1">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center">
            <Users className="h-4.5 w-4.5 mr-2 text-slate-400" />
            Interns by Domain
          </h2>
          <div className="space-y-3.5">
            {Object.entries(internData.domainBreakdown).map(([domain, count]: any) => (
              <div key={domain} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600 truncate max-w-[80%]">{domain}</span>
                  <span className="text-slate-900">{count}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full"
                    style={{ width: `${internData.total > 0 ? (count / internData.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
            {internData.total === 0 && (
              <p className="text-xs text-slate-400 py-6 text-center">No interns registered.</p>
            )}
          </div>
        </Card>

        {/* Intern Document status mapping */}
        <Card className="lg:col-span-2">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center">
            <Award className="h-4.5 w-4.5 mr-2 text-slate-400" />
            Document Issuance Audit
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
            {/* Offer letter status block */}
            <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 text-center">
              <FileText className="h-5 w-5 text-slate-400 mx-auto mb-1.5" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Offer Letters</p>
              <p className="text-lg font-bold text-slate-800 mt-2">{internData.offerLetters.generated}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{internData.offerLetters.pending} pending</p>
            </div>

            {/* Certificate completion */}
            <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 text-center">
              <Award className="h-5 w-5 text-slate-400 mx-auto mb-1.5" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Certificates</p>
              <p className="text-lg font-bold text-slate-800 mt-2">{internData.certificates.generated}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{internData.certificates.pending} pending</p>
            </div>

            {/* Experience cert */}
            <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 text-center">
              <FileText className="h-5 w-5 text-slate-400 mx-auto mb-1.5" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Exp Letters</p>
              <p className="text-lg font-bold text-slate-800 mt-2">{internData.experienceCertificates.generated}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{internData.experienceCertificates.pending} pending</p>
            </div>

            {/* Recommendation letter */}
            <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 text-center">
              <FileText className="h-5 w-5 text-slate-400 mx-auto mb-1.5" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rec Letters</p>
              <p className="text-lg font-bold text-slate-800 mt-2">{internData.recommendationLetters.generated}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{internData.recommendationLetters.pending} pending</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Grid: Recent Proposals & Invoice Breakdown by Admin & Employee Soon */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent proposals sent */}
        <Card className="lg:col-span-2">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
            <span className="flex items-center">
              <FileSignature className="h-4.5 w-4.5 mr-2 text-slate-400" />
              Recent Proposals
            </span>
            <Badge variant="blue">{projectData.proposalsSentCount} Sent</Badge>
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead>
                <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Client</th>
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Cost</th>
                  <th className="pb-3">Sent By</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs text-slate-600 font-medium">
                {projectData.recentProposals.map((prop: any) => (
                  <tr key={prop.id}>
                    <td className="py-3 pr-2 truncate max-w-[120px]">{prop.client_name}</td>
                    <td className="py-3 pr-2 truncate max-w-[150px]">{prop.proposal_title}</td>
                    <td className="py-3 font-semibold text-slate-900">{formatPKR(prop.estimated_cost)}</td>
                    <td className="py-3 text-slate-400">{prop.sent_by.split('@')[0]}</td>
                    <td className="py-3">
                      <Badge
                        variant={
                          prop.status === 'accepted'
                            ? 'success'
                            : prop.status === 'sent'
                            ? 'blue'
                            : prop.status === 'rejected'
                            ? 'danger'
                            : 'neutral'
                        }
                      >
                        {prop.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {projectData.recentProposals.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No proposals sent.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Invoice breakdown by admin & Employee Soon */}
        <div className="space-y-6">
          {/* Invoice breakdown */}
          <Card>
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center">
              <Receipt className="h-4.5 w-4.5 mr-2 text-slate-400" />
              Invoices by Creator
            </h2>
            <div className="space-y-3">
              {Object.entries(projectData.adminBreakdown).map(([email, info]: any) => (
                <div key={email} className="flex justify-between items-center border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                  <div className="text-xs">
                    <p className="font-semibold text-slate-700 truncate max-w-[150px]">{email}</p>
                    <p className="text-[10px] text-slate-400">{info.count} Invoices generated</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-950">{formatPKR(info.amount)}</p>
                  </div>
                </div>
              ))}
              {Object.keys(projectData.adminBreakdown).length === 0 && (
                <p className="text-xs text-slate-400 py-6 text-center">No invoices generated yet.</p>
              )}
            </div>
          </Card>

          {/* AI Project Analysis card */}
          <Card
            hoverEffect
            onClick={() => router.push('/dashboard/intern-analysis')}
            className="border border-blue-100 bg-gradient-to-br from-blue-50/30 to-violet-50/10 cursor-pointer relative overflow-hidden"
          >
            <div className="flex items-center space-x-2.5 mb-3">
              <BrainCircuit className="h-4.5 w-4.5 text-blue-500" />
              <h2 className="text-sm font-bold text-slate-800">Intern Project AI</h2>
              <Badge variant="blue" className="text-[9px] px-1.5 py-0">AI Active</Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center mb-3">
              <div className="bg-white/80 rounded-lg p-2 border border-slate-100">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Total</p>
                <p className="text-base font-black text-slate-800">{stats?.analysis?.total || 0}</p>
              </div>
              <div className="bg-white/80 rounded-lg p-2 border border-slate-100">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Done</p>
                <p className="text-base font-black text-green-600">{stats?.analysis?.done || 0}</p>
              </div>
              <div className="bg-white/80 rounded-lg p-2 border border-slate-100">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Pending</p>
                <p className="text-base font-black text-amber-500">{stats?.analysis?.pending || 0}</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-normal mb-1 font-medium flex items-center justify-between">
              <span>Go to AI Analysis Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5 text-blue-500" />
            </p>
          </Card>

          {/* Employee Placeholder card */}
          <Card className="border border-dashed border-slate-200 bg-slate-50/50">
            <div className="flex items-center space-x-2.5 mb-2.5">
              <Building className="h-4.5 w-4.5 text-slate-400" />
              <h2 className="text-sm font-bold text-slate-700">Employee Management</h2>
              <Badge variant="neutral" className="text-[9px] px-1.5 py-0 border-none bg-slate-200 text-slate-600">Coming Soon</Badge>
            </div>
            <p className="text-xs text-slate-400 leading-normal">
              HR modules for tracking employees, generating official offer letters, issuing appointment letters, and managing experience certificates will be integrated soon.
            </p>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
