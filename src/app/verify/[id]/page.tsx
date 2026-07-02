import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Card } from '@/components/ui/Card';
import { CheckCircle, XCircle, FileText, Calendar, User, Briefcase, Globe } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Image from 'next/image';

// Format the document type enum beautifully
const formatDocType = (type: string) => {
  switch (type) {
    case 'offer_letter': return 'Internship Offer Letter';
    case 'certificate': return 'Internship Completion Certificate';
    case 'experience_certificate': return 'Experience Certificate';
    case 'recommendation_letter': return 'Recommendation Letter';
    default: return type.replace(/_/g, ' ').toUpperCase();
  }
};

export default async function VerifyDocumentPage({ params }: { params: { id: string } }) {
  const documentId = params.id;
  const supabase = createClient(); // Server client can still query public data or via service role if RLS is bypassed, but here we expect public read access or service role

  // Fetch the verification record
  // We use the base client with service role key if RLS blocks public, OR we expect the policy to allow public reads
  // Let's use getAdminClient here to guarantee it can read the verification record without auth
  const { getAdminClient } = await import('@/lib/supabase/server');
  const adminClient = getAdminClient();
  
  const { data: verifyRecord, error: verifyError } = await adminClient
    .from('document_verifications')
    .select('*')
    .eq('document_number', documentId)
    .single();

  const { data: companySettings } = await adminClient
    .from('company_settings')
    .select('*')
    .eq('id', 1)
    .single();

  const isVerified = !!verifyRecord && !verifyError;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      
      {/* Brand Header */}
      <div className="mb-8 text-center">
        {companySettings?.company_logo_url ? (
          <img 
            src={companySettings.company_logo_url} 
            alt="CloudExify Logo" 
            className="h-12 mx-auto object-contain"
          />
        ) : (
          <h1 className="text-2xl font-black text-blue-600 tracking-tight">CloudExify.</h1>
        )}
      </div>

      <div className="w-full max-w-md">
        {isVerified ? (
          <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden">
            {/* Success Banner */}
            <div className="bg-emerald-500 p-6 text-center text-white">
              <CheckCircle className="h-16 w-16 mx-auto mb-3" />
              <h2 className="text-xl font-bold">Document Verified</h2>
              <p className="text-emerald-100 text-sm mt-1">This is an authentic CloudExify document</p>
            </div>

            {/* Document Details */}
            <div className="p-6 space-y-5">
              
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-slate-100 rounded-lg shrink-0">
                  <FileText className="h-5 w-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Document Type</p>
                  <p className="text-sm font-semibold text-slate-800">{formatDocType(verifyRecord.document_type)}</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-mono">ID: {verifyRecord.document_number}</p>
                </div>
              </div>

              <div className="h-px bg-slate-100 w-full" />

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                  <User className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Issued To</p>
                  <p className="text-sm font-bold text-slate-900">{verifyRecord.intern_name}</p>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center">
                    <Briefcase className="h-3 w-3 mr-1 inline" />
                    {verifyRecord.intern_domain} Intern
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-amber-50 rounded-lg shrink-0">
                  <Calendar className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Date of Issue</p>
                  <p className="text-sm font-medium text-slate-800">
                    {formatDate(verifyRecord.generated_at)}
                  </p>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-rose-100 overflow-hidden text-center">
            <div className="bg-rose-500 p-8 text-white">
              <XCircle className="h-16 w-16 mx-auto mb-3" />
              <h2 className="text-xl font-bold">Verification Failed</h2>
            </div>
            <div className="p-8">
              <p className="text-slate-600 mb-6 font-medium">
                We could not find a valid document matching this ID. The document may be forged, modified, or does not exist in our registry.
              </p>
              <div className="inline-block bg-slate-100 px-4 py-2 rounded-lg font-mono text-sm text-slate-500 font-bold border border-slate-200">
                ID: {documentId}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-400">
          <p className="flex items-center justify-center mb-1">
            <Globe className="h-3.5 w-3.5 mr-1.5" />
            Generated by CloudExify Authentication System
          </p>
          <a 
            href={companySettings?.company_website ? (companySettings.company_website.startsWith('http') ? companySettings.company_website : `https://${companySettings.company_website}`) : 'https://cloudexify.com'} 
            className="text-blue-500 hover:underline font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            {companySettings?.company_website || 'cloudexify.com'}
          </a>
        </div>
      </div>
      
    </div>
  );
}
