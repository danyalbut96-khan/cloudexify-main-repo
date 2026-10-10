-- Fix 1: Remove auto compute
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule('update_batch_statuses_daily');
  END IF;
END $$;

DROP FUNCTION IF EXISTS public.update_batch_statuses();

ALTER TABLE public.batches DROP COLUMN IF EXISTS status_override;

-- Fix 2: Insert missing batch domains for existing interns
INSERT INTO public.batch_domains (batch_id, domain, seats_total, seats_filled, is_open)
SELECT DISTINCT batch_id, domain, 0, 0, true
FROM public.interns
WHERE batch_id IS NOT NULL AND domain IS NOT NULL
ON CONFLICT (batch_id, domain) DO NOTHING;

-- Recalculate seats_filled
UPDATE public.batch_domains bd
SET seats_filled = (
    SELECT COUNT(*) 
    FROM public.interns i 
    WHERE i.batch_id = bd.batch_id 
      AND i.domain = bd.domain 
      AND i.status NOT IN ('Rejected', 'Waitlisted')
);
