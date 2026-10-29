'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  Layers,
  Sparkles,
  FileText,
  Download,
  AlertCircle,
  Clock,
  UserCheck
} from 'lucide-react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function InternProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [intern, setIntern] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchInternDetails = async () => {
    try {
      const res = await fetch(`/api/interns/${params.id}`);
      if (!res.ok) throw new Error('Intern not found');
      const data = await res.json();
      setIntern(data);
    } catch (error: any) {
      toast.error(error.message || 'Error fetching intern details');
      router.push('/dashboard/interns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleDownload = async (docType: string) => {
    const downloadToast = toast.loading(`Downloading ${docType.replace('-', ' ')}...`);
    try {
      // Determine file name
      let endpoint = `/api/documents/${docType}?internId=${intern.id}`;
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Failed to generate/fetch document PDF`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${docType.replace('-', '_')}_${intern.registration_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Document downloaded successfully!', { id: downloadToast });
      
      // Refresh profile history
      fetchInternDetails();
    } catch (err: any) {
      toast.error(err.message || 'Download failed', { id: downloadToast });
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <Skeleton className="h-10 w-24" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-1" />
          <Skeleton className="h-96 lg:col-span-2" />
        </div>
      </PageWrapper>
    );
  }

  const docs = intern?.intern_documents || {};

  const documentItems = [
    {
      name: 'Internship Offer Letter',
      type: 'offer-letter',
      generated: docs.offer_letter_generated,
      date: docs.offer_letter_date,
    },
    {
      name: 'Completion Certificate',
      type: 'certificate',
      generated: docs.certificate_generated,
      date: docs.certificate_date,
    },
    {
      name: 'Experience Certificate',
      type: 'experience-certificate',
      generated: docs.experience_certificate_generated,
      date: docs.experience_certificate_date,
    },
    {
      name: 'Recommendation Letter',
      type: 'recommendation-letter',
      generated: docs.recommendation_letter_generated,
      date: docs.recommendation_letter_date,
    },
  ];

  return (
    <PageWrapper
      title={`${intern.full_name}'s Profile`}
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/dashboard/interns')}
          className="flex items-center space-x-1 font-semibold text-slate-700 bg-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Registry</span>
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Profile Card */}
        <Card className="lg:col-span-1 border border-slate-100 flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-2xl uppercase border-2 border-blue-200">
            {intern.full_name.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-4 leading-snug">{intern.full_name}</h2>
          <Badge variant="blue" className="mt-1">{intern.registration_number}</Badge>
          
          <div className="w-full border-t border-slate-50 mt-6 pt-5 text-left space-y-4 text-xs font-medium text-slate-500">
            <div className="flex items-center space-x-2.5">
              <Layers className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Domain</p>
                <p className="text-slate-800 font-semibold">{intern.domain}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <Mail className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Email Address</p>
                <p className="text-slate-800 font-semibold select-all">{intern.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <Phone className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Whatsapp</p>
                <p className="text-slate-800 font-semibold">{intern.whatsapp || '-'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <GraduationCap className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">University / Semester</p>
                <p className="text-slate-800 font-semibold">
                  {intern.university || '-'} (Sem {intern.semester || '-'})
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <Sparkles className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Skill Level</p>
                <p className="text-slate-800 font-semibold">{intern.skill_level || 'Intermediate'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <Clock className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Weekly Available Hours</p>
                <p className="text-slate-800 font-semibold">{intern.available_hours ? `${intern.available_hours} hours/week` : '-'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <UserCheck className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Referral Source</p>
                <p className="text-slate-800 font-semibold">{intern.referral_source || '-'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <Calendar className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Profile Created At</p>
                <p className="text-slate-800 font-semibold">{formatDate(intern.created_at)}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Document Issuance History */}
        <Card className="lg:col-span-2 border border-slate-100">
          <h3 className="text-base font-bold text-slate-900 mb-5 border-b border-slate-100 pb-3 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-slate-400" />
            Document Issuance History
          </h3>

          <div className="space-y-4">
            {documentItems.map((doc, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between border border-slate-100 hover:border-slate-200 rounded-xl p-4 bg-slate-50/30 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="h-9 w-9 rounded-lg bg-white border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center justify-center text-slate-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 leading-snug">{doc.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={doc.generated ? 'success' : 'danger'}>
                        {doc.generated ? 'Generated' : 'Pending'}
                      </Badge>
                      {doc.generated && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          Generated on: {formatDate(doc.date)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 mt-3 sm:mt-0 pl-12 sm:pl-0">
                  {doc.generated ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(doc.type)}
                        className="flex items-center space-x-1 font-semibold text-slate-700 bg-white"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download PDF</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/documents/${doc.type}?internId=${intern.id}`)}
                        className="text-blue-600 hover:bg-blue-50/50 py-1.5 px-3 rounded-lg font-semibold text-xs"
                      >
                        Regenerate
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => router.push(`/dashboard/documents/${doc.type}?internId=${intern.id}`)}
                      className="flex items-center space-x-1.5 py-1.5 px-3.5 text-xs font-semibold"
                    >
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>Issue Document</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageWrapper>
  );
}
