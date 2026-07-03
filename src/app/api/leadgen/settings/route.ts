import { createClient, getAdminClient } from '@/lib/supabase/server';
import { isRateLimited } from '@/lib/utils';
import { logAction } from '@/lib/server-utils';
import { NextRequest, NextResponse } from 'next/server';
import { verifyDomainDns } from '@/lib/outreach/email';

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: creds, error } = await supabase
      .from('api_credentials')
      .select('*');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Mask sensitive fields to protect credentials in UI transit
    const maskedCreds = (creds || []).map((c: any) => {
      const maskedData = { ...c.credential_data };
      if (maskedData.apiKey) {
        maskedData.apiKey = maskedData.apiKey.slice(0, 6) + '••••••••' + maskedData.apiKey.slice(-4);
      }
      return {
        ...c,
        credential_data: maskedData
      };
    });

    return NextResponse.json(maskedCreds);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, provider, credentialData } = body;

    // 1. Test Connection Action
    if (action === 'test') {
      const { apiKey } = credentialData;
      if (!apiKey || apiKey.includes('••••••••')) {
        // If it's the masked version, read the stored one from DB
        const adminSupabase = getAdminClient();
        const { data: existing } = await adminSupabase
          .from('api_credentials')
          .select('credential_data')
          .eq('provider', provider)
          .single();
        if (existing?.credential_data?.apiKey) {
          credentialData.apiKey = existing.credential_data.apiKey;
        } else {
          return NextResponse.json({ success: false, error: 'API key is missing.' });
        }
      }

      const activeKey = credentialData.apiKey;

      try {
        if (provider === 'openrouter') {
          const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${activeKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'openai/gpt-4o-mini',
              messages: [{ role: 'user', content: 'hello' }],
              max_tokens: 1
            })
          });
          if (!res.ok) {
            throw new Error(`OpenRouter returned HTTP ${res.status}: ${await res.text()}`);
          }
        } else if (provider === 'google_places') {
          const res = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=Islamabad&key=${activeKey}`);
          const data = await res.json();
          if (data.status === 'REQUEST_DENIED') {
            throw new Error(data.error_message || 'API key is invalid.');
          }
        } else if (provider === 'gupshup') {
          // Check Gupshup template list api or credentials verify
          const res = await fetch('https://api.gupshup.io/sm/api/v1/template/list', {
            headers: { 'apikey': activeKey }
          });
          if (!res.ok) {
            throw new Error(`Gupshup API returned HTTP ${res.status}`);
          }
        } else if (provider === 'email_smtp') {
          // Test Resend domains
          const res = await fetch('https://api.resend.com/domains', {
            headers: { 'Authorization': `Bearer ${activeKey}` }
          });
          if (!res.ok) {
            throw new Error(`Resend API returned HTTP ${res.status}`);
          }
        }

        return NextResponse.json({ success: true });
      } catch (testErr: any) {
        return NextResponse.json({ success: false, error: testErr.message });
      }
    }

    // 2. Verify Domain Action
    if (action === 'verify_domain') {
      const { domain } = body;
      if (!domain) {
        return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
      }
      const dnsResult = await verifyDomainDns(domain);
      return NextResponse.json(dnsResult);
    }

    // 3. Save Credential Action
    if (action === 'save') {
      // Check if updating without changing key (masked API key sent from client)
      if (credentialData.apiKey && credentialData.apiKey.includes('••••••••')) {
        const adminSupabase = getAdminClient();
        const { data: existing } = await adminSupabase
          .from('api_credentials')
          .select('credential_data')
          .eq('provider', provider)
          .single();
        if (existing?.credential_data?.apiKey) {
          credentialData.apiKey = existing.credential_data.apiKey;
        }
      }

      // Read domain verification status if it is email_smtp
      let isVerified = true;
      if (provider === 'email_smtp' && credentialData.domain) {
        const dnsCheck = await verifyDomainDns(credentialData.domain);
        isVerified = dnsCheck.allPassed;
      }

      const { data, error } = await supabase
        .from('api_credentials')
        .upsert({
          provider,
          credential_data: credentialData,
          is_verified: isVerified,
          updated_at: new Date().toISOString()
        }, { onConflict: 'provider' })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await logAction(user.email!, `Configured API credential for ${provider}`, 'settings', data.id);
      return NextResponse.json({ success: true, credential: data });
    }

    return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
