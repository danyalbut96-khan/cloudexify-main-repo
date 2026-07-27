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
  LifeBuoy,
} from 'lucide-react';
import { Card, CardTitle, CardValue } from '@/components/ui/Card';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPKR, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { InternGrowthChart } from '@/components/dashboard/InternGrowthChart';
import { DomainDistributionChart } from '@/components/dashboard/DomainDistributionChart';
import { DocumentStatsChart } from '@/components/dashboard/DocumentStatsChart';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard/stats');
        if (!res.ok) throw new Error('Failed to load dashboard metrics');
        const data = await res.json();
        if (isMounted) {
          setStats(data);
          setIsLoading(false);
        }
      } catch (error) {
        console.error(error);
        if (isMounted) setIsLoading(false);
      }
    };
    
    // Initial fetch
    fetchStats();

    // Auto-refresh every 30 seconds for a real-time feel
    const interval = setInterval(fetchStats, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (isLoading) {
    return (
      <PageWrapper title="Dashboard Overview">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 w-full lg:col-span-2" />
          <Skeleton className="h-96 w-full" />
        </div>
      </PageWrapper>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  const internData = stats?.interns || {
    total: 0,
    domainBreakdown: {},
    offerLetters: { generated: 0, pending: 0 },
    certificates: { generated: 0, pending: 0 },
    experienceCertificates: { generated: 0, pending: 0 },
    recommendationLetters: { generated: 0, pending: 0 },
    trend: []
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
    newProjectsCount: 0,
    newInvoicesCount: 0
  };

  const supportData = stats?.support || { total: 0, open: 0, new: 0 };
  const recentActivity = stats?.recentActivity || [];

  const domainBreakdown: any = internData?.domainBreakdown || {};
  const newInternsCount: number = Object.values(domainBreakdown).reduce((acc: any, curr: any) => acc + (curr?.new || 0), 0) as number;

  return (
    <PageWrapper title="Dashboard Overview">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Quick Actions Command Center */}
        <motion.div variants={itemVariants} className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-900/10 flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-20 w-32 h-32 bg-blue-400 opacity-20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="z-10 mb-4 md:mb-0">
            <h2 className="text-xl font-bold tracking-tight">Welcome back!</h2>
            <p className="text-blue-100 text-sm mt-1">Here is what's happening in your internship program today.</p>
          </div>
          <div className="flex space-x-3 z-10 w-full md:w-auto">
            <Button onClick={() => router.push('/dashboard/interns')} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-none backdrop-blur-sm transition-all">
              <Users className="w-4 h-4 mr-2" /> Add Intern
            </Button>
            <Button onClick={() => router.push('/dashboard/documents/offer-letter')} className="bg-white hover:bg-slate-50 text-blue-700 font-bold shadow-lg transition-transform hover:scale-105 active:scale-95">
              <FileSignature className="w-4 h-4 mr-2" /> Generate Document
            </Button>
          </div>
        </motion.div>

      {/* 4 Main Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <CardValue>
                {internData.total}
                {newInternsCount > 0 && (
                  <Badge variant="blue" className="ml-2 text-[10px] bg-blue-100 text-blue-700 py-0.5 border-none">
                    +{newInternsCount} new
                  </Badge>
                )}
              </CardValue>
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
              <CardValue>
                {projectData.active + projectData.completed}
                {projectData.newProjectsCount > 0 && (
                  <Badge variant="success" className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 py-0.5 border-none">
                    +{projectData.newProjectsCount} new
                  </Badge>
                )}
              </CardValue>
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
              <CardValue>
                {formatPKR(projectData.invoicesAmount)}
                {projectData.newInvoicesCount > 0 && (
                  <Badge variant="neutral" className="ml-2 text-[10px] bg-indigo-100 text-indigo-700 py-0.5 border-none">
                    +{projectData.newInvoicesCount} new
                  </Badge>
                )}
              </CardValue>
              <p className="text-xs text-slate-400 mt-1.5 font-medium">
                From {projectData.invoicesCount} generated invoices
              </p>
            </div>
            <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-lg border border-indigo-100">
              <Receipt className="h-5 w-5" />
            </div>
          </div>
        </Card>

        {/* Support Tickets Card */}
        <Card
          hoverEffect
          onClick={() => router.push('/dashboard/support')}
          className="border-l-4 border-l-purple-600 relative overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center text-slate-500 font-bold">
                <LifeBuoy className="h-4 w-4 mr-1.5 text-purple-500" />
                Support Tickets
              </CardTitle>
              <CardValue>
                {supportData.open}
                {supportData.new > 0 && (
                  <Badge variant="neutral" className="ml-2 text-[10px] bg-purple-100 text-purple-700 py-0.5 border-none">
                    +{supportData.new} new
                  </Badge>
                )}
              </CardValue>
              <p className="text-xs text-slate-400 mt-1.5 font-medium">
                {supportData.open} Open | {supportData.total} Total
              </p>
            </div>
            <div className="bg-purple-50 text-purple-600 p-2.5 rounded-lg border border-purple-100">
              <LifeBuoy className="h-5 w-5" />
            </div>
          </div>
          <div className="absolute bottom-4 right-4 text-purple-500 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="h-4 w-4" />
          </div>
        </Card>
      </div>

      {/* Advanced Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Intern Growth Trend */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-bold text-slate-800 flex items-center">
                <TrendingUp className="h-4.5 w-4.5 mr-2 text-blue-500" />
                Internship Growth Trend
              </h2>
              <Badge variant="blue" className="text-[10px] bg-blue-50 text-blue-600 border-none px-2 py-0.5 animate-pulse">Live Data</Badge>
            </div>
            <p className="text-xs text-slate-400 mb-4">Historical analysis of new intern registrations.</p>
            <InternGrowthChart data={internData.trend || []} />
          </Card>
        </motion.div>

        {/* Domain Distribution */}
        <motion.div variants={itemVariants}>
          <Card className="h-full shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-bold text-slate-800 flex items-center">
                <Users className="h-4.5 w-4.5 mr-2 text-indigo-500" />
                Domain Breakdown
              </h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">Current distribution of interns across tech stacks.</p>
            <DomainDistributionChart data={internData.domainBreakdown} />
          </Card>
        </motion.div>
      </div>

      {/* Grid: Document generation & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Document generation Stats Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-bold text-slate-800 flex items-center">
                <FileSignature className="h-4.5 w-4.5 mr-2 text-emerald-500" />
                Document Issuance Audit
              </h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">Comparison of generated vs pending official documents.</p>
            <DocumentStatsChart data={internData} />
          </Card>
        </motion.div>

        {/* Recent Activity Feed */}
        <motion.div variants={itemVariants}>
          <Card className="h-full shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60 flex flex-col">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-sm font-bold text-slate-800 flex items-center">
                  <BadgeAlert className="h-4.5 w-4.5 mr-2 text-purple-500" />
                  Recent Activity
                </h2>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((log: any) => (
                    <div key={log.id} className="relative pl-4 border-l-2 border-slate-100 pb-1 last:pb-0">
                      <div className="absolute w-2 h-2 bg-purple-500 rounded-full -left-[5px] top-1.5 ring-4 ring-white"></div>
                      <p className="text-xs font-semibold text-slate-800">{log.action}</p>
                      <div className="flex justify-between mt-1">
                        <p className="text-[10px] font-medium text-slate-500 truncate max-w-[120px]">{log.actor_email}</p>
                        <p className="text-[9px] font-bold text-slate-400">{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-xs">
                    <LifeBuoy className="h-8 w-8 mb-2 opacity-20" />
                    No recent activity
                  </div>
                )}
              </div>
          </Card>
        </motion.div>
      </div>

      {/* Grid: Recent Proposals & Invoice Breakdown by Admin & Employee Soon */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
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
        </motion.div>
      </div>
      </motion.div>
    </PageWrapper>
  );
}
