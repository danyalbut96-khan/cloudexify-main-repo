-- Task 7: Move settings to batches

-- 1. Add max_projects to batches
ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS max_projects INTEGER DEFAULT 4;

-- 2. Drop removed columns from intern_analysis_settings
ALTER TABLE public.intern_analysis_settings 
DROP COLUMN IF EXISTS max_projects_per_intern,
DROP COLUMN IF EXISTS public_leaderboard_open,
DROP COLUMN IF EXISTS batch_coming_soon_message;
