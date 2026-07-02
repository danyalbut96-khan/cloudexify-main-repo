'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, FileText, Download, UserCheck, Calendar, ShieldCheck } from 'lucide-react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

function OfferLetterGenerator() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Params
  const urlInternId = searchParams.get('internId');

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedIntern, setSelectedIntern] = useState<any>(null);
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [adminEmail, setAdminEmail] = useState('');
  const [allAdmins, setAllAdmins] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch all admins for dropdown signature slots
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
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();
  }, []);

  // Fetch intern if provided in URL
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

  // Handle intern search
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

  // Generate and Download PDF
  const handleGenerate = async () => {
    if (!selectedIntern) {
      toast.error('Please select an intern first.');
      return;
    }
    if (!adminEmail) {
      toast.error('Please select an authorized admin to sign.');
      return;
    }

    setIsGenerating(true);
    const renderToast = toast.loading('Generating PDF on server...');

    try {
      const endpoint = `/api/documents/offer-letter?internId=${selectedIntern.id}&joiningDate=${joiningDate}&adminEmail=${adminEmail}`;
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Generation failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Offer_Letter_${selectedIntern.registration_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Offer Letter PDF downloaded successfully!', { id: renderToast });
    } catch (err: any) {
      toast.error(err.message || 'Error generating PDF', { id: renderToast });
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedSignatory = allAdmins.find(a => a.email === adminEmail) || {
    full_name: 'Authorized Signatory',
    signature_url: null
  };

  return (
    <PageWrapper title="Offer Letter Generator">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Controls Card */}
        <Card className="lg:col-span-5 space-y-6 border border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">1. Select Intern</h2>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4.5 w-4.5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search intern by name or reg no..."
                className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
              {isSearching && (
                <div className="absolute right-3 top-2.5">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
                </div>
              )}
            </div>

            {/* Search results dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute z-20 w-[90%] md:w-[35%] bg-white border border-slate-100 rounded-lg mt-1 shadow-lg max-h-56 overflow-y-auto divide-y divide-slate-50">
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
                <p className="text-slate-400 font-medium">Reg: {selectedIntern.registration_number} | {selectedIntern.email}</p>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">2. Internship Details</h2>
            <div className="space-y-4">
              {/* Start Date */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  Internship Start Date
                </label>
                <input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>

              {/* Authorized Signatory */}
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
                      {adm.full_name} ({adm.email.split('@')[0]})
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
            Generate & Download PDF
          </Button>
        </Card>

        {/* Right Side: High Fidelity CSS Real-time Preview */}
        <div className="lg:col-span-7 space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Live Document Preview</p>
          <div className="bg-white border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.03)] rounded-2xl p-10 min-h-[640px] text-[10px] text-slate-600 leading-relaxed font-sans relative aspect-[1/1.41] select-none text-slate-700">
            {/* Letterhead Logo Header */}
            <div className="flex justify-between items-start mb-10">
              <div>
                <p className="text-xl font-bold tracking-tight text-blue-600">CloudExify.</p>
              </div>
              <div className="text-right text-[8px] text-slate-500 max-w-[50%]">
                <p className="font-bold text-slate-900 text-[9px] mb-0.5">CloudExify</p>
                <p>Plot 45-C, 24th Commercial St, Karachi</p>
                <p>cloudexify.com | admin@cloudexify.com</p>
              </div>
            </div>

            {/* Document Title */}
            <h3 className="text-center text-sm font-bold text-slate-900 uppercase tracking-[0.2em] mb-7">
              INTERNSHIP OFFER LETTER
            </h3>

            {/* Recipient meta */}
            <p className="mb-4 text-slate-600">Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <div className="mb-5 space-y-0.5 text-slate-700">
              <p className="font-bold text-slate-900 text-[11px]">[{selectedIntern ? selectedIntern.full_name : 'Intern Name'}]</p>
              <p className="text-[10px] text-slate-600">{selectedIntern && selectedIntern.city ? selectedIntern.city : 'Karachi, Pakistan'}</p>
            </div>

            {/* Letter Body */}
            <div className="space-y-3.5 text-justify text-[10px]">
              <p>Dear [{selectedIntern ? selectedIntern.full_name : 'Intern'}],</p>
              <p>
                We are pleased to offer you an internship position as a <span className="font-bold text-slate-900">[{selectedIntern ? selectedIntern.domain : 'Domain'}] Intern</span> at CloudExify. We were highly impressed by your academic record and technical skill level.
              </p>
              <p>
                This internship is designed to give you hands-on experience in software development and industry best practices. Below are the key details and terms of your internship:
              </p>

              {/* Table details mockup */}
              <div className="border border-slate-200 rounded-md overflow-hidden my-4">
                <div className="bg-blue-500 px-3 py-2">
                  <p className="text-white text-[10px] font-bold uppercase tracking-wider">INTERNSHIP DETAILS</p>
                </div>
                <div className="flex px-3 py-2 bg-slate-50 border-b border-slate-200">
                  <span className="w-[30%] font-bold text-blue-600 text-[9px]">Program</span>
                  <span className="w-[70%] text-[9px] text-slate-700">{selectedIntern ? selectedIntern.domain : 'Domain'} Internship Program 2026</span>
                </div>
                <div className="flex px-3 py-2 border-b border-slate-200">
                  <span className="w-[30%] font-bold text-blue-600 text-[9px]">Duration</span>
                  <span className="w-[70%] text-[9px] text-slate-700"><span className="font-bold text-slate-900">{formatDate(joiningDate)}</span> to <span className="font-bold text-slate-900">End Date</span> (2 Months)</span>
                </div>
                <div className="flex px-3 py-2 bg-slate-50 border-b border-slate-200">
                  <span className="w-[30%] font-bold text-blue-600 text-[9px]">Mode</span>
                  <span className="w-[70%] text-[9px] text-slate-700">Remote</span>
                </div>
                <div className="flex px-3 py-2 border-b border-slate-200">
                  <span className="w-[30%] font-bold text-blue-600 text-[9px]">Projects</span>
                  <span className="w-[70%] text-[9px] text-slate-700">4 real world projects</span>
                </div>
                <div className="flex px-3 py-2 bg-slate-50 border-b border-slate-200">
                  <span className="w-[30%] font-bold text-blue-600 text-[9px]">Compensation</span>
                  <span className="w-[70%] text-[9px] text-slate-700">Unpaid — Certificate + Experience</span>
                </div>
                <div className="flex items-center px-3 py-2">
                  <span className="w-[30%] font-bold text-blue-600 text-[9px]">Reg. No</span>
                  <span className="text-[9px] font-bold text-blue-600 border border-blue-200 bg-blue-50 px-1.5 py-0.5 rounded">[{selectedIntern ? selectedIntern.registration_number : 'CX-XXXX'}]</span>
                </div>
              </div>

              {/* Terms Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-md p-3 mb-4">
                <p className="font-bold text-slate-900 text-[10px] mb-2">TERMS & CONDITIONS</p>
                <ul className="space-y-1 pl-2 text-[9px] text-slate-600 list-disc list-outside ml-2">
                  <li>This internship is unpaid and remote-based.</li>
                  <li>Intern must complete all 4 assigned projects to receive certificate.</li>
                  <li>CloudExify reserves the right to terminate internship for misconduct.</li>
                  <li>By accepting this offer, intern agrees to CloudExify&apos;s code of conduct and policies.</li>
                </ul>
              </div>

              {/* Acceptance Paragraph */}
              <p className="italic text-slate-500 mb-6 text-[9.5px]">
                By accepting this offer letter, you confirm your commitment to the CloudExify Summer Internship Program 2026 and agree to abide by all terms and conditions stated herein.
              </p>
            </div>

            <p className="mb-8">Sincerely,</p>

            {/* Signature mockup */}
            <div className="flex justify-between mt-2">
              <div className="w-[45%]">
                {selectedSignatory.signature_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedSignatory.signature_url} className="h-10 object-contain mb-1" alt="signature" />
                ) : (
                  <div className="h-11" />
                )}
                <div className="border-t border-slate-300 pt-1.5">
                  <p className="font-bold text-slate-900 text-[10px] mb-0.5">{selectedSignatory.full_name}</p>
                  <p className="text-[8px] text-slate-500 mb-0.5">{selectedSignatory.designation || 'Founder & CEO'}</p>
                  <p className="text-[8px] text-blue-600">CloudExify 🌐 ✍️</p>
                </div>
              </div>

              <div className="w-[45%]">
                <div className="h-11" />
                <div className="border-t border-slate-300 pt-1.5">
                  <p className="text-[8px] text-slate-500 mb-0.5">Intern Signature</p>
                  <p className="font-bold text-slate-900 text-[10px] mb-0.5">[{selectedIntern ? selectedIntern.full_name : 'Intern Name'}]</p>
                  <p className="text-[8px] text-slate-500">Date: ____________________</p>
                </div>
              </div>
            </div>

            {/* Footer Mockup */}
            <div className="absolute bottom-6 left-10 right-10 flex justify-between border-t-2 border-blue-500 pt-2.5">
              <div className="w-[75%] text-[8px] space-y-1">
                <p className="font-bold text-slate-900">cloudexify.com | admin@cloudexify.com</p>
                <p className="text-slate-500">WhatsApp: +92 3XX XXXXXXX</p>
                <p className="text-blue-600">Verify: offerletter.cloudexify.site/verify</p>
                <p className="font-bold text-slate-900">Document ID: CX-OL-2026-XXXX</p>
                <p className="text-slate-500">© 2026 CloudExify. All rights reserved.</p>
              </div>
              <div className="w-[25%] flex flex-col items-end justify-start pt-1">
                <div className="w-12 h-12 bg-slate-200 border border-slate-300 flex items-center justify-center mb-1">
                  <span className="text-[6px] text-slate-400 font-bold">QR CODE</span>
                </div>
                <p className="text-[6px] text-blue-600 font-bold tracking-widest uppercase">SCAN TO VERIFY</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default function OfferLetterPage() {
  return (
    <Suspense fallback={
      <PageWrapper title="Offer Letter Generator">
        <div className="animate-pulse flex items-center justify-center min-h-[300px] text-slate-400">
          Loading Offer Letter Generator...
        </div>
      </PageWrapper>
    }>
      <OfferLetterGenerator />
    </Suspense>
  );
}
