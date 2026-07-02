'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Download, Calendar, ShieldCheck, UserCheck, FileText } from 'lucide-react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function RecommendationLetterPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlInternId = searchParams.get('internId');

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedIntern, setSelectedIntern] = useState<any>(null);
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0]);
  const [customText, setCustomText] = useState('');
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
    const renderToast = toast.loading('Generating Recommendation Letter...');

    try {
      const params = new URLSearchParams({
        internId: selectedIntern.id,
        completionDate,
        adminEmail,
      });
      if (customText) params.append('customText', customText);
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
      toast.error(err.message || 'Error generating Recommendation Letter', { id: renderToast });
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
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">2. Letter Customization</h2>
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
                  <FileText className="h-3.5 w-3.5 mr-1" />
                  Custom Recommendation Content (Optional)
                </label>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  rows={4}
                  className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white placeholder-slate-400"
                  placeholder="Leave empty for standard recommendation letter body..."
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
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Live Document Preview</p>
          <div className="bg-white border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.03)] rounded-2xl p-10 min-h-[640px] text-[10px] text-slate-600 leading-relaxed font-sans relative aspect-[1/1.41] select-none text-slate-700">
            {/* Letterhead Logo Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-5 mb-8">
              <div>
                <p className="text-xl font-bold tracking-tight text-blue-600">CloudExify.</p>
              </div>
              <div className="text-right text-[7px] text-slate-400">
                <p className="font-bold text-slate-700">CloudExify</p>
                <p>Plot 45-C, 24th Commercial St, Karachi, Pakistan</p>
                <p>https://cloudexify.com | admin@cloudexify.com</p>
              </div>
            </div>

            {/* Date */}
            <p className="mb-4 text-slate-500 font-semibold">Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            {/* Salutation */}
            <h3 className="text-slate-900 font-bold text-xs uppercase mb-5">TO WHOM IT MAY CONCERN</h3>

            {/* Body */}
            <div className="space-y-3.5 text-justify text-slate-700">
              <p>
                It is my pleasure to write this letter of recommendation for <span className="font-bold text-slate-900">{selectedIntern ? selectedIntern.full_name : '[Intern Name]'}</span>, who recently completed a 2-month internship as a <span className="font-bold text-slate-900">{selectedIntern ? selectedIntern.domain : '[Domain]'} Intern</span> at CloudExify. The internship took place from <span className="font-bold text-slate-900">{formatDate(startDate)}</span> to <span className="font-bold text-slate-900">{formatDate(completionDate)}</span>.
              </p>

              {customText ? (
                <p className="text-slate-700">{customText}</p>
              ) : (
                <>
                  <p>
                    During this tenure, <span className="font-bold text-slate-900">{selectedIntern ? selectedIntern.full_name : '[Intern Name]'}</span> demonstrated an exceptional work ethic and a deep understanding of software engineering concepts. They were actively involved in analyzing application requirements, implementing modular features, and cooperating with peer engineers on remote projects.
                  </p>
                  <p>
                    They consistently proved to be highly analytical and details-oriented, resolving programming challenges with structured, clean logic. Their ability to quickly adapt to our stack and understand complex features was commendable. Beyond their technical skills, they have strong communication skills and collaborate effectively as a team player.
                  </p>
                  <p>
                    We believe {selectedIntern ? selectedIntern.full_name : '[Intern Name]'} has great potential as a developer and will be a valuable asset to any technical team. I recommend them without reservation and wish them all the success in their career.
                  </p>
                </>
              )}
            </div>

            <p className="mt-8">Sincerely,</p>

            {/* Signatures */}
            <div className="mt-6 w-[45%] text-left">
              {selectedSignatory.signature_url ? (
                <img src={selectedSignatory.signature_url} className="h-10 object-contain mb-1.5 opacity-90" alt="signature" />
              ) : (
                <div className="h-10" />
              )}
              <div className="border-t border-slate-300 pt-1.5">
                <p className="font-bold text-slate-900">{selectedSignatory.full_name}</p>
                <p className="text-[7.5px] text-slate-400">Managing Director / Founder</p>
                <p className="text-[7.5px] text-slate-400">CloudExify</p>
              </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-5 left-10 right-10 flex justify-between border-t border-slate-50 pt-2 text-[6.5px] text-slate-400">
              <p>CloudExify Software Development</p>
              <p>Verification ID: {selectedIntern ? selectedIntern.registration_number : '[Registration Number]'}</p>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
