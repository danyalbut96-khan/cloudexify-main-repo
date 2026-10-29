-- SECURITY HARDENING MIGRATION (REVIEW REQUIRED)
-- Do not apply to production until the shared Internship Portal submission path is
-- moved behind a server-side endpoint and all consumers of private Storage objects
-- have been updated to use short-lived signed URLs.
-- This file is intentionally not executed by this PR.

begin;

create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.admin_profiles ap
    where ap.admin_id = auth.uid()
  );
$$;

revoke all on function public.is_admin_user() from public, anon;
grant execute on function public.is_admin_user() to authenticated;

-- Prevent authenticated users from writing the privileged role column even when
-- an old policy accidentally allows updating their own profile row.
revoke all on table public.admin_profiles from public, anon, authenticated;
grant select on table public.admin_profiles to authenticated;
grant update (display_name, avatar_url, signature_url, designation)
  on table public.admin_profiles to authenticated;

do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'admin_profiles'
  loop
    execute format('drop policy if exists %I on public.admin_profiles', p.policyname);
  end loop;
end $$;

create policy admin_profiles_select_own
  on public.admin_profiles for select to authenticated
  using (admin_id = auth.uid());

create policy admin_profiles_update_own
  on public.admin_profiles for update to authenticated
  using (admin_id = auth.uid())
  with check (admin_id = auth.uid());

-- Support tickets: public callers may submit a bounded ticket but may never
-- enumerate tickets or change ticket status/replies. Admin reads and updates
-- are checked server-side by the database policy as defense in depth.
alter table public.support_tickets enable row level security;
do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'support_tickets'
  loop
    execute format('drop policy if exists %I on public.support_tickets', p.policyname);
  end loop;
end $$;

create policy support_tickets_public_insert
  on public.support_tickets for insert to anon, authenticated
  with check (
    length(btrim(user_name)) between 1 and 120
    and length(btrim(user_email)) between 3 and 254
    and user_email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    and length(btrim(subject)) between 1 and 200
    and length(btrim(description)) between 1 and 5000
    and status = 'open'
  );

create policy support_tickets_admin_select
  on public.support_tickets for select to authenticated
  using (public.is_admin_user());

create policy support_tickets_admin_update
  on public.support_tickets for update to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- Public verification page uses a server-side service-role lookup and only renders
-- safe fields. The underlying table must not be directly readable or writable by
-- anonymous/authenticated browser clients.
alter table public.document_verifications enable row level security;
do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'document_verifications'
  loop
    execute format('drop policy if exists %I on public.document_verifications', p.policyname);
  end loop;
end $$;

create policy document_verifications_admin_select
  on public.document_verifications for select to authenticated
  using (public.is_admin_user());
create policy document_verifications_admin_insert
  on public.document_verifications for insert to authenticated
  with check (public.is_admin_user());
create policy document_verifications_admin_update
  on public.document_verifications for update to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());
create policy document_verifications_admin_delete
  on public.document_verifications for delete to authenticated
  using (public.is_admin_user());

-- IMPORTANT: applying the following policy reset blocks direct anonymous project
-- submission. Do not apply until the Internship Portal has a server-side submission
-- endpoint. No public SELECT policy is restored, so candidate submissions and AI
-- feedback cannot be browsed from the client.
alter table public.intern_projects enable row level security;
do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'intern_projects'
  loop
    execute format('drop policy if exists %I on public.intern_projects', p.policyname);
  end loop;
end $$;

create policy intern_projects_admin_select
  on public.intern_projects for select to authenticated
  using (public.is_admin_user());
create policy intern_projects_admin_insert
  on public.intern_projects for insert to authenticated
  with check (public.is_admin_user());
create policy intern_projects_admin_update
  on public.intern_projects for update to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());
create policy intern_projects_admin_delete
  on public.intern_projects for delete to authenticated
  using (public.is_admin_user());


-- Harden existing SECURITY DEFINER functions. Trigger functions do not need to be
-- directly executable by browser roles; RPC functions are allowlisted below.
do $
declare f record;
begin
  for f in
    select p.oid::regprocedure as signature
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.prosecdef
  loop
    execute format('alter function %s set search_path = pg_catalog, public, auth', f.signature);
    execute format('revoke all on function %s from public, anon, authenticated', f.signature);
  end loop;
end $;

-- Only authenticated callers may invoke these RPCs; privileged operations still
-- enforce Super Admin checks inside their function bodies.
grant execute on function public.is_admin_user() to authenticated;
grant execute on function public.delete_admin_user(uuid) to authenticated;
grant execute on function public.get_admin_team_members() to authenticated;
grant execute on function public.toggle_admin_status(uuid, text) to authenticated;
grant execute on function public.update_admin_password(uuid, text) to authenticated;

-- Storage bucket visibility is deliberately not changed in this migration because
-- Internship Portal currently consumes stored document URLs. Before making
-- intern-documents, payment_receipts, resumes, admin-signatures, or tasks private,
-- migrate those consumers to short-lived signed URLs in a coordinated follow-up.
-- Also enable Supabase Auth leaked-password protection in the project dashboard.

commit;
