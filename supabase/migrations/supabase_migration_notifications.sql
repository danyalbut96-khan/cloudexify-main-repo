-- =========================================================================
-- NOTIFICATIONS TABLE MIGRATION
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('registration', 'project_submission', 'system')),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access to admin_notifications" ON public.admin_notifications;
CREATE POLICY "Admin full access to admin_notifications"
  ON public.admin_notifications FOR ALL
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Public insert so the portal API routes can generate notifications
DROP POLICY IF EXISTS "Public can insert admin_notifications" ON public.admin_notifications;
CREATE POLICY "Public can insert admin_notifications"
  ON public.admin_notifications FOR INSERT
  TO anon
  WITH CHECK (true);
