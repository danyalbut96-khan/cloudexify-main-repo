'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Download, Calendar, ShieldCheck, UserCheck, Award } from 'lucide-react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function CertificatePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlInternId = searchParams.get('internId');

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedIntern, setSelectedIntern] = useState<any>(null);
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0]);
  const [adminEmail, setAdminEmail] = useState('');
  const [allAdmins, setAllAdmins] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

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

  const startDate = new Date(new Date(completionDate).getTime() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <PageWrapper title="Certificate Generator">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Controls */}
        <Card className="lg:col-span-4 space-y-6 border border-slate-100">
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
              <div className="absolute z-20 w-[90%] md:w-[25%] bg-white border border-slate-100 rounded-lg mt-1 shadow-lg max-h-52 overflow-y-auto divide-y divide-slate-50">
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
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">2. Issuance Details</h2>
            <div className="space-y-4">
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
            disabled={!selectedIntern || !adminEmail}
            className="w-full py-2.5 font-bold shadow-lg shadow-blue-200"
          >
            <Download className="h-4 w-4 mr-2" />
            Generate Certificate
          </Button>
        </Card>

        {/* Right Preview */}
        <div className="lg:col-span-8 space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Live Certificate Preview</p>
          <div className="bg-white border-8 border-slate-900 rounded-2xl p-8 min-h-[460px] text-[9px] text-slate-600 leading-relaxed font-sans relative aspect-[1.41/1] flex flex-col justify-center items-center select-none shadow-lg">
            {/* Inner Gold Border */}
            <div className="absolute inset-2 border border-amber-500/60 pointer-events-none" />

            <h1 className="text-xl font-bold tracking-widest text-blue-600 uppercase mb-1">CloudExify.</h1>
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
              Certificate ID: {selectedIntern ? selectedIntern.registration_number : '[Registration Number]'}
            </p>
            <p className="absolute bottom-4 right-6 text-[6px] text-slate-400">
              Verification: https://cloudexify.com
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
