'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Download, Calendar, ShieldCheck, UserCheck, Award, Zap, Users } from 'lucide-react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

function CertificateGenerator() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlInternId = searchParams.get('internId');

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedIntern, setSelectedIntern] = useState<any>(null);
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [adminEmail, setAdminEmail] = useState('');
  const [allAdmins, setAllAdmins] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [previewCertId, setPreviewCertId] = useState('');
  const [companyLogoUrl, setCompanyLogoUrl] = useState('');
  const [companyName, setCompanyName] = useState('CloudExify');

  // Bulk Generation State
  const [pendingInterns, setPendingInterns] = useState<any[]>([]);
  const [isFetchingPending, setIsFetchingPending] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [bulkMode, setBulkMode] = useState<'pending' | 'all'>('pending');

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

  // Generate random preview certificate number
  useEffect(() => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const year = new Date().getFullYear();
    setPreviewCertId(`CX-CERT-${year}-${randomNum}`);
  }, [selectedIntern]);

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

  const handleGenerate = async () => {
    if (!selectedIntern) {
      toast.error('Please select an intern.');
      return;
    }
    if (!adminEmail) {
      toast.error('Please select a signer.');
      return;
    }
    if ((selectedIntern.submitted_projects_count || 0) < 4) {
      toast.error('Intern has not submitted 4 projects.');
      return;
    }

    setIsGenerating(true);
    const renderToast = toast.loading('Generating Certificate...');

    try {
      const endpoint = `/api/documents/certificate?internId=${selectedIntern.id}&completionDate=${completionDate}&adminEmail=${adminEmail}`;
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Generation failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificate_${selectedIntern.registration_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Certificate downloaded successfully!', { id: renderToast });
    } catch (err: any) {
      toast.error(err.message || 'Error generating Certificate', { id: renderToast });
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedSignatory = allAdmins.find(a => a.email === adminEmail) || {
    full_name: 'Authorized Signatory',
    signature_url: null
  };

  // startDate is now managed by state (fetched from batch.start_date)

  const fetchPendingInterns = async (mode: 'pending' | 'all' = bulkMode) => {
    setIsFetchingPending(true);
    setBulkMode(mode);
    try {
      let endpoint = '/api/interns?limit=5000';
      if (selectedBatchId) endpoint += `&batchId=${selectedBatchId}`;
      
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        const list = mode === 'pending'
          ? data.filter((i: any) => !i.intern_documents?.certificate_generated)
          : data;
        setPendingInterns(list);
        const label = mode === 'pending' ? 'pending' : 'total';
        toast.success(list.length > 0 ? `Found ${list.length} ${label} interns.` : 'No interns found!');
      }
    } catch (err) {
      toast.error('Failed to fetch interns');
    } finally {
      setIsFetchingPending(false);
    }
  };

  const handleBulkGenerate = async () => {
    if (pendingInterns.length === 0) return toast.error('No pending interns found. Fetch them first.');
    if (!adminEmail) return toast.error('Please select an authorized admin to sign.');

    const eligibleInterns = pendingInterns.filter((i: any) => (i.submitted_projects_count || 0) >= 4);
    if (eligibleInterns.length === 0) return toast.error('No pending interns are eligible (require 4 projects).');

    setIsBulkGenerating(true);
    setBulkProgress({ current: 0, total: eligibleInterns.length });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < eligibleInterns.length; i++) {
      const intern = eligibleInterns[i];
      try {
        const res = await fetch('/api/documents/certificate/store', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            internId: intern.id,
            completionDate,
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
      setBulkProgress({ current: i + 1, total: eligibleInterns.length });
    }

    setIsBulkGenerating(false);
    toast.success(`Bulk generation complete! Success: ${successCount}, Failed: ${failCount}`);
    setPendingInterns([]);
  };

  return (
    <PageWrapper title="Certificate Generator">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Controls */}
        <Card className="lg:col-span-4 space-y-6 border border-slate-100">
          <div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">1. Select Batch (Optional)</h2>
            <select
              value={selectedBatchId}
              onChange={(e) => {
                const batchId = e.target.value;
                setSelectedBatchId(batchId);
                setSearchQuery('');
                setSearchResults([]);

                const batch = batches.find((b: any) => b.id === batchId);
                if (batch) {
                  if (batch.end_date) setCompletionDate(batch.end_date.split('T')[0]);
                  if (batch.start_date) setStartDate(batch.start_date.split('T')[0]);
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

            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">2. Select Intern</h2>
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
              <div className="absolute z-20 w-[90%] md:w-[25%] bg-white border border-slate-100 rounded-lg mt-1 shadow-lg max-h-52 overflow-y-auto divide-y divide-slate-50">
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => selectIntern(item)}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-slate-900 font-bold">{item.full_name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{item.domain} • Projects: {item.submitted_projects_count || 0}/4</p>
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
                <p className={`text-[10px] font-bold ${(selectedIntern.submitted_projects_count || 0) >= 4 ? 'text-green-600' : 'text-amber-600'}`}>Projects Submitted: {selectedIntern.submitted_projects_count || 0}/4</p>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">3. Issuance Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  Completion Date
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
            disabled={!selectedIntern || !adminEmail || isBulkGenerating}
            className="w-full py-2.5 font-bold shadow-lg shadow-blue-200"
          >
            <Download className="h-4 w-4 mr-2" />
            Generate Certificate
          </Button>
        </Card>

        {/* Bulk Actions Card */}
        <Card className="lg:col-span-4 space-y-5 border border-purple-100 bg-gradient-to-br from-purple-50/50 to-white mt-0">
          <div>
            <h2 className="text-sm font-bold text-purple-900 uppercase tracking-wider mb-1 flex items-center">
              <Zap className="h-4 w-4 mr-1.5 text-purple-600" />
              Bulk Generation
            </h2>
            <p className="text-[10px] text-slate-500 mb-4 leading-relaxed">
              Generate and save Certificates for all interns in a batch directly to Supabase storage.
            </p>

            <div className="space-y-3">
              {/* Mode buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => fetchPendingInterns('pending')}
                  isLoading={isFetchingPending && bulkMode === 'pending'}
                  disabled={isBulkGenerating}
                  className="flex-1 text-xs py-2 border-amber-200 text-amber-700 hover:bg-amber-50"
                >
                  <Users className="h-3.5 w-3.5 mr-1.5" />
                  Pending Only
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fetchPendingInterns('all')}
                  isLoading={isFetchingPending && bulkMode === 'all'}
                  disabled={isBulkGenerating}
                  className="flex-1 text-xs py-2 border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  <Users className="h-3.5 w-3.5 mr-1.5" />
                  Regenerate All
                </Button>
              </div>

              {pendingInterns.length > 0 && (
                <div className="bg-white border border-purple-100 rounded-xl p-4 shadow-sm space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">
                      {bulkMode === 'pending' ? 'Pending:' : 'Regenerating:'}
                    </span>
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
                      <span className="flex items-center">
                        <Zap className="h-3.5 w-3.5 mr-2" />
                        {bulkMode === 'pending' ? 'Generate Pending to Storage' : 'Regenerate All to Storage'}
                      </span>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-6">
        {/* Right Preview */}
        <div className="lg:col-span-12 space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Live Certificate Preview</p>
          <div className="bg-white border-8 border-slate-900 rounded-2xl p-8 min-h-[460px] text-[9px] text-slate-600 leading-relaxed font-sans relative aspect-[1.41/1] flex flex-col justify-center items-center select-none shadow-lg text-slate-700">
            {/* Inner Gold Border */}
            <div className="absolute inset-2 border border-amber-500/60 pointer-events-none" />

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
                  const textLogo = document.getElementById('preview-cert-text-logo');
                  if (textLogo) textLogo.style.display = 'block';
                }}
              />
            )}
            <h1 id="preview-cert-text-logo" className="text-xl font-bold tracking-widest text-blue-600 uppercase mb-1" style={{ display: 'none' }}>
              {companyName}.
            </h1>
            <p className="text-[7px] text-slate-400 uppercase tracking-widest mb-6">Software Development Company</p>

            <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-2">Certificate of Completion</h2>
            <p className="text-[10px] text-slate-500 mb-4">This is proudly presented to</p>

            <h3 className="text-lg font-black text-blue-600 border-b border-blue-500/30 px-6 pb-1 mb-4 text-center min-w-[240px]">
              {selectedIntern ? selectedIntern.full_name : '[Intern Name]'}
            </h3>

            <p className="text-[9px] text-slate-500 max-w-[80%] text-center leading-loose mb-6">
              for successfully completing a 2-month remote internship program from{' '}
              <span className="font-bold text-slate-800">{formatDate(startDate)}</span> to{' '}
              <span className="font-bold text-slate-800">{formatDate(completionDate)}</span> as a{' '}
              <span className="font-bold text-slate-800">{selectedIntern ? selectedIntern.domain : '[Intern Domain]'} Intern</span>{' '}
              at CloudExify. During this period, the intern demonstrated exceptional dedication, diligence, and technical aptitude.
            </p>

            {/* Bottom Row */}
            <div className="flex justify-between items-end w-[85%] mt-4">
              <div className="text-center w-[30%]">
                <p className="font-bold text-slate-800 border-b border-slate-300 pb-1">{formatDate(completionDate)}</p>
                <p className="text-[6.5px] uppercase tracking-wider text-slate-400 mt-1">Date of Issue</p>
              </div>

              {/* Seal Representation */}
              <div className="flex flex-col items-center justify-center">
                <div className="h-10 w-10 rounded-full border-2 border-amber-500 bg-amber-50/50 flex flex-col items-center justify-center text-amber-500 font-bold mb-1">
                  <span className="text-[7px]">CX</span>
                  <span className="text-[4px]">SEAL</span>
                </div>
                <span className="text-[6.5px] font-bold text-amber-600 uppercase tracking-wider">Verified</span>
              </div>

              <div className="text-center w-[30%]">
                {selectedSignatory.signature_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedSignatory.signature_url} className="h-8 object-contain mb-1 mx-auto" alt="signature" />
                ) : (
                  <div className="h-8" />
                )}
                <p className="font-bold text-slate-800 border-b border-slate-300 pb-1">{selectedSignatory.full_name}</p>
                <p className="text-[6.5px] uppercase tracking-wider text-slate-400 mt-1">Authorized Signature</p>
              </div>
            </div>

            {/* Absolute Tags */}
            <p className="absolute bottom-4 left-6 text-[6px] text-slate-400">
              Certificate ID: {previewCertId}
            </p>
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[5.5px] text-[#9ab3d0] text-center w-max">
              This document can be verified at admin.cloudexify.site/verify/{previewCertId}
            </p>
            <p className="absolute bottom-4 right-6 text-[6px] text-slate-400">
              Scan to verify
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default function CertificatePage() {
  return (
    <Suspense fallback={
      <PageWrapper title="Certificate Generator">
        <div className="animate-pulse flex items-center justify-center min-h-[300px] text-slate-400">
          Loading Certificate Generator...
        </div>
      </PageWrapper>
    }>
      <CertificateGenerator />
    </Suspense>
  );
}
