import { getAdminClient } from '@/lib/supabase/server';

export async function getStoredCredential(provider: 'openrouter' | 'google_places' | 'gupshup' | 'email_smtp') {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('api_credentials')
    .select('credential_data')
    .eq('provider', provider)
    .single();

  if (error || !data) {
    return null;
  }
  return data.credential_data as Record<string, any>;
}

type OpenRouterMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export async function callOpenRouter({
  model,
  messages,
  maxTokens = 1000,
}: {
  model: string;
  messages: OpenRouterMessage[];
  maxTokens?: number;
}) {
  const creds = await getStoredCredential('openrouter');
  const apiKey = creds?.apiKey;
  if (!apiKey) {
    throw new Error('OpenRouter API key is not configured in settings.');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'CloudExify Lead Generation',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter request failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content as string;
}

export async function acquireAgentLock(agentName: string): Promise<boolean> {
  const supabase = getAdminClient();
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('agent_run_state')
    .update({
      is_running: true,
      started_at: new Date().toISOString()
    })
    .eq('agent_name', agentName)
    .or(`is_running.eq.false,started_at.lt.${tenMinutesAgo}`)
    .select();

  return !error && data && data.length > 0;
}

export async function releaseAgentLock(agentName: string): Promise<void> {
  const supabase = getAdminClient();
  await supabase
    .from('agent_run_state')
    .update({ is_running: false })
    .eq('agent_name', agentName);
}
