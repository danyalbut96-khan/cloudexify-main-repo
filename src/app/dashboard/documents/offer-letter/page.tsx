'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, FileText, Download, UserCheck, Calendar, ShieldCheck, Zap, Users } from 'lucide-react';
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
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [companyLogoUrl, setCompanyLogoUrl] = useState('');
  const [companyName, setCompanyName] = useState('CloudExify');
  const [companyAddress, setCompanyAddress] = useState('Islamabad, Pakistan');
  const [companyWebsite, setCompanyWebsite] = useState('cloudexify.site');
  const [companyEmail, setCompanyEmail] = useState('hello@cloudexify.site');
  const [companyPhone, setCompanyPhone] = useState('+92 341 1949277');
  const [previewDocId, setPreviewDocId] = useState('');

  // Bulk Generation State
  const [pendingInterns, setPendingInterns] = useState<any[]>([]);
  const [isFetchingPending, setIsFetchingPending] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);

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
          if (data.companySettings) {
            setCompanyLogoUrl(data.companySettings.company_logo_url || '');
            setCompanyName(data.companySettings.company_name || 'CloudExify');
            setCompanyAddress(data.companySettings.company_address || 'Islamabad, Pakistan');
            setCompanyWebsite(data.companySettings.company_website || 'cloudexify.site');
            setCompanyEmail(data.companySettings.company_email || 'hello@cloudexify.site');
            setCompanyPhone(data.companySettings.company_phone || '+92 341 1949277');
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();

    const fetchBatches = async () => {
      try {
        const res = await fetch('/api/batches');
        if (res.ok) {
          const data = await res.json();
          setBatches(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchBatches();
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

  // Generate random preview document number
  useEffect(() => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const year = new Date().getFullYear();
    setPreviewDocId(`CX-OL-${year}-${randomNum}`);
  }, [selectedIntern]);

  // Handle intern search
  const handleSearch = async (val: string) => {
    setSearchQuery(val);
    if (val.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      let endpoint = `/api/interns?search=${val}`;
      if (selectedBatchId) endpoint += `&batchId=${selectedBatchId}`;
      
      const res = await fetch(endpoint);
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

  const fetchPendingInterns = async () => {
    setIsFetchingPending(true);
    try {
      let endpoint = '/api/interns?limit=5000';
      if (selectedBatchId) endpoint += `&batchId=${selectedBatchId}`;
      
      const res = await fetch(endpoint); // Fetch a large batch
      if (res.ok) {
        const data = await res.json();
        const pending = data.filter((i: any) => !i.intern_documents?.offer_letter_generated);
        setPendingInterns(pending);
        if (pending.length > 0) {
          toast.success(`Found ${pending.length} interns pending offer letters.`);
        } else {
          toast.success('All interns already have offer letters!');
        }
      }
    } catch (err) {
      toast.error('Failed to fetch pending interns');
    } finally {
      setIsFetchingPending(false);
    }
  };

  const handleBulkGenerate = async () => {
    if (pendingInterns.length === 0) return toast.error('No pending interns found. Fetch them first.');
    if (!adminEmail) return toast.error('Please select an authorized admin to sign.');

    setIsBulkGenerating(true);
    setBulkProgress({ current: 0, total: pendingInterns.length });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < pendingInterns.length; i++) {
      const intern = pendingInterns[i];
      try {
        const res = await fetch('/api/documents/offer-letter/store', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            internId: intern.id,
            joiningDate,
            adminEmail
          })
        });

        if (res.ok) {
          successCount++;
        } else {
          failCount++;
          console.error(`Failed for ${intern.full_name}`);
        }
      } catch (err) {
        failCount++;
      }
      setBulkProgress({ current: i + 1, total: pendingInterns.length });
    }

    setIsBulkGenerating(false);
    toast.success(`Bulk generation complete! Success: ${successCount}, Failed: ${failCount}`);
    setPendingInterns([]);
  };

  return (
    <PageWrapper title="Offer Letter Generator">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Controls Card */}
        <Card className="lg:col-span-5 space-y-6 border border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">1. Select Batch (Optional)</h2>
            <select
              value={selectedBatchId}
              onChange={(e) => {
                const batchId = e.target.value;
                setSelectedBatchId(batchId);
                setSearchQuery('');
                setSearchResults([]);

                const batch = batches.find((b: any) => b.id === batchId);
                if (batch && batch.start_date) {
                  setJoiningDate(batch.start_date.split('T')[0]);
                }
              }}
              className="block w-full px-3 py-2 mb-4 text-sm border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="">All Batches</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.status})
                </option>
              ))}
            </select>

            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">2. Select Intern</h2>
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
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">3. Internship Details</h2>
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
            disabled={!selectedIntern || !adminEmail || isBulkGenerating}
            className="w-full py-2.5 font-bold shadow-lg shadow-blue-200"
          >
            <Download className="h-4 w-4 mr-2" />
            Generate & Download PDF
          </Button>
        </Card>

        {/* Bulk Actions Card */}
        <Card className="lg:col-span-5 space-y-5 border border-purple-100 bg-gradient-to-br from-purple-50/50 to-white mt-0">
          <div>
            <h2 className="text-sm font-bold text-purple-900 uppercase tracking-wider mb-2 flex items-center">
              <Zap className="h-4 w-4 mr-1.5 text-purple-600" />
              Bulk Generation
            </h2>
            <p className="text-[10px] text-slate-500 mb-4 leading-relaxed">
              Generate and automatically save offer letter PDFs for ALL pending interns directly to Supabase storage.
            </p>

            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={fetchPendingInterns}
                isLoading={isFetchingPending}
                disabled={isBulkGenerating}
                className="w-full text-xs py-2 border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Users className="h-3.5 w-3.5 mr-2" />
                Find Pending Interns ({pendingInterns.length})
              </Button>

              {pendingInterns.length > 0 && (
                <div className="bg-white border border-purple-100 rounded-xl p-4 shadow-sm space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">Ready to Process:</span>
                    <Badge variant="blue">{pendingInterns.length} Interns</Badge>
                  </div>
                  
                  {isBulkGenerating && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500">
                        <span>Processing...</span>
                        <span>{bulkProgress.current} / {bulkProgress.total}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleBulkGenerate}
                    disabled={isBulkGenerating || !adminEmail}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200 text-xs font-bold"
                  >
                    {isBulkGenerating ? (
                      <span className="flex items-center">Generating... Please wait...</span>
                    ) : (
                      <span className="flex items-center"><Zap className="h-3.5 w-3.5 mr-2" /> Generate All to Storage</span>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-6">
        {/* Right Side: High Fidelity CSS Real-time Preview */}
        <div className="lg:col-span-12 space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Live Document Preview</p>
          <div className="bg-white border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.03)] rounded-2xl p-10 min-h-[640px] text-[10px] text-slate-600 leading-relaxed font-sans relative aspect-[1/1.41] select-none text-slate-700">
            {/* Letterhead Logo Header */}
            <div className="flex justify-between items-start mb-10">
              <div>
                <p className="text-xl font-bold tracking-tight text-blue-600">CloudExify.</p>
              </div>
              <div className="text-right text-[8px] text-slate-500 max-w-[50%]">
                <p className="font-bold text-slate-900 text-[9px] mb-0.5">CloudExify</p>
                <p>Islamabad,Pakistan</p>
                <p>cloudexify.site | hello@cloudexify.site</p>
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
              <div className="border border-slate-200 rounded-md overflow-hidden my-2.5">
                <div className="bg-blue-500 px-3 py-1.5">
                  <p className="text-white text-[10px] font-bold uppercase tracking-wider">INTERNSHIP DETAILS</p>
                </div>
                <div className="flex px-3 py-1.5 bg-slate-50 border-b border-slate-200">
                  <span className="w-[30%] font-bold text-blue-600 text-[9px]">Program</span>
                  <span className="w-[70%] text-[9px] text-slate-700">{selectedIntern ? selectedIntern.domain : 'Domain'} Internship Program 2026</span>
                </div>
                <div className="flex px-3 py-1.5 border-b border-slate-200">
                  <span className="w-[30%] font-bold text-blue-600 text-[9px]">Duration</span>
                  <span className="w-[70%] text-[9px] text-slate-700"><span className="font-bold text-slate-900">{formatDate(joiningDate)}</span> to <span className="font-bold text-slate-900">End Date</span> (2 Months)</span>
                </div>
                <div className="flex px-3 py-1.5 bg-slate-50 border-b border-slate-200">
                  <span className="w-[30%] font-bold text-blue-600 text-[9px]">Mode</span>
                  <span className="w-[70%] text-[9px] text-slate-700">Remote</span>
                </div>
                <div className="flex px-3 py-1.5 border-b border-slate-200">
                  <span className="w-[30%] font-bold text-blue-600 text-[9px]">Projects</span>
                  <span className="w-[70%] text-[9px] text-slate-700">4 real world projects</span>
                </div>
                <div className="flex px-3 py-1.5 bg-slate-50 border-b border-slate-200">
                  <span className="w-[30%] font-bold text-blue-600 text-[9px]">Compensation</span>
                  <span className="w-[70%] text-[9px] text-slate-700">Unpaid — Certificate + Experience</span>
                </div>
                <div className="flex items-center px-3 py-1.5">
                  <span className="w-[30%] font-bold text-blue-600 text-[9px]">Reg. No</span>
                  <span className="text-[9px] font-bold text-blue-600 border border-blue-200 bg-blue-50 px-1.5 py-0.5 rounded">[{selectedIntern ? selectedIntern.registration_number : 'CX-XXXX'}]</span>
                </div>
              </div>

              {/* Terms Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5 mb-2.5">
                <p className="font-bold text-slate-900 text-[10px] mb-1.5">TERMS & CONDITIONS</p>
                <ul className="space-y-1 pl-2 text-[9px] text-slate-600 list-disc list-outside ml-2">
                  <li>This internship is unpaid and remote-based.</li>
                  <li>Intern must complete all 4 assigned projects to receive certificate.</li>
                  <li>CloudExify reserves the right to terminate internship for misconduct.</li>
                  <li>By accepting this offer, intern agrees to CloudExify&apos;s code of conduct and policies.</li>
                </ul>
              </div>

              {/* Acceptance Paragraph */}
              <p className="italic text-slate-500 mb-3 text-[9.5px]">
                By accepting this offer letter, you confirm your commitment to the CloudExify Summer Internship Program 2026 and agree to abide by all terms and conditions stated herein.
              </p>
            </div>

            <p className="mb-4">Sincerely,</p>

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
                  <p className="text-[8px] text-blue-600">CloudExify</p>
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
            <div className="absolute bottom-4 left-10 right-10 flex justify-between pt-1">
              <div className="w-[75%] text-[7px] space-y-0.5 leading-tight">
                <p className="font-bold text-slate-900">cloudexify.site | hello@cloudexify.site</p>
                <p className="text-slate-500">WhatsApp: +92 341 1949277X</p>
                <p className="text-blue-600">Verify: admin.cloudexify.site/verify</p>
                <p className="font-bold text-slate-900">Document ID: CX-OL-2026-XXXX</p>
                <p className="text-slate-400">© 2026 CloudExify. All rights reserved.</p>
              </div>
              <div className="w-[25%] flex flex-col items-end justify-start pt-0.5">
                <div className="w-9 h-9 bg-slate-200 border border-slate-300 flex items-center justify-center mb-0.5">
                  <span className="text-[5px] text-slate-400 font-bold">QR CODE</span>
                </div>
                <p className="text-[5px] text-blue-600 font-bold tracking-widest uppercase">SCAN TO VERIFY</p>
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
