-- 1. Add rejected_at column to interns table
ALTER TABLE public.interns ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE;

-- 2. Create the storage bucket for task uploads (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tasks', 'tasks', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up Storage Policies for Tasks bucket
DROP POLICY IF EXISTS "Tasks Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Tasks Admin Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Tasks Admin Delete Access" ON storage.objects;

-- Allow public read access to tasks bucket
CREATE POLICY "Tasks Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'tasks');

-- Allow admins to insert/upload files to tasks bucket
CREATE POLICY "Tasks Admin Upload Access" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'tasks' 
  AND auth.uid() IN (SELECT admin_id FROM public.admin_profiles)
);

-- Allow admins to delete files
CREATE POLICY "Tasks Admin Delete Access" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'tasks' 
  AND auth.uid() IN (SELECT admin_id FROM public.admin_profiles)
);

-- 4. Set up Auto-Delete Cron Job (7 days) for Rejected Interns
-- NOTE: pg_cron extension MUST be enabled in Supabase via Dashboard -> Database -> Extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Remove the job if it already exists to avoid conflicts
DO $$
BEGIN
  PERFORM cron.unschedule('delete_rejected_interns_job');
EXCEPTION WHEN OTHERS THEN
  -- ignore error if job doesn't exist
END $$;

-- Schedule the job to run every day at midnight
SELECT cron.schedule(
  'delete_rejected_interns_job',
  '0 0 * * *',
  $$ DELETE FROM public.interns WHERE status = 'Rejected' AND rejected_at < NOW() - INTERVAL '7 days'; $$
);

-- 5. Alter tasks table for flexible duration_label and ensure file_url exists
ALTER TABLE public.tasks DROP COLUMN IF EXISTS week_number;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS duration_label TEXT NOT NULL DEFAULT 'Project';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS file_url TEXT;

-- 6. Reload PostgREST schema cache so the API recognizes the new columns instantly
NOTIFY pgrst, 'reload schema';
