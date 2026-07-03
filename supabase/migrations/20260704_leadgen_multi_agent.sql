-- Multi-Agent Pipeline Schema Additions
alter table leads add column if not exists locked_by text;
alter table leads add column if not exists locked_at timestamptz;
alter table leads add column if not exists has_whatsapp boolean default false;

-- Table for global running locks per agent to prevent cron overlapping
create table if not exists agent_run_state (
  agent_name text primary key,
  is_running boolean not null default false,
  started_at timestamptz
);

-- Seed defaults
insert into agent_run_state (agent_name, is_running) values 
  ('agent_1_discovery', false), 
  ('agent_2_email', false), 
  ('agent_3_whatsapp', false)
on conflict (agent_name) do nothing;

-- Function for atomic lead locking at the Postgres database level
create or replace function try_lock_lead(p_lead_id uuid, p_agent text)
returns boolean as $$
declare
  updated_rows int;
begin
  update leads
  set locked_by = p_agent, locked_at = now()
  where id = p_lead_id
    and (locked_by is null or locked_at < now() - interval '3 minutes');
  get diagnostics updated_rows = row_count;
  return updated_rows > 0;
end;
$$ language plpgsql;
