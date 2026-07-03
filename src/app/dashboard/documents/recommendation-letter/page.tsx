'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Download, Calendar, ShieldCheck, UserCheck, MessageSquare } from 'lucide-react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

function RecommendationLetterGenerator() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlInternId = searchParams.get('internId');

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedIntern, setSelectedIntern] = useState<any>(null);
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0]);
  const [customText, setCustomText] = useState(
    'During the internship, they exhibited exceptional leadership skills and built a robust serverless database connector that optimized API load speeds by 30%.'
  );
  const [adminEmail, setAdminEmail] = useState('');
  const [allAdmins, setAllAdmins] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [previewRlId, setPreviewRlId] = useState('');
  const [companyLogoUrl, setCompanyLogoUrl] = useState('');
  const [companyName, setCompanyName] = useState('CloudExify');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setAllAdmins(data.allSignatures || []);
          if (data.adminSignature?.email) {
            setAdminEmail(data.adminSignature.email);
          } else if (data.allSignatures?.length > 0) {
            setAdminEmail(data.allSignatures[0].email);
          }
          if (data.companySettings) {
            setCompanyLogoUrl(data.companySettings.company_logo_url || '');
            setCompanyName(data.companySettings.company_name || 'CloudExify');
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (urlInternId) {
      const fetchIntern = async () => {
        try {
          const res = await fetch(`/api/interns/${urlInternId}`);
          if (!res.ok) throw new Error('Intern not found');
          const data = await res.json();
          setSelectedIntern(data);
          setSearchQuery(data.full_name);
        } catch (err: any) {
          toast.error(err.message || 'Error loading pre-selected intern');
        }
      };
      fetchIntern();
    }
  }, [urlInternId]);

  // Generate random preview recommendation letter number
  useEffect(() => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const year = new Date().getFullYear();
    setPreviewRlId(`CX-RL-${year}-${randomNum}`);
  }, [selectedIntern]);

  const handleSearch = async (val: string) => {
    setSearchQuery(val);
    if (val.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/interns?search=${val}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectIntern = (intern: any) => {
    setSelectedIntern(intern);
    setSearchQuery(intern.full_name);
    setSearchResults([]);
  };

  const handleGenerate = async () => {
    if (!selectedIntern) {
      toast.error('Please select an intern.');
      return;
    }
    if (!adminEmail) {
      toast.error('Please select a signer.');
      return;
    }

    setIsGenerating(true);
    const renderToast = toast.loading('Generating Letter...');

    try {
      const params = new URLSearchParams({
        internId: selectedIntern.id,
        completionDate,
        adminEmail,
        customText
      });
      const endpoint = `/api/documents/recommendation-letter?${params.toString()}`;

      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Generation failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Recommendation_Letter_${selectedIntern.registration_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Recommendation Letter downloaded successfully!', { id: renderToast });
    } catch (err: any) {
      toast.error(err.message || 'Error generating Letter', { id: renderToast });
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedSignatory = allAdmins.find(a => a.email === adminEmail) || {
    full_name: 'Authorized Signatory',
    signature_url: null
  };

  return (
    <PageWrapper title="Recommendation Letter Generator">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form */}
        <Card className="lg:col-span-5 space-y-6 border border-slate-100">
          <div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">1. Select Intern</h2>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4.5 w-4.5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search intern..."
                className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
              {isSearching && (
                <div className="absolute right-3 top-2.5">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
                </div>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="absolute z-20 w-[90%] md:w-[35%] bg-white border border-slate-100 rounded-lg mt-1 shadow-lg max-h-52 overflow-y-auto divide-y divide-slate-50">
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => selectIntern(item)}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-slate-900 font-bold">{item.full_name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{item.domain}</p>
                    </div>
                    <Badge variant="blue">{item.registration_number}</Badge>
                  </button>
                ))}
              </div>
            )}

            {selectedIntern && (
              <div className="mt-3.5 bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 text-xs text-blue-800 space-y-1">
                <p className="font-bold flex items-center">
                  <UserCheck className="h-4 w-4 mr-1.5 text-blue-600" />
                  Selected: {selectedIntern.full_name}
                </p>
                <p className="text-slate-500 font-semibold">{selectedIntern.domain}</p>
                <p className="text-slate-400 font-medium">Reg: {selectedIntern.registration_number}</p>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">2. Evaluation Parameters</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  Reference Letter Date
                </label>
                <input
                  type="date"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center">
                  <MessageSquare className="h-3.5 w-3.5 mr-1" />
                  Custom Commendation Text
                </label>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  rows={4}
                  className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white placeholder-slate-400"
                  placeholder="Detail custom positive accomplishments or key skills demonstrated..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                  Authorized Signer
                </label>
                <select
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Select Signatory...</option>
                  {allAdmins.map((adm) => (
                    <option key={adm.email} value={adm.email}>
                      {adm.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={handleGenerate}
            isLoading={isGenerating}
            disabled={!selectedIntern || !adminEmail}
            className="w-full py-2.5 font-bold shadow-lg shadow-blue-200"
          >
            <Download className="h-4 w-4 mr-2" />
            Generate Recommendation
          </Button>
        </Card>

        {/* Right Preview */}
        <div className="lg:col-span-7 space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Live Letter Preview</p>
          <div className="bg-white border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.03)] rounded-2xl p-10 min-h-[640px] text-[10px] text-slate-600 leading-relaxed font-sans relative aspect-[1/1.41] select-none text-slate-700">
            {/* Logo header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-5 mb-8">
              <div>
                {companyLogoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={companyLogoUrl} className="h-8 object-contain mb-1" alt="logo" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src="/logo.png" 
                    className="h-8 object-contain mb-1" 
                    alt="logo" 
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const textLogo = document.getElementById('preview-rl-text-logo');
                      if (textLogo) textLogo.style.display = 'block';
                    }}
                  />
                )}
                <p id="preview-rl-text-logo" className="text-xl font-bold tracking-tight text-blue-600" style={{ display: 'none' }}>
                  {companyName}.
                </p>
              </div>
              <div className="text-right text-[7px] text-slate-400">
                <p className="font-bold text-slate-700">{companyName}</p>
                <p>Islamabad, Pakistan</p>
                <p>https://cloudexify.site | hello@cloudexify.site</p>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-center text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">
              Letter of Recommendation
            </h3>

            {/* Recipient */}
            <p className="mb-4 text-slate-500 font-semibold">Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="mb-6 font-bold text-slate-900 text-xs">To Whom It May Concern,</p>

            {/* Body */}
            <div className="space-y-4 text-justify text-slate-700">
              <p>
                It is a pleasure to write this letter of recommendation for <span className="font-bold text-slate-900">{selectedIntern ? selectedIntern.full_name : '[Intern Name]'}</span>, who completed a 2-month internship as a <span className="font-bold text-slate-900">{selectedIntern ? selectedIntern.domain : '[Domain]'} Intern</span> at CloudExify.
              </p>
              <p>
                During the course of the internship, {selectedIntern ? selectedIntern.full_name : 'the intern'} worked on engineering tasks under the supervision of senior developers. They consistently proved to be motivated, proactive, and committed to coding standards.
              </p>
              <p>
                {customText}
              </p>
              <p>
                {selectedIntern ? selectedIntern.full_name : 'The intern'} has also demonstrated good communication capabilities and collaborative spirit, integrating well with the remote developer community. We have no doubt they will be an asset to any software engineering group they join.
              </p>
              <p>
                Therefore, we recommend them for future software development roles or academic programs and wish them success.
              </p>
            </div>

            {/* Signatures */}
            <div className="mt-12 w-[35%] text-left">
              {selectedSignatory.signature_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selectedSignatory.signature_url} className="h-10 object-contain mb-1.5 opacity-90" alt="signature" />
              ) : (
                <div className="h-10" />
              )}
              <div className="border-t border-slate-300 pt-1.5">
                <p className="font-bold text-slate-900">{selectedSignatory.full_name}</p>
                <p className="text-[7.5px] text-slate-400">{selectedSignatory.designation || 'Managing Director / Founder'}</p>
                <p className="text-[7.5px] text-slate-400">{companyName}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-10 left-10 right-10 flex justify-between border-t border-slate-50 pt-2 text-[6.5px] text-slate-400">
              <p>{companyName} Software Development</p>
              <p>ID: {previewRlId}</p>
            </div>

            {/* Verification Footer Text */}
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[5.5px] text-[#9ab3d0] text-center w-max">
              This document can be verified at admin.cloudexify.site/verify/{previewRlId}
            </p>

            {/* QR Code representation */}
            <div className="absolute bottom-12 right-10 flex flex-col items-center">
              <div className="w-8 h-8 bg-slate-100 border border-slate-200 flex items-center justify-center mb-0.5">
                <span className="text-[4px] text-slate-400 font-bold">QR CODE</span>
              </div>
              <p className="text-[4px] text-blue-600 font-bold uppercase tracking-wider">Scan to Verify</p>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default function RecommendationLetterPage() {
  return (
    <Suspense fallback={
      <PageWrapper title="Recommendation Letter Generator">
        <div className="animate-pulse flex items-center justify-center min-h-[300px] text-slate-400">
          Loading Recommendation Letter Generator...
        </div>
      </PageWrapper>
    }>
      <RecommendationLetterGenerator />
    </Suspense>
  );
}
