-- =========================================================================
-- ENHANCEMENTS MIGRATION
-- Adds 'is_new' badges, signup toggle, and support_tickets table
-- =========================================================================

-- 1. Add `is_new` columns for dashboard counters
ALTER TABLE public.interns ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT true;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT true;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT true;
ALTER TABLE public.intern_projects ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT true;

-- 2. Add admin_signup_open to settings
ALTER TABLE public.intern_analysis_settings ADD COLUMN IF NOT EXISTS admin_signup_open BOOLEAN DEFAULT true;

-- 3. Create support_tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text UNIQUE NOT NULL,
  user_name text NOT NULL,
  user_email text NOT NULL,
  subject text NOT NULL,
  description text NOT NULL,
  admin_reply text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'answered', 'closed')),
  is_new boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access to support_tickets" ON public.support_tickets;
CREATE POLICY "Admin full access to support_tickets"
  ON public.support_tickets FOR ALL
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can insert support_tickets" ON public.support_tickets;
CREATE POLICY "Public can insert support_tickets"
  ON public.support_tickets FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read support_tickets" ON public.support_tickets;
CREATE POLICY "Public can read support_tickets"
  ON public.support_tickets FOR SELECT
  TO anon
  USING (true);
