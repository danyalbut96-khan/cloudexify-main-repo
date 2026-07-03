-- Enable UUID generation if not already enabled
create extension if not exists "pgcrypto";

-- Leads table
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  category text not null check (category in ('restaurant', 'clinic', 'beauty_salon')),
  city text not null default 'Islamabad',
  address text,
  phone text,
  email text,
  facebook_url text,
  google_place_id text unique,
  google_rating numeric,
  google_review_count integer,
  personalization_detail text,
  status text not null default 'discovered'
    check (status in (
      'discovered', 'enriched', 'emailed', 'followed_up',
      'replied', 'qualified', 'unreachable', 'declined'
    )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_leads_status on leads(status);
create index if not exists idx_leads_category on leads(category);
create index if not exists idx_leads_city on leads(city);

-- Outreach events (every email/whatsapp message sent or received)
create table if not exists outreach_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  channel text not null check (channel in ('email', 'whatsapp')),
  direction text not null check (direction in ('outbound', 'inbound')),
  content text not null,
  status text not null default 'sent'
    check (status in ('sent', 'delivered', 'opened', 'replied', 'bounced', 'failed')),
  created_at timestamptz not null default now()
);

create index if not exists idx_outreach_lead on outreach_events(lead_id);

-- Pipeline stage configuration (which OpenRouter model + prompt per stage)
create table if not exists pipeline_stage_config (
  id uuid primary key default gen_random_uuid(),
  stage_key text not null unique
    check (stage_key in ('discovery', 'enrichment', 'email', 'whatsapp', 'handoff')),
  enabled boolean not null default false,
  openrouter_model text not null default 'anthropic/claude-3.5-sonnet',
  system_prompt text,
  config jsonb default '{}'::jsonb,  -- e.g. { "daily_send_limit": 30, "followup_delay_days": 3 }
  updated_at timestamptz not null default now()
);

-- Seed default rows for the 5 stages
insert into pipeline_stage_config (stage_key, enabled, config) values
  ('discovery', false, '{"city": "Islamabad", "categories": ["restaurant", "clinic", "beauty_salon"]}'::jsonb),
  ('enrichment', false, '{}'::jsonb),
  ('email', false, '{"daily_send_limit": 30}'::jsonb),
  ('whatsapp', false, '{"followup_delay_days": 3}'::jsonb),
  ('handoff', false, '{}'::jsonb)
on conflict (stage_key) do nothing;

-- API credentials (store references/keys — encrypt at rest via Supabase Vault if available)
create table if not exists api_credentials (
  id uuid primary key default gen_random_uuid(),
  provider text not null unique
    check (provider in ('openrouter', 'google_places', 'gupshup', 'email_smtp')),
  credential_data jsonb not null default '{}'::jsonb,
  is_verified boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table leads enable row level security;
alter table outreach_events enable row level security;
alter table pipeline_stage_config enable row level security;
alter table api_credentials enable row level security;

-- Policies (authenticated users have full read/write access)
drop policy if exists "Admin full access to leads" on leads;
create policy "Admin full access to leads" on leads for all to authenticated using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Admin full access to outreach_events" on outreach_events;
create policy "Admin full access to outreach_events" on outreach_events for all to authenticated using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Admin full access to pipeline_stage_config" on pipeline_stage_config;
create policy "Admin full access to pipeline_stage_config" on pipeline_stage_config for all to authenticated using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Admin full access to api_credentials" on api_credentials;
create policy "Admin full access to api_credentials" on api_credentials for all to authenticated using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
