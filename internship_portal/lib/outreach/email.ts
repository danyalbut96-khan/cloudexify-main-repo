import dns from 'dns';
import { getStoredCredential } from '../ai/openrouter';

export interface DnsVerificationResult {
  spf: { status: 'pass' | 'fail'; record: string; expected: string };
  dkim: { status: 'pass' | 'fail'; record: string; expected: string };
  dmarc: { status: 'pass' | 'fail'; record: string; expected: string };
  allPassed: boolean;
}

export async function verifyDomainDns(domain: string, selector = 'resend'): Promise<DnsVerificationResult> {
  const result: DnsVerificationResult = {
    spf: { status: 'fail', record: '', expected: 'v=spf1 include:amazonses.com ~all (or similar)' },
    dkim: { status: 'fail', record: '', expected: 'v=DKIM1; k=rsa; p=...' },
    dmarc: { status: 'fail', record: '', expected: 'v=DMARC1; p=none' },
    allPassed: false
  };

  if (!domain) return result;

  // 1. Verify SPF
  try {
    const records = await dns.promises.resolveTxt(domain);
    const flatRecords = records.flat();
    const spf = flatRecords.find(r => r.startsWith('v=spf1'));
    if (spf) {
      result.spf.record = spf;
      result.spf.status = 'pass';
    }
  } catch (err) {
    result.spf.record = 'No SPF record found';
  }

  // 2. Verify DKIM
  const selectors = ['resend', 'resend-a', 'resend-b', 'resend-c'];
  for (const sel of selectors) {
    try {
      const records = await dns.promises.resolveTxt(`${sel}._domainkey.${domain}`);
      const flatRecords = records.flat();
      const dkim = flatRecords.find(r => r.startsWith('v=DKIM1') || r.includes('p='));
      if (dkim) {
        result.dkim.record = dkim;
        result.dkim.status = 'pass';
        break;
      }
    } catch (err) {
      result.dkim.record = `No DKIM record found at ${sel}._domainkey.${domain}`;
    }
  }

  // 3. Verify DMARC
  try {
    const records = await dns.promises.resolveTxt(`_dmarc.${domain}`);
    const flatRecords = records.flat();
    const dmarc = flatRecords.find(r => r.startsWith('v=DMARC1'));
    if (dmarc) {
      result.dmarc.record = dmarc;
      result.dmarc.status = 'pass';
    }
  } catch (err) {
    result.dmarc.record = 'No DMARC record found at _dmarc.' + domain;
  }

  result.allPassed = result.spf.status === 'pass' && result.dkim.status === 'pass' && result.dmarc.status === 'pass';
  return result;
}

export async function sendOutreachEmail({
  to,
  subject,
  body
}: {
  to: string;
  subject: string;
  body: string;
}) {
  const creds = await getStoredCredential('email_smtp');
  if (!creds || !creds.apiKey || !creds.domain) {
    throw new Error('Email provider credentials or sending domain are not configured.');
  }

  const { apiKey, domain, bypassDnsCheck } = creds;

  // Ensure DNS check passes before sending (unless bypassed in settings)
  if (!bypassDnsCheck) {
    const dnsStatus = await verifyDomainDns(domain);
    if (!dnsStatus.allPassed) {
      throw new Error('DNS SPF/DKIM/DMARC records are not verified for the domain: ' + domain);
    }
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: `CloudExify Growth <outreach@${domain}>`,
      to,
      subject,
      html: body.replace(/\n/g, '<br />')
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send email via Resend: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.id as string;
}
