-- 1. Add new status column
ALTER TABLE public.batches ADD COLUMN status VARCHAR(20) DEFAULT 'coming';

-- 2. Populate status based on existing is_active and dates
UPDATE public.batches SET status = 'accepting' WHERE is_active = true;
UPDATE public.batches SET status = 'completed' WHERE is_active = false AND end_date < CURRENT_DATE;
UPDATE public.batches SET status = 'active' WHERE is_active = false AND start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE;

-- 3. Drop the old unique index on is_active
DROP INDEX IF EXISTS idx_one_active_batch;

-- 4. Create new unique index ensuring only one batch can be 'accepting'
CREATE UNIQUE INDEX idx_one_accepting_batch ON public.batches (status) WHERE status = 'accepting';

-- 5. Drop the old is_active column
ALTER TABLE public.batches DROP COLUMN is_active;
