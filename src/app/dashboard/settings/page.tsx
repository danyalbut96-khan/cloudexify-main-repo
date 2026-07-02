'use client';

import React, { useEffect, useState } from 'react';
import {
  Settings as SettingsIcon,
  ShieldCheck,
  Mail,
  Building,
  Globe,
  Edit3,
  Upload,
  Image as ImageIcon,
  KeyRound,
  FileSpreadsheet,
  Trash2,
  ToggleLeft,
  ToggleRight,
  User,
  CheckCircle,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'branding' | 'profile' | 'sheets' | 'security'>('branding');
  const [loading, setLoading] = useState(true);

  // Loading states for actions
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isConnectingSheet, setIsConnectingSheet] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Company Details State
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyLogoUrl, setCompanyLogoUrl] = useState('');

  // Admin Profile State
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [signatureUrl, setSignatureUrl] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [designation, setDesignation] = useState('');

  // Sheets Connections State
  const [sheetConnections, setSheetConnections] = useState<any[]>([]);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [newSheetName, setNewSheetName] = useState('');
  const [newSheetUrl, setNewSheetUrl] = useState('');
  const [newSheetMapping, setNewSheetMapping] = useState('interns');

  // Password Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to load settings data');
      const data = await res.json();

      if (data.companySettings) {
        setCompanyName(data.companySettings.company_name);
        setCompanyAddress(data.companySettings.company_address);
        setCompanyWebsite(data.companySettings.company_website);
        setCompanyEmail(data.companySettings.company_email);
        setCompanyLogoUrl(data.companySettings.company_logo_url || '');
      }

      if (data.adminProfile) {
        setDisplayName(data.adminProfile.display_name || '');
        setAvatarUrl(data.adminProfile.avatar_url || '');
        setSignatureUrl(data.adminProfile.signature_url || '');
        setDesignation(data.adminProfile.designation || '');
      }

      setSheetConnections(data.sheetConnections || []);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAdminEmail(user.email || '');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error fetching settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Save admin profile settings
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    const saveToast = toast.loading('Saving profile changes...');
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'profile',
          display_name: displayName,
          avatar_url: avatarUrl,
          signature_url: signatureUrl,
          designation: designation
        })
      });

      if (!res.ok) throw new Error('Failed to update profile');
      toast.success('Profile details saved successfully!', { id: saveToast });
      fetchSettings();
    } catch (err: any) {
      toast.error(err.message || 'Save failed', { id: saveToast });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // File Upload handler for Avatars and Signatures
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, bucketName: 'admin-avatars' | 'admin-signatures') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only image formats (.jpg, .png, .webp) are allowed.');
      return;
    }

    if (file.size > 1024 * 1024 * 2) {
      toast.error('File size exceeds the 2MB limit.');
      return;
    }

    const uploadToast = toast.loading(`Uploading image to ${bucketName.split('-')[1]}...`);
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
              base64Data,
              bucketName
            })
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Upload failed');

          if (bucketName === 'admin-avatars') {
            setAvatarUrl(data.url);
          } else {
            setSignatureUrl(data.url);
          }
          toast.success('File uploaded successfully!', { id: uploadToast });
        } catch (err: any) {
          toast.error(err.message || 'Upload failed', { id: uploadToast });
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      toast.error('Conversion failed', { id: uploadToast });
    }
  };

  // Connect Google Sheet
  const handleConnectSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSheetName || !newSheetUrl) {
      toast.error('Please enter both name and sheet CSV URL.');
      return;
    }

    setIsConnectingSheet(true);
    const connToast = toast.loading('Connecting and validating URL...');
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'sheet_connect',
          sheet_name: newSheetName,
          sheet_url: newSheetUrl,
          mapped_to: newSheetMapping
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to connect sheet');

      toast.success('Google Sheet connected successfully!', { id: connToast });
      setShowConnectModal(false);
      setNewSheetName('');
      setNewSheetUrl('');
      fetchSettings();
    } catch (err: any) {
      toast.error(err.message || 'Connection failed', { id: connToast });
    } finally {
      setIsConnectingSheet(false);
    }
  };

  // Disconnect Sheet
  const handleDisconnectSheet = async (id: string) => {
    if (!confirm('Are you sure you want to disconnect this sheet connection?')) return;
    const disToast = toast.loading('Disconnecting sheet...');
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'sheet_disconnect',
          id
        })
      });
      if (!res.ok) throw new Error('Failed to delete connection');
      toast.success('Disconnected sheet successfully', { id: disToast });
      fetchSettings();
    } catch (err: any) {
      toast.error(err.message || 'Disconnection failed', { id: disToast });
    }
  };

  // Toggle Sheet Active Status
  const handleToggleSheet = async (id: string, currentStatus: boolean) => {
    const toggleToast = toast.loading('Toggling connection state...');
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'sheet_toggle',
          id,
          is_active: !currentStatus
        })
      });
      if (!res.ok) throw new Error('Failed to toggle connection');
      toast.success('Status updated successfully', { id: toggleToast });
      fetchSettings();
    } catch (err: any) {
      toast.error(err.message || 'Status toggle failed', { id: toggleToast });
    }
  };

  // Change Password Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long.');
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      toast.error('Password must contain at least 1 uppercase letter.');
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      toast.error('Password must contain at least 1 number.');
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      toast.error('Password must contain at least 1 special character.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    const passToast = toast.loading('Validating credentials and updating password...');

    try {
      // 1. Re-authenticate session to confirm current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: currentPassword
      });

      if (signInError) {
        throw new Error('Current password is incorrect.');
      }

      // 2. Perform password update
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      toast.success('Password changed successfully! Logging out...', { id: passToast });

      // 3. Log out active user and force re-login
      setTimeout(async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
      }, 1500);

    } catch (err: any) {
      toast.error(err.message || 'Password update failed', { id: passToast });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper title="System Settings">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Skeleton className="h-44 w-full lg:col-span-1" />
          <Skeleton className="h-96 w-full lg:col-span-3" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="System Settings">
      <div className="flex flex-col lg:flex-row gap-6 items-start text-slate-700 font-sans">

        {/* Navigation Sidebar Cards */}
        <div className="w-full lg:w-64 bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex flex-row lg:flex-col gap-1.5 shrink-0 select-none overflow-x-auto">
          <button
            onClick={() => setActiveTab('branding')}
            className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-colors text-left shrink-0 ${activeTab === 'branding' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
          >
            <Building className="h-4 w-4" />
            <span>Company Branding</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-colors text-left shrink-0 ${activeTab === 'profile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
          >
            <User className="h-4 w-4" />
            <span>My Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('sheets')}
            className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-colors text-left shrink-0 ${activeTab === 'sheets' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Connected Sheets</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-colors text-left shrink-0 ${activeTab === 'security' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
          >
            <KeyRound className="h-4 w-4" />
            <span>Security & Password</span>
          </button>
        </div>

        {/* Dynamic Panels */}
        <div className="flex-1 w-full">

          {/* TAB 1: Company Branding details */}
          {activeTab === 'branding' && (
            <Card className="border border-slate-100 p-6">
              <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 mb-5 flex items-center">
                <Building className="h-4.5 w-4.5 mr-2 text-blue-500" />
                Global Company Profile
              </h3>

              <form onSubmit={handleSaveCompany} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Company Name</label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. CloudExify"
                      className="block w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Branding Logo URL</label>
                    <input
                      type="text"
                      value={companyLogoUrl}
                      onChange={(e) => setCompanyLogoUrl(e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="block w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Company Website</label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Globe className="h-3.5 w-3.5" />
                      </div>
                      <input
                        type="url"
                        required
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        placeholder="https://cloudexify.site"
                        className="block w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Billing Support Email</label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="h-3.5 w-3.5" />
                      </div>
                      <input
                        type="email"
                        required
                        value={companyEmail}
                        onChange={(e) => setCompanyEmail(e.target.value)}
                        placeholder="billing@cloudexify.site"
                        className="block w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Office Headquarters Address</label>
                  <textarea
                    required
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    rows={3}
                    placeholder="Plot 45-C, 24th Commercial St, Phase II Ext Defence, Karachi, Pakistan"
                    className="block w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white leading-normal"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" isLoading={isSavingCompany} className="px-5 py-2 text-xs">
                    Save Branding Details
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* TAB 2: Personal Profile Settings */}
          {activeTab === 'profile' && (
            <Card className="border border-slate-100 p-6">
              <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 mb-5 flex items-center">
                <User className="h-4.5 w-4.5 mr-2 text-blue-500" />
                Personal Profile Management
              </h3>

              <div className="flex flex-col md:flex-row gap-8">
                {/* Left Side: Photo upload and Avatar previews */}
                <div className="w-full md:w-56 flex flex-col items-center border-r border-slate-100 pr-0 md:pr-8">
                  <div className="h-28 w-28 rounded-full border-4 border-slate-100 bg-slate-50 shadow-md relative overflow-hidden flex items-center justify-center">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar Preview" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-14 w-14 text-slate-300 animate-pulse" />
                    )}
                  </div>
                  <label className="mt-4 cursor-pointer inline-flex items-center px-4 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 text-slate-600 transition-colors">
                    <Upload className="h-3 w-3 mr-1.5" />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'admin-avatars')}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-slate-400 mt-2 text-center">Max 2MB (JPEG, PNG, WEBP)</p>
                </div>

                {/* Right Side: Profile settings edit form */}
                <div className="flex-1">
                  <form onSubmit={handleSaveProfile} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Login Credentials</label>
                      <input
                        type="text"
                        disabled
                        value={adminEmail}
                        className="block w-full px-3.5 py-2 text-xs border border-slate-200 bg-slate-50 text-slate-400 rounded-lg focus:outline-none cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Display Name (Signatory)</label>
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. Soban Khan"
                        className="block w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Signatory Designation</label>
                      <select
                        required
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="block w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      >
                        <option value="">Select Designation</option>
                        <option value="CEO & Founder">CEO (Founder)</option>
                        <option value="CTO & Co-Founder">CTO (Co-Founder)</option>
                        <option value="Chairman & Co-Founder">Chairman (Co-Founder)</option>
                      </select>
                    </div>

                    {/* Signature Stamp Upload Container */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Signature Stamp Image</label>
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col items-center justify-center min-h-[140px] relative">
                        {signatureUrl ? (
                          <div className="flex flex-col items-center">
                            <img src={signatureUrl} alt="Signature Preview" className="max-h-24 max-w-full object-contain mb-3" />
                            <div className="flex space-x-2">
                              <label className="cursor-pointer px-3 py-1 border border-slate-200 rounded-lg text-[10px] font-semibold bg-white hover:bg-slate-50 text-slate-600 transition-colors">
                                Replace
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleFileUpload(e, 'admin-signatures')}
                                  className="hidden"
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => setSignatureUrl('')}
                                className="px-3 py-1 border border-rose-100 rounded-lg text-[10px] font-semibold bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <ImageIcon className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-[11px] font-semibold text-slate-500">No Signature Stamp Uploaded</p>
                            <label className="mt-3 cursor-pointer inline-flex items-center px-4 py-1.5 border border-slate-200 bg-white rounded-lg text-[11px] font-semibold hover:bg-slate-50 text-slate-600 transition-colors">
                              <Upload className="h-3 w-3 mr-1.5" />
                              Upload Signature image
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'admin-signatures')}
                                className="hidden"
                              />
                            </label>
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5">Upload a transparent PNG signature stamp for attachment on documents.</p>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button type="submit" isLoading={isSavingProfile} className="px-5 py-2 text-xs">
                        Save Profile Details
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 3: Connected Google Sheets */}
          {activeTab === 'sheets' && (
            <Card className="border border-slate-100 p-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-5">
                <h3 className="text-sm font-black text-slate-800 flex items-center">
                  <FileSpreadsheet className="h-4.5 w-4.5 mr-2 text-blue-500" />
                  Google Sheets Connections
                </h3>
                <Button onClick={() => setShowConnectModal(true)} className="px-4 py-1.5 text-xs">
                  Connect New Sheet
                </Button>
              </div>

              {/* Connected Sheets List */}
              <div className="space-y-4">
                {sheetConnections.map((conn) => (
                  <div key={conn.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-xs font-bold text-slate-900">{conn.sheet_name}</p>
                        <span className="text-[9px] font-bold tracking-wider uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          Mapped: {conn.mapped_to}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate max-w-[280px] md:max-w-md">{conn.sheet_url}</p>
                      <p className="text-[9px] text-slate-400">Connected by: {conn.created_by}</p>
                    </div>

                    <div className="flex items-center space-x-3 self-end md:self-auto">
                      {/* Active Toggle Switch */}
                      <button
                        onClick={() => handleToggleSheet(conn.id, conn.is_active)}
                        className="flex items-center"
                      >
                        {conn.is_active ? (
                          <ToggleRight className="h-7 w-7 text-blue-600 transition-colors" />
                        ) : (
                          <ToggleLeft className="h-7 w-7 text-slate-300 transition-colors" />
                        )}
                      </button>

                      {/* Disconnect Button */}
                      <button
                        onClick={() => handleDisconnectSheet(conn.id)}
                        className="p-2 border border-rose-100 text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Disconnect connection"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {sheetConnections.length === 0 && (
                  <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50/30">
                    <FileSpreadsheet className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-xs font-bold text-slate-500">No spreadsheets connected yet</p>
                    <p className="text-[10px] text-slate-400 max-w-[280px] mx-auto mt-1 leading-relaxed">
                      Connect a published CSV spreadsheet to automate interns, projects, and proposals data sync.
                    </p>
                  </div>
                )}
              </div>

              {/* Connect modal overlay */}
              {showConnectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-left">
                    <h3 className="text-sm font-black text-white mb-4 uppercase tracking-wider flex items-center">
                      <FileSpreadsheet className="h-4.5 w-4.5 mr-2 text-blue-500" />
                      Connect Spreadsheet
                    </h3>

                    <form onSubmit={handleConnectSheet} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Connection Name</label>
                        <input
                          type="text"
                          required
                          value={newSheetName}
                          onChange={(e) => setNewSheetName(e.target.value)}
                          placeholder="e.g. Summer Interns Sheet"
                          className="block w-full px-3.5 py-2 text-xs border border-slate-800 bg-slate-950 text-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Mapping Directory</label>
                          <select
                            value={newSheetMapping}
                            onChange={(e) => setNewSheetMapping(e.target.value)}
                            className="block w-full px-3 py-2 text-xs border border-slate-800 bg-slate-950 text-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="interns">Interns</option>
                            <option value="projects">Projects</option>
                            <option value="proposals">Proposals</option>
                            <option value="invoices">Invoices</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Published CSV URL</label>
                        <input
                          type="url"
                          required
                          value={newSheetUrl}
                          onChange={(e) => setNewSheetUrl(e.target.value)}
                          placeholder="https://docs.google.com/spreadsheets/d/.../pub?output=csv"
                          className="block w-full px-3.5 py-2 text-xs border border-slate-800 bg-slate-950 text-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <p className="text-[9px] text-slate-500 mt-1 leading-normal">
                          Go to Google Sheets &rarr; File &rarr; Share &rarr; Publish to Web. Select &quot;Whole Document&quot; and &quot;CSV&quot;, then paste the link here.
                        </p>
                      </div>

                      <div className="flex justify-end space-x-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowConnectModal(false)}
                          className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-slate-300 rounded-lg text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        <Button type="submit" isLoading={isConnectingSheet} className="px-5 py-2 text-xs">
                          Establish Connection
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* TAB 4: Security and Password */}
          {activeTab === 'security' && (
            <Card className="border border-slate-100 p-6">
              <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 mb-5 flex items-center">
                <KeyRound className="h-4.5 w-4.5 mr-2 text-blue-500" />
                Change Dashboard Password
              </h3>

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Current Password</label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">New Password</label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showNewPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>

                {/* Password validation helper notes */}
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1 text-[10px] text-slate-500">
                  <p className="font-bold flex items-center text-slate-700 mb-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mr-1 shrink-0" />
                    Complexity Requirements:
                  </p>
                  <p className="flex items-center space-x-1">
                    <span className={newPassword.length >= 8 ? 'text-emerald-500 font-bold' : ''}>✓ At least 8 characters long</span>
                  </p>
                  <p className="flex items-center space-x-1">
                    <span className={/[A-Z]/.test(newPassword) ? 'text-emerald-500 font-bold' : ''}>✓ Contains at least 1 uppercase letter</span>
                  </p>
                  <p className="flex items-center space-x-1">
                    <span className={/[0-9]/.test(newPassword) ? 'text-emerald-500 font-bold' : ''}>✓ Contains at least 1 numeric digit</span>
                  </p>
                  <p className="flex items-center space-x-1">
                    <span className={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? 'text-emerald-500 font-bold' : ''}>✓ Contains at least 1 special character symbol</span>
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" isLoading={isChangingPassword} className="px-5 py-2 text-xs">
                    Update Password & Re-log
                  </Button>
                </div>
              </form>
            </Card>
          )}

        </div>

      </div>
    </PageWrapper>
  );
}
