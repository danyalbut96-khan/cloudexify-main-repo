-- Task 1: Auto Status Migration

-- 1. Add status_override column to batches
ALTER TABLE public.batches 
ADD COLUMN IF NOT EXISTS status_override VARCHAR(20);

-- 2. Create function to automatically update batch statuses
CREATE OR REPLACE FUNCTION public.update_batch_statuses()
RETURNS void AS $$
BEGIN
  UPDATE public.batches
  SET status = CASE
    WHEN status_override IS NOT NULL THEN status_override
    WHEN CURRENT_DATE <= registration_deadline THEN 'accepting'
    WHEN CURRENT_DATE > registration_deadline AND CURRENT_DATE < start_date THEN 'coming'
    WHEN CURRENT_DATE >= start_date AND CURRENT_DATE <= end_date THEN 'active'
    WHEN CURRENT_DATE > end_date THEN 'completed'
    ELSE 'coming' -- fallback
  END
  WHERE status_override IS NULL OR status != status_override;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Ensure pg_cron extension is available (if not already handled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 4. Schedule the job to run daily at midnight (UTC)
SELECT cron.schedule('update_batch_statuses_daily', '0 0 * * *', 'SELECT public.update_batch_statuses()');

-- Run it once immediately to sync existing data
SELECT public.update_batch_statuses();
