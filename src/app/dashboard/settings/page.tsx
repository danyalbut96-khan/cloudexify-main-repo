'use client';

import React, { useEffect, useState } from 'react';
import { Settings, ShieldCheck, Mail, Building, Globe, Edit3, Upload, Image as ImageIcon } from 'lucide-react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [isSavingSignature, setIsSavingSignature] = useState(false);

  // Company Details State
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyLogoUrl, setCompanyLogoUrl] = useState('');

  // Admin Signature Profile State
  const [adminFullName, setAdminFullName] = useState('');
  const [signatureUrl, setSignatureUrl] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to load settings');
      const data = await res.json();
      
      if (data.companySettings) {
        setCompanyName(data.companySettings.company_name);
        setCompanyAddress(data.companySettings.company_address);
        setCompanyWebsite(data.companySettings.company_website);
        setCompanyEmail(data.companySettings.company_email);
        setCompanyLogoUrl(data.companySettings.company_logo_url || '');
      }

      if (data.adminSignature) {
        setAdminFullName(data.adminSignature.full_name);
        setSignatureUrl(data.adminSignature.signature_url || '');
        setAdminEmail(data.adminSignature.email);
      }
    } catch (err: any) {
      toast.error(err.message || 'Error fetching settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Save company global settings
  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCompany(true);
    const saveToast = toast.loading('Saving company details...');
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'company',
          company_name: companyName,
          company_address: companyAddress,
          company_website: companyWebsite,
          company_email: companyEmail,
          company_logo_url: companyLogoUrl
        })
      });

      if (!res.ok) throw new Error('Failed to update company settings');
      toast.success('Company settings saved successfully!', { id: saveToast });
      fetchSettings();
    } catch (err: any) {
      toast.error(err.message || 'Save failed', { id: saveToast });
    } finally {
      setIsSavingCompany(false);
    }
  };

  // Save personal signature settings
  const handleSaveSignature = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSignature(true);
    const saveToast = toast.loading('Saving signature settings...');
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'signature',
          full_name: adminFullName,
          signature_url: signatureUrl
        })
      });

      if (!res.ok) throw new Error('Failed to update signature settings');
      toast.success('Signature profile updated successfully!', { id: saveToast });
      fetchSettings();
    } catch (err: any) {
      toast.error(err.message || 'Save failed', { id: saveToast });
    } finally {
      setIsSavingSignature(false);
    }
  };

  // Handle uploader trigger
  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024 * 2) {
      toast.error('File size exceeds 2MB limit.');
      return;
    }

    const uploadToast = toast.loading('Converting and uploading file...');
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        try {
          const res = await fetch('/api/settings/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: file.name,
              fileType: file.type,
              base64Data
            })
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to upload signature image');

          setSignatureUrl(data.url);
          toast.success('Signature file uploaded successfully!', { id: uploadToast });
        } catch (err: any) {
          toast.error(err.message || 'Upload failed', { id: uploadToast });
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      toast.error('File conversion failed', { id: uploadToast });
    }
  };

  if (loading) {
    return (
      <PageWrapper title="System Settings">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="System Settings">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start text-slate-700">
        {/* Company Settings Card */}
        <Card className="border border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 pb-3 border-b border-slate-100 flex items-center">
            <Building className="h-4.5 w-4.5 mr-2 text-slate-400" />
            Company Branding Details
          </h3>

          <form onSubmit={handleSaveCompany} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Company Name</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="CloudExify"
                className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Company Address</label>
              <textarea
                required
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                rows={2}
                placeholder="Plot 45-C, 24th Commercial St, Karachi"
                className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Company Website</label>
                <input
                  type="text"
                  required
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  placeholder="https://cloudexify.com"
                  className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Company Email</label>
                <input
                  type="email"
                  required
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  placeholder="info@cloudexify.com"
                  className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSavingCompany}
              >
                Save Company Details
              </Button>
            </div>
          </form>
        </Card>

        {/* Admin Signature Profile */}
        <Card className="border border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 pb-3 border-b border-slate-100 flex items-center">
            <Edit3 className="h-4.5 w-4.5 mr-2 text-slate-400" />
            Personal Founder Signature
          </h3>

          <form onSubmit={handleSaveSignature} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Full Signer Name</label>
                <input
                  type="text"
                  required
                  value={adminFullName}
                  onChange={(e) => setAdminFullName(e.target.value)}
                  placeholder="Founder full name..."
                  className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Email Account</label>
                <input
                  type="email"
                  disabled
                  value={adminEmail}
                  className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-400 bg-slate-50 focus:outline-none"
                />
              </div>
            </div>

            {/* Signature Image Upload area */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Signature Image (2MB max)</label>
              <div className="mt-2.5 flex items-center space-x-5">
                <div className="h-16 w-36 rounded-xl border border-slate-200 border-dashed bg-slate-50 flex items-center justify-center relative overflow-hidden">
                  {signatureUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={signatureUrl} className="h-full w-full object-contain p-2" alt="signature" />
                  ) : (
                    <div className="text-slate-400 flex flex-col items-center">
                      <ImageIcon className="h-5 w-5 mb-0.5" />
                      <span className="text-[7.5px] uppercase font-bold">No Signature</span>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    id="signature-file"
                    onChange={handleSignatureUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="signature-file"
                    className="cursor-pointer inline-flex items-center px-3 py-2 border border-slate-200 text-xs font-semibold rounded-lg text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors"
                  >
                    <Upload className="h-3.5 w-3.5 mr-1 text-slate-400" />
                    Upload Image
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 mt-4">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSavingSignature}
                disabled={!adminFullName}
              >
                Save Signature Profile
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </PageWrapper>
  );
}
