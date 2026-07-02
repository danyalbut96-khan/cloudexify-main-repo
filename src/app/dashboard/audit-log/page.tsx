'use client';

import React, { useEffect, useState } from 'react';
import { History, ShieldCheck, User, Database, Settings } from 'lucide-react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/audit-logs');
      if (!res.ok) throw new Error('Failed to fetch audit logs');
      const data = await res.json();
      setLogs(data);
    } catch (err: any) {
      toast.error(err.message || 'Error loading audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'auth':
        return <ShieldCheck className="h-4 w-4 text-emerald-500" />;
      case 'documents':
        return <History className="h-4 w-4 text-blue-500" />;
      case 'settings':
        return <Settings className="h-4 w-4 text-amber-500" />;
      default:
        return <Database className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <PageWrapper title="System Audit Logs">
      {/* Table listing logs */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={8} cols={5} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Admin Email</th>
                  <th className="px-6 py-3.5">Action Executed</th>
                  <th className="px-6 py-3.5 text-center">Entity</th>
                  <th className="px-6 py-3.5">Reference ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center space-x-1.5 truncate max-w-[180px]">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <span>{log.admin_email}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-950 font-semibold max-w-sm truncate">{log.action}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center space-x-1 capitalize font-bold text-[10px] text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200/40">
                        {getEntityIcon(log.entity_type)}
                        <span>{log.entity_type}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-[10px] text-slate-400 select-all truncate max-w-[150px]">{log.entity_id || '-'}</td>
                  </tr>
                ))}

                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      No system actions logged.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
