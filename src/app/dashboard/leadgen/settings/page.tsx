'use client';

import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Save, Radio, CheckCircle2, XCircle, Search, Mail, ShieldAlert, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LeadGenSettingsPage() {
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Email DNS verification states
  const [emailDomain, setEmailDomain] = useState('');
  const [dnsResults, setDnsResults] = useState<any>(null);
  const [checkingDns, setCheckingDns] = useState(false);

  // Provider states
  const [openRouterKey, setOpenRouterKey] = useState('');
  const [googleKey, setGoogleKey] = useState('');
  const [gupshupKey, setGupshupKey] = useState('');
  const [gupshupSender, setGupshupSender] = useState('');
  const [gupshupApp, setGupshupApp] = useState('');
  const [gupshupTemplate, setGupshupTemplate] = useState('');
  const [emailKey, setEmailKey] = useState('');

  // Loading/Testing states
  const [testing, setTesting] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leadgen/settings');
      if (!res.ok) throw new Error('Failed to load credentials');
      const data = await res.json();
      setCredentials(data);

      // Parse loaded keys
      const openRouter = data.find((c: any) => c.provider === 'openrouter');
      if (openRouter) setOpenRouterKey(openRouter.credential_data.apiKey || '');

      const google = data.find((c: any) => c.provider === 'google_places');
      if (google) setGoogleKey(google.credential_data.apiKey || '');

      const gupshup = data.find((c: any) => c.provider === 'gupshup');
      if (gupshup) {
        setGupshupKey(gupshup.credential_data.apiKey || '');
        setGupshupSender(gupshup.credential_data.sourceNumber || '');
        setGupshupApp(gupshup.credential_data.appName || 'CloudExify');
        setGupshupTemplate(gupshup.credential_data.templateId || 'cloudexify_followup');
      }

      const email = data.find((c: any) => c.provider === 'email_smtp');
      if (email) {
        setEmailKey(email.credential_data.apiKey || '');
        setEmailDomain(email.credential_data.domain || '');
        if (email.credential_data.domain) {
          handleCheckDns(email.credential_data.domain);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Error loading settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (provider: string, credentialData: any) => {
    setSaving(prev => ({ ...prev, [provider]: true }));
    const saveToast = toast.loading(`Saving ${provider} configuration...`);
    try {
      const res = await fetch('/api/leadgen/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          provider,
          credentialData
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save configuration.');

      toast.success(`${provider} configuration saved successfully!`, { id: saveToast });
      fetchSettings();
    } catch (err: any) {
      toast.error(err.message || 'Error saving settings', { id: saveToast });
    } finally {
      setSaving(prev => ({ ...prev, [provider]: false }));
    }
  };

  const handleTestConnection = async (provider: string, credentialData: any) => {
    setTesting(prev => ({ ...prev, [provider]: true }));
    const testToast = toast.loading(`Testing connection for ${provider}...`);
    try {
      const res = await fetch('/api/leadgen/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test',
          provider,
          credentialData
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Connection verification failed.');
      }

      toast.success(`${provider} connection verified successfully!`, { id: testToast });
    } catch (err: any) {
      toast.error(err.message || 'Connection check failed', { id: testToast });
    } finally {
      setTesting(prev => ({ ...prev, [provider]: false }));
    }
  };

  const handleCheckDns = async (domain = emailDomain) => {
    if (!domain) {
      toast.error('Please input a domain to verify.');
      return;
    }
    setCheckingDns(true);
    try {
      const res = await fetch('/api/leadgen/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_domain',
          domain
        })
      });
      const data = await res.json();
      setDnsResults(data);

      if (data.allPassed) {
        toast.success('All DNS records verified! Email stage can be enabled.');
      } else {
        toast.error('DNS record verification failed. Check expected records below.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to check DNS records.');
    } finally {
      setCheckingDns(false);
    }
  };

  return (
    <PageWrapper title="Lead Generation Settings">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* API Credentials Forms */}
        <div className="space-y-6">
          {/* OpenRouter API Credentials */}
          <Card>
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
              <KeyRound className="h-5 w-5 text-blue-500" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">OpenRouter API</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">OpenRouter API Key</label>
                <input
                  type="password"
                  value={openRouterKey}
                  onChange={(e) => setOpenRouterKey(e.target.value)}
                  placeholder="sk-or-v1-••••••••"
                  className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>
              <div className="flex justify-end space-x-2.5 pt-2 border-t border-slate-50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestConnection('openrouter', { apiKey: openRouterKey })}
                  isLoading={testing['openrouter']}
                  className="bg-white"
                >
                  Test Connection
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSave('openrouter', { apiKey: openRouterKey })}
                  isLoading={saving['openrouter']}
                >
                  <Save className="h-3.5 w-3.5 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          </Card>

          {/* Google Places API Credentials */}
          <Card>
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
              <Search className="h-5 w-5 text-teal-500" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Google Places API</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Google Places API Key</label>
                <input
                  type="password"
                  value={googleKey}
                  onChange={(e) => setGoogleKey(e.target.value)}
                  placeholder="AIzaSy••••••••"
                  className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>
              <div className="flex justify-end space-x-2.5 pt-2 border-t border-slate-50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestConnection('google_places', { apiKey: googleKey })}
                  isLoading={testing['google_places']}
                  className="bg-white"
                >
                  Test Connection
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSave('google_places', { apiKey: googleKey })}
                  isLoading={saving['google_places']}
                >
                  <Save className="h-3.5 w-3.5 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          </Card>

          {/* Gupshup WhatsApp API Credentials */}
          <Card>
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
              <Radio className="h-5 w-5 text-emerald-500" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Gupshup WhatsApp BSP</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Gupshup API Key</label>
                <input
                  type="password"
                  value={gupshupKey}
                  onChange={(e) => setGupshupKey(e.target.value)}
                  placeholder="Gupshup API Token"
                  className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Meta Sender Number</label>
                  <input
                    type="text"
                    value={gupshupSender}
                    onChange={(e) => setGupshupSender(e.target.value)}
                    placeholder="e.g. 923411949277"
                    className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">App Name</label>
                  <input
                    type="text"
                    value={gupshupApp}
                    onChange={(e) => setGupshupApp(e.target.value)}
                    placeholder="e.g. CloudExify"
                    className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Pre-Approved Template ID</label>
                <input
                  type="text"
                  value={gupshupTemplate}
                  onChange={(e) => setGupshupTemplate(e.target.value)}
                  placeholder="cloudexify_followup"
                  className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none bg-white"
                />
              </div>
              <div className="flex justify-end space-x-2.5 pt-2 border-t border-slate-50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestConnection('gupshup', { apiKey: gupshupKey })}
                  isLoading={testing['gupshup']}
                  className="bg-white"
                >
                  Test Connection
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSave('gupshup', {
                    apiKey: gupshupKey,
                    sourceNumber: gupshupSender,
                    appName: gupshupApp,
                    templateId: gupshupTemplate
                  })}
                  isLoading={saving['gupshup']}
                >
                  <Save className="h-3.5 w-3.5 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Email & DNS Verification Controls */}
        <div className="space-y-6">
          {/* Resend Provider Setup */}
          <Card>
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
              <Mail className="h-5 w-5 text-indigo-500" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Email Provider (Resend API)</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Resend API Key</label>
                <input
                  type="password"
                  value={emailKey}
                  onChange={(e) => setEmailKey(e.target.value)}
                  placeholder="re_••••••••"
                  className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Sending Domain</label>
                <input
                  type="text"
                  value={emailDomain}
                  onChange={(e) => setEmailDomain(e.target.value)}
                  placeholder="e.g. cloudexify.com"
                  className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none bg-white"
                />
              </div>
              <div className="flex justify-end space-x-2.5 pt-2 border-t border-slate-50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestConnection('email_smtp', { apiKey: emailKey })}
                  isLoading={testing['email_smtp']}
                  className="bg-white"
                >
                  Test Connection
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSave('email_smtp', { apiKey: emailKey, domain: emailDomain })}
                  isLoading={saving['email_smtp']}
                >
                  <Save className="h-3.5 w-3.5 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          </Card>

          {/* DNS SPF/DKIM/DMARC Verification */}
          <Card>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="h-5 w-5 text-amber-500" />
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">DNS Record Verification</h2>
              </div>
              {dnsResults?.allPassed ? (
                <Badge variant="success">Verified</Badge>
              ) : (
                <Badge variant="danger">Pending DNS Check</Badge>
              )}
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Before sending cold emails, your sending domain DNS records (SPF, DKIM, DMARC) must be fully configured to prevent spam categorization and bounces.
            </p>

            <div className="flex space-x-2 mb-6">
              <input
                type="text"
                value={emailDomain}
                onChange={(e) => setEmailDomain(e.target.value)}
                placeholder="domain.com"
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none bg-white font-medium"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleCheckDns()}
                isLoading={checkingDns}
              >
                Verify Domain DNS
              </Button>
            </div>

            {dnsResults && (
              <div className="space-y-4">
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <table className="min-w-full divide-y divide-slate-100 text-left text-xs font-semibold text-slate-600">
                    <thead className="bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-2">Record</th>
                        <th className="px-4 py-2">Expected Prefix</th>
                        <th className="px-4 py-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="px-4 py-3 font-bold text-slate-800">SPF</td>
                        <td className="px-4 py-3 font-mono text-[9px] truncate max-w-[200px] text-slate-400">{dnsResults.spf.expected}</td>
                        <td className="px-4 py-3 text-right">
                          {dnsResults.spf.status === 'pass' ? (
                            <span className="flex items-center justify-end text-emerald-600 font-bold"><CheckCircle2 className="h-4 w-4 mr-1" /> Pass</span>
                          ) : (
                            <span className="flex items-center justify-end text-rose-600 font-bold"><XCircle className="h-4 w-4 mr-1" /> Fail</span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-bold text-slate-800">DKIM</td>
                        <td className="px-4 py-3 font-mono text-[9px] truncate max-w-[200px] text-slate-400">{dnsResults.dkim.expected}</td>
                        <td className="px-4 py-3 text-right">
                          {dnsResults.dkim.status === 'pass' ? (
                            <span className="flex items-center justify-end text-emerald-600 font-bold"><CheckCircle2 className="h-4 w-4 mr-1" /> Pass</span>
                          ) : (
                            <span className="flex items-center justify-end text-rose-600 font-bold"><XCircle className="h-4 w-4 mr-1" /> Fail</span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-bold text-slate-800">DMARC</td>
                        <td className="px-4 py-3 font-mono text-[9px] truncate max-w-[200px] text-slate-400">{dnsResults.dmarc.expected}</td>
                        <td className="px-4 py-3 text-right">
                          {dnsResults.dmarc.status === 'pass' ? (
                            <span className="flex items-center justify-end text-emerald-600 font-bold"><CheckCircle2 className="h-4 w-4 mr-1" /> Pass</span>
                          ) : (
                            <span className="flex items-center justify-end text-rose-600 font-bold"><XCircle className="h-4 w-4 mr-1" /> Fail</span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {!dnsResults.allPassed && (
                  <div className="bg-rose-50/70 border border-rose-100 rounded-xl p-3.5 text-xs text-rose-700 leading-normal font-medium flex items-start space-x-2.5">
                    <ShieldAlert className="h-4.5 w-4.5 text-rose-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Warning:</strong> Automated Cold Email outreach execution is blocked until your domain SPF, DKIM, and DMARC records pass verification checks.
                    </span>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
