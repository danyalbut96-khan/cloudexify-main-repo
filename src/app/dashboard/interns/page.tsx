'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Download, Filter, Eye, Award, FileSpreadsheet } from 'lucide-react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function InternsPage() {
  const router = useRouter();
  const [interns, setInterns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters State
  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState('');
  const [semester, setSemester] = useState('');
  const [offerStatus, setOfferStatus] = useState('');
  const [certStatus, setCertStatus] = useState('');

  const fetchInterns = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (domain) params.append('domain', domain);
      if (semester) params.append('semester', semester);
      if (offerStatus) params.append('offer_letter_status', offerStatus);
      if (certStatus) params.append('certificate_status', certStatus);

      const res = await fetch(`/api/interns?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load interns list');
      const data = await res.json();
      setInterns(data);
    } catch (error: any) {
      toast.error(error.message || 'Error fetching interns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search slightly
    const timer = setTimeout(() => {
      fetchInterns();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, domain, semester, offerStatus, certStatus]);

  // Export to CSV
  const handleExport = () => {
    if (interns.length === 0) {
      toast.error('No interns available to export.');
      return;
    }

    const headers = [
      'Registration Number',
      'Name',
      'Email',
      'Whatsapp',
      'Gender',
      'University',
      'Semester',
      'Domain',
      'Skill Level',
      'Available Hours/wk',
      'Offer Letter',
      'Certificate',
      'Exp Certificate',
      'Rec Letter'
    ];

    const rows = interns.map(item => [
      item.registration_number,
      item.full_name,
      item.email,
      item.whatsapp || '',
      item.gender || '',
      item.university || '',
      item.semester || '',
      item.domain,
      item.skill_level || '',
      item.available_hours || '',
      item.intern_documents?.offer_letter_generated ? 'Generated' : 'Pending',
      item.intern_documents?.certificate_generated ? 'Generated' : 'Pending',
      item.intern_documents?.experience_certificate_generated ? 'Generated' : 'Pending',
      item.intern_documents?.recommendation_letter_generated ? 'Generated' : 'Pending'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CloudExify_Interns_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Grid data exported successfully to CSV!');
  };

  const domainOptions = [
    'Python Programming',
    'C++ Programming',
    'Java Programming',
    'Data Science & AI Basics',
    'Cybersecurity Fundamentals',
    'Full Stack Development'
  ];

  return (
    <PageWrapper
      title="Interns Registry"
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="flex items-center space-x-1.5 font-semibold text-slate-700 bg-white"
        >
          <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
          <span>Export CSV</span>
        </Button>
      }
    >
      {/* Search and Filters grid */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4.5 w-4.5" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, reg no..."
              className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Domain Filter */}
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
          >
            <option value="">All Domains</option>
            {domainOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>

          {/* Semester Filter */}
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
          >
            <option value="">All Semesters</option>
            {[4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-50 pt-4">
          {/* Offer Letter Filter */}
          <select
            value={offerStatus}
            onChange={(e) => setOfferStatus(e.target.value)}
            className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
          >
            <option value="">Offer Letter (All)</option>
            <option value="generated">Generated</option>
            <option value="pending">Pending</option>
          </select>

          {/* Certificate Filter */}
          <select
            value={certStatus}
            onChange={(e) => setCertStatus(e.target.value)}
            className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
          >
            <option value="">Completion Certificate (All)</option>
            <option value="generated">Generated</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Interns Table Grid */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={8} cols={9} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Reg No</th>
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Domain</th>
                  <th className="px-6 py-3.5 text-center">Semester</th>
                  <th className="px-6 py-3.5">Offer Letter</th>
                  <th className="px-6 py-3.5">Certificate</th>
                  <th className="px-6 py-3.5">Rec Letter</th>
                  <th className="px-6 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
                {interns.map((intern) => (
                  <tr key={intern.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{intern.registration_number}</td>
                    <td className="px-6 py-4 text-slate-950 font-semibold">{intern.full_name}</td>
                    <td className="px-6 py-4 truncate max-w-[150px]">{intern.email}</td>
                    <td className="px-6 py-4 truncate max-w-[130px]">{intern.domain}</td>
                    <td className="px-6 py-4 text-center">{intern.semester || '-'}</td>
                    
                    {/* Offer Letter status */}
                    <td className="px-6 py-4">
                      <Badge variant={intern.intern_documents?.offer_letter_generated ? 'success' : 'danger'}>
                        {intern.intern_documents?.offer_letter_generated ? 'Generated' : 'Pending'}
                      </Badge>
                    </td>

                    {/* Certificate status */}
                    <td className="px-6 py-4">
                      <Badge variant={intern.intern_documents?.certificate_generated ? 'success' : 'danger'}>
                        {intern.intern_documents?.certificate_generated ? 'Generated' : 'Pending'}
                      </Badge>
                    </td>

                    {/* Rec Letter status */}
                    <td className="px-6 py-4">
                      <Badge variant={intern.intern_documents?.recommendation_letter_generated ? 'success' : 'danger'}>
                        {intern.intern_documents?.recommendation_letter_generated ? 'Generated' : 'Pending'}
                      </Badge>
                    </td>

                    {/* Actions button */}
                    <td className="px-6 py-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/interns/${intern.id}`)}
                        className="text-blue-600 hover:bg-blue-50/50 py-1 px-2.5 rounded-lg h-7 font-bold text-xs"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Profile
                      </Button>
                    </td>
                  </tr>
                ))}

                {interns.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                      No interns match the current filters.
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
