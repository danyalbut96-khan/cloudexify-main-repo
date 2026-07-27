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
  AlertTriangle,
  X,
  ShieldOff,
  BrainCircuit,
  Save,
  Loader2,
  Users,
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
  const [activeTab, setActiveTab] = useState<'branding' | 'profile' | 'sheets' | 'security' | 'intern-analysis' | 'apis' | 'admin-team'>('branding');
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [adminTeam, setAdminTeam] = useState<any[]>([]);

  // Loading states for actions
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isConnectingSheet, setIsConnectingSheet] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Delete Account Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Company Details State
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyLogoUrl, setCompanyLogoUrl] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [bankDetails, setBankDetails] = useState('');

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

  // Intern Analysis Settings State
  const [aiApiKey, setAiApiKey] = useState('');
  const [aiModel, setAiModel] = useState('mistralai/mistral-7b-instruct:free');
  const [aiMaxProjects, setAiMaxProjects] = useState(4);
  const [aiRegistrationOpen, setAiRegistrationOpen] = useState(false);
  const [aiPublicLeaderboardOpen, setAiPublicLeaderboardOpen] = useState(false);
  const [adminSignupOpen, setAdminSignupOpen] = useState(true);
  const [aiBatchMessage, setAiBatchMessage] = useState('Batch 2 Registration Opening Soon! Stay tuned for announcements.');
  const [aiSystemPrompt, setAiSystemPrompt] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSavingAiSettings, setIsSavingAiSettings] = useState(false);
  const [aiCriteria, setAiCriteria] = useState<Record<string, Array<{id?: string; criterion_name: string; criterion_description: string; sort_order: number}>>>({});
  const [savingCriteriaDomain, setSavingCriteriaDomain] = useState<string | null>(null);
  const AI_DOMAINS = ['PY', 'CPP', 'JAVA', 'DS', 'CYB', 'GEN'];
  const AI_DOMAIN_LABELS: Record<string, string> = { PY: 'Python', CPP: 'C++', JAVA: 'Java', DS: 'Data Science', CYB: 'Cybersecurity', GEN: 'Full Stack' };
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
        setCompanyPhone(data.companySettings.company_phone || '');
        setBankDetails(data.companySettings.bank_details || '');
      }

      if (data.adminProfile) {
        setDisplayName(data.adminProfile.display_name || '');
        setAvatarUrl(data.adminProfile.avatar_url || '');
        setSignatureUrl(data.adminProfile.signature_url || '');
        setDesignation(data.adminProfile.designation || '');
        setIsSuperAdmin(data.adminProfile.is_super_admin || false);
      }

      setSheetConnections(data.sheetConnections || []);

      if (data.internAnalysisSettings) {
        const s = data.internAnalysisSettings;
        setAiApiKey(s.openrouter_api_key || '');
        setAiModel(s.openrouter_model || 'mistralai/mistral-7b-instruct:free');
        setAiMaxProjects(s.max_projects_per_intern ?? 4);
        setAiRegistrationOpen(s.registration_open ?? false);
        setAiPublicLeaderboardOpen(s.public_leaderboard_open ?? false);
        setAdminSignupOpen(s.admin_signup_open ?? true);
        setAiBatchMessage(s.batch_coming_soon_message || '');
        setAiSystemPrompt(s.system_prompt_prefix || '');
      }

      if (data.internAnalysisCriteria && Array.isArray(data.internAnalysisCriteria)) {
        const grouped: Record<string, any[]> = {};
        data.internAnalysisCriteria.forEach((c: any) => {
          if (!grouped[c.domain_code]) grouped[c.domain_code] = [];
          grouped[c.domain_code].push({ id: c.id, criterion_name: c.criterion_name, criterion_description: c.criterion_description, sort_order: c.sort_order });
        });
        setAiCriteria(grouped);
      }

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

  const fetchAdminTeam = async () => {
    try {
      const res = await fetch('/api/settings/admins');
      if (res.ok) {
        const data = await res.json();
        setAdminTeam(data.admins || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchAdminTeam();
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
          company_logo_url: companyLogoUrl,
          company_phone: companyPhone,
          bank_details: bankDetails
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

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      // Immediately reflect changes in local state without re-fetch
      if (data.adminProfile) {
        setDisplayName(data.adminProfile.display_name || displayName);
        setAvatarUrl(data.adminProfile.avatar_url || '');
        setSignatureUrl(data.adminProfile.signature_url || '');
        setDesignation(data.adminProfile.designation || '');
      }

      toast.success('Profile details saved successfully!', { id: saveToast });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save failed';
      toast.error(msg, { id: saveToast });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Delete Account handler
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm account deletion.');
      return;
    }
    setIsDeletingAccount(true);
    const delToast = toast.loading('Deleting account and all associated data...');
    try {
      const res = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Account deletion failed');

      toast.success('Account deleted. Signing out...', { id: delToast });

      // Sign out client-side session and redirect
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Deletion failed';
      toast.error(msg, { id: delToast });
      setIsDeletingAccount(false);
      setShowDeleteModal(false);
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

          <button
            onClick={() => setActiveTab('intern-analysis')}
            className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-colors text-left shrink-0 ${activeTab === 'intern-analysis' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
          >
            <BrainCircuit className="h-4 w-4" />
            <span>Intern Analysis</span>
          </button>

          <button
            onClick={() => setActiveTab('apis')}
            className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-colors text-left shrink-0 ${activeTab === 'apis' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
          >
            <SettingsIcon className="h-4 w-4" />
            <span>Connected APIs</span>
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => { setActiveTab('admin-team'); fetchAdminTeam(); }}
              className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-colors text-left shrink-0 ${activeTab === 'admin-team' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-rose-400'
                }`}
            >
              <Users className="h-4 w-4" />
              <span>Admin Team</span>
            </button>
          )}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">WhatsApp Contact Number</label>
                    <input
                      type="text"
                      value={companyPhone}
                      onChange={(e) => setCompanyPhone(e.target.value)}
                      placeholder="e.g. +92 341 1949277"
                      className="block w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Office Headquarters Address</label>
                    <textarea
                      required
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                      rows={4}
                      placeholder="Plot 45-C, 24th Commercial St, Phase II Ext Defence, Karachi, Pakistan"
                      className="block w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white leading-normal"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Invoice Bank Details</label>
                    <textarea
                      value={bankDetails}
                      onChange={(e) => setBankDetails(e.target.value)}
                      rows={4}
                      placeholder="Bank: Habib Bank Limited (HBL)&#10;Account Name: CloudExify Private Limited&#10;Account Number: 1234-567890-01"
                      className="block w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white leading-normal font-mono"
                    />
                  </div>
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
            <>
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
                      // eslint-disable-next-line @next/next/no-img-element
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
                            {/* eslint-disable-next-line @next/next/no-img-element */}
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

            {/* Delete Account Danger Zone */}
            <Card className="border border-rose-100 p-6 bg-rose-50/30 mt-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="p-2.5 bg-rose-100 rounded-xl">
                    <ShieldOff className="h-4.5 w-4.5 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Danger Zone — Delete Account</h3>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
                      Permanently delete your admin account, including your avatar, signature, and all profile data. This action <span className="font-bold text-rose-600">cannot be undone</span>.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setDeleteConfirmText(''); setShowDeleteModal(true); }}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Account</span>
                </button>
              </div>
            </Card>
            </>
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
            <div className="space-y-6">
              <Card className="border border-slate-100 p-6">
                <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 mb-5 flex items-center">
                  <ShieldCheck className="h-4.5 w-4.5 mr-2 text-blue-500" />
                  System Access
                </h3>
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl max-w-xl">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Admin Signup Gateway</h4>
                    <p className="text-[10px] text-slate-500 mt-1">Enable or disable new admin registrations via /signup.</p>
                  </div>
                  <button
                    onClick={async () => {
                      const newState = !adminSignupOpen;
                      setAdminSignupOpen(newState);
                      const toastId = toast.loading('Saving setting...');
                      try {
                        const res = await fetch('/api/settings', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            type: 'intern-analysis-settings',
                            openrouter_api_key: aiApiKey,
                            openrouter_model: aiModel,
                            max_projects_per_intern: aiMaxProjects,
                            registration_open: aiRegistrationOpen,
                            public_leaderboard_open: aiPublicLeaderboardOpen,
                            admin_signup_open: newState,
                            batch_coming_soon_message: aiBatchMessage,
                            system_prompt_prefix: aiSystemPrompt
                          })
                        });
                        if (!res.ok) throw new Error('Failed to update settings');
                        toast.success('Admin signup setting updated!', { id: toastId });
                      } catch (err: any) {
                        setAdminSignupOpen(!newState);
                        toast.error(err.message || 'Update failed', { id: toastId });
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${adminSignupOpen ? 'bg-blue-600' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${adminSignupOpen ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </Card>

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
            </div>
          )}

        </div>

      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-rose-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-rose-100 rounded-xl">
                  <ShieldOff className="h-4.5 w-4.5 text-rose-600" />
                </div>
                <h2 className="text-sm font-black text-slate-900">Delete Your Account</h2>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeletingAccount}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Warning Block */}
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl mb-5 space-y-2">
              <p className="text-xs font-bold text-rose-700 flex items-center">
                <AlertTriangle className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                This action is permanent and cannot be undone.
              </p>
              <ul className="text-[11px] text-rose-600 space-y-1 pl-5 list-disc">
                <li>Your admin profile and credentials will be deleted</li>
                <li>Your avatar and signature files will be removed from storage</li>
                <li>You will be immediately signed out of all sessions</li>
                <li>All audit log entries will reference your account as deleted</li>
              </ul>
            </div>

            {/* Confirmation Input */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">
                Type <span className="text-rose-600 font-black tracking-widest">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE here"
                autoFocus
                className="block w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors font-mono tracking-widest"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeletingAccount}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || isDeletingAccount}
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1.5"
              >
                {isDeletingAccount ? (
                  <>
                    <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Permanently Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Connected APIs Configuration */}
      {activeTab === 'apis' && (
        <div className="flex-1 space-y-6">

          {/* Section 1: API Configuration */}
          <Card className="border border-slate-100 p-6">
            <h3 className="text-sm font-bold text-slate-800 flex items-center mb-5">
              <BrainCircuit className="h-4.5 w-4.5 mr-2 text-blue-500" />
              AI & API Configuration
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">OpenRouter API Key</label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={aiApiKey}
                    onChange={e => setAiApiKey(e.target.value)}
                    placeholder="sk-or-v1-..."
                    className="block w-full pr-10 px-3.5 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-mono"
                  />
                  <button type="button" onClick={() => setShowApiKey(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showApiKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Get your free key at openrouter.ai/keys — stored securely in Supabase, never in code.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">AI Model</label>
                <select
                  value={aiModel}
                  onChange={e => setAiModel(e.target.value)}
                  className="block w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="mistralai/mistral-7b-instruct:free">mistral-7b-instruct (FREE)</option>
                  <option value="google/gemini-flash-1.5">gemini-flash-1.5 (Very Cheap)</option>
                  <option value="openai/gpt-4o-mini">gpt-4o-mini (Cheap)</option>
                  <option value="anthropic/claude-3-haiku">claude-3-haiku (Cheap)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Max Projects Per Intern</label>
                  <input
                    type="number"
                    min={1} max={10}
                    value={aiMaxProjects}
                    onChange={e => setAiMaxProjects(Number(e.target.value))}
                    className="block w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Registration Status</label>
                  <button
                    type="button"
                    onClick={() => setAiRegistrationOpen(v => !v)}
                    className={`w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      aiRegistrationOpen
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-amber-50 border-amber-200 text-amber-700'
                    }`}
                  >
                    {aiRegistrationOpen ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    {aiRegistrationOpen ? 'Open' : 'Closed'}
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Public Leaderboard</label>
                  <button
                    type="button"
                    onClick={() => setAiPublicLeaderboardOpen(v => !v)}
                    className={`w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      aiPublicLeaderboardOpen
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    {aiPublicLeaderboardOpen ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    {aiPublicLeaderboardOpen ? 'Visible' : 'Hidden'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">&quot;Batch Coming Soon&quot; Message (shown on portal)</label>
                <input
                  type="text"
                  value={aiBatchMessage}
                  onChange={e => setAiBatchMessage(e.target.value)}
                  className="block w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">AI System Prompt Prefix</label>
                <textarea
                  rows={3}
                  value={aiSystemPrompt}
                  onChange={e => setAiSystemPrompt(e.target.value)}
                  placeholder="You are an expert software engineering mentor..."
                  className="block w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white resize-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">This prefix is prepended to every AI analysis request.</p>
              </div>

              <button
                type="button"
                disabled={isSavingAiSettings}
                onClick={async () => {
                  setIsSavingAiSettings(true);
                  const t = toast.loading('Saving AI settings...');
                  try {
                    const res = await fetch('/api/settings', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        type: 'intern-analysis-settings',
                        openrouter_api_key: aiApiKey,
                        openrouter_model: aiModel,
                        max_projects_per_intern: aiMaxProjects,
                        registration_open: aiRegistrationOpen,
                        public_leaderboard_open: aiPublicLeaderboardOpen,
                        batch_coming_soon_message: aiBatchMessage,
                        system_prompt_prefix: aiSystemPrompt,
                      })
                    });
                    if (!res.ok) throw new Error((await res.json()).error);
                    toast.success('AI settings saved!', { id: t });
                  } catch (err: any) {
                    toast.error(err.message, { id: t });
                  } finally {
                    setIsSavingAiSettings(false);
                  }
                }}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                {isSavingAiSettings ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save AI Settings
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 7: Admin Team Management (Super Admin Only) */}
      {activeTab === 'admin-team' && isSuperAdmin && (
        <div className="flex-1 space-y-6">
          <Card className="border border-slate-100 p-6">
            <h3 className="text-sm font-bold text-slate-800 flex items-center mb-5">
              <Users className="h-4.5 w-4.5 mr-2 text-rose-500" />
              Super Admin Team Management
            </h3>
            <p className="text-xs text-slate-500 mb-6">Manage all administrators with access to the dashboard. You can suspend, delete, or reset passwords for other admins.</p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase text-slate-400 font-bold bg-slate-50">
                    <th className="px-4 py-3 rounded-tl-lg">Administrator</th>
                    <th className="px-4 py-3">Designation</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 rounded-tr-lg text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-slate-600 divide-y divide-slate-100">
                  {adminTeam.map(admin => (
                    <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-800">{admin.full_name} {admin.is_current_user && <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">YOU</span>} {admin.is_super_admin && <span className="ml-1 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">SUPER</span>}</div>
                        <div className="text-[10px] text-slate-400">{admin.email}</div>
                      </td>
                      <td className="px-4 py-4">{admin.designation}</td>
                      <td className="px-4 py-4">
                        {admin.is_active ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">Active</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">Suspended</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {!admin.is_current_user && (
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => {
                                const newPassword = prompt(`Enter new password for ${admin.full_name}:`);
                                if (newPassword) {
                                  const t = toast.loading('Updating password...');
                                  fetch('/api/settings/admins', {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ id: admin.id, action: 'password', new_password: newPassword })
                                  }).then(res => res.json()).then(data => {
                                    if (data.error) toast.error(data.error, { id: t });
                                    else toast.success('Password updated successfully', { id: t });
                                  });
                                }
                              }}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md text-[10px] font-semibold transition-colors"
                            >
                              Password
                            </button>
                            <button
                              onClick={() => {
                                const action = admin.is_active ? 'disable' : 'enable';
                                const t = toast.loading(admin.is_active ? 'Suspending account...' : 'Restoring account...');
                                fetch('/api/settings/admins', {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ id: admin.id, action })
                                }).then(res => res.json()).then(data => {
                                  if (data.error) toast.error(data.error, { id: t });
                                  else {
                                    toast.success('Account status updated', { id: t });
                                    fetchAdminTeam();
                                  }
                                });
                              }}
                              className={`px-2.5 py-1.5 rounded-md text-[10px] font-semibold transition-colors ${admin.is_active ? 'bg-amber-100 hover:bg-amber-200 text-amber-700' : 'bg-green-100 hover:bg-green-200 text-green-700'}`}
                            >
                              {admin.is_active ? 'Suspend' : 'Unsuspend'}
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you absolutely sure you want to permanently delete ${admin.full_name}? This cannot be undone.`)) {
                                  const t = toast.loading('Deleting account...');
                                  fetch('/api/settings/admins', {
                                    method: 'DELETE',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ id: admin.id })
                                  }).then(res => res.json()).then(data => {
                                    if (data.error) toast.error(data.error, { id: t });
                                    else {
                                      toast.success('Account deleted forever', { id: t });
                                      fetchAdminTeam();
                                    }
                                  });
                                }
                              }}
                              className="px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-md text-[10px] font-semibold transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 6: Intern Analysis Settings */}
      {activeTab === 'intern-analysis' && (
        <div className="flex-1 space-y-6">

          {/* Section 2: Per-Domain Scoring Criteria */}
          <Card className="border border-slate-100 p-6">
            <h3 className="text-sm font-bold text-slate-800 flex items-center mb-1">
              <BrainCircuit className="h-4.5 w-4.5 mr-2 text-violet-500" />
              Scoring Criteria Manager
            </h3>
            <p className="text-xs text-slate-400 mb-5">Each domain has 5 criteria × 5 marks = 25 marks per project. 4 projects = 100 total.</p>

            <div className="space-y-6">
              {AI_DOMAINS.map(domain => {
                const criteria = aiCriteria[domain] || Array.from({ length: 5 }, (_, i) => ({ criterion_name: '', criterion_description: '', sort_order: i + 1 }));
                return (
                  <div key={domain} className="border border-slate-100 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black px-2 py-0.5 bg-blue-600 text-white rounded">{domain}</span>
                        <span className="text-xs font-semibold text-slate-600">{AI_DOMAIN_LABELS[domain]}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">5 criteria × 5 marks = 25 pts</span>
                    </div>
                    <div className="p-4 space-y-3">
                      {criteria.map((c, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-start">
                          <div className="col-span-1 text-center pt-2">
                            <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                          </div>
                          <div className="col-span-4">
                            <input
                              type="text"
                              value={c.criterion_name}
                              onChange={e => {
                                const updated = [...criteria];
                                updated[idx] = { ...updated[idx], criterion_name: e.target.value };
                                setAiCriteria(prev => ({ ...prev, [domain]: updated }));
                              }}
                              placeholder="Criterion name"
                              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                            />
                          </div>
                          <div className="col-span-6">
                            <input
                              type="text"
                              value={c.criterion_description}
                              onChange={e => {
                                const updated = [...criteria];
                                updated[idx] = { ...updated[idx], criterion_description: e.target.value };
                                setAiCriteria(prev => ({ ...prev, [domain]: updated }));
                              }}
                              placeholder="Description for AI..."
                              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                            />
                          </div>
                          <div className="col-span-1 text-center pt-2">
                            <span className="text-[10px] font-bold text-slate-400">5 pts</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 pb-4">
                      <button
                        type="button"
                        disabled={savingCriteriaDomain === domain}
                        onClick={async () => {
                          setSavingCriteriaDomain(domain);
                          const t = toast.loading(`Saving ${domain} criteria...`);
                          try {
                            const res = await fetch('/api/settings', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                type: 'intern-analysis-criteria',
                                domain_code: domain,
                                criteria: criteria.map((c, i) => ({ ...c, sort_order: i + 1 }))
                              })
                            });
                            if (!res.ok) throw new Error((await res.json()).error);
                            toast.success(`${domain} criteria saved!`, { id: t });
                          } catch (err: any) {
                            toast.error(err.message, { id: t });
                          } finally {
                            setSavingCriteriaDomain(null);
                          }
                        }}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg text-[10px] font-semibold transition-colors"
                      >
                        {savingCriteriaDomain === domain ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                        Save {AI_DOMAIN_LABELS[domain]} Criteria
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

    </PageWrapper>
  );
}

