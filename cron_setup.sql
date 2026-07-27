-- 1. Add rejected_at column to interns table
ALTER TABLE public.interns ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE;

-- 2. Create the storage bucket for task uploads (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tasks', 'tasks', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up Storage Policies for Tasks bucket
-- Allow public read access to tasks bucket
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'tasks');

-- Allow admins to insert/upload files to tasks bucket
CREATE POLICY "Admin Upload Access" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'tasks' 
  AND auth.uid() IN (SELECT admin_id FROM public.admin_profiles)
);

-- Allow admins to delete files
CREATE POLICY "Admin Delete Access" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'tasks' 
  AND auth.uid() IN (SELECT admin_id FROM public.admin_profiles)
);

-- 4. Set up Auto-Delete Cron Job (7 days) for Rejected Interns
-- NOTE: pg_cron extension MUST be enabled in Supabase via Dashboard -> Database -> Extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Remove the job if it already exists to avoid conflicts
SELECT cron.unschedule('delete_rejected_interns_job');

-- Schedule the job to run every day at midnight
SELECT cron.schedule(
  'delete_rejected_interns_job',
  '0 0 * * *',
  $$ DELETE FROM public.interns WHERE status = 'Rejected' AND rejected_at < NOW() - INTERVAL '7 days'; $$
);

-- 5. Alter tasks table for flexible duration_label
ALTER TABLE public.tasks DROP COLUMN IF EXISTS week_number;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS duration_label TEXT NOT NULL DEFAULT 'Project';
