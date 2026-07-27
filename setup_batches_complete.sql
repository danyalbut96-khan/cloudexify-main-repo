-- 1. Ensure UUID extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create the batches table if it does not exist at all
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'coming',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. If the table already existed from the old system, safely add the new status column
ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'coming';

-- 4. Safely migrate old data (from 'is_active' to 'status') and drop the old column
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'batches' AND column_name = 'is_active') THEN
    -- Map old boolean logic to new 3-state text logic
    UPDATE public.batches SET status = 'accepting' WHERE is_active = true;
    UPDATE public.batches SET status = 'completed' WHERE is_active = false AND end_date < CURRENT_DATE;
    UPDATE public.batches SET status = 'active' WHERE is_active = false AND start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE;
    
    -- Drop the old column to avoid confusion
    ALTER TABLE public.batches DROP COLUMN is_active;
  END IF;
END $$;

-- 5. Clean up the old boolean unique index
DROP INDEX IF EXISTS idx_one_active_batch;

-- 6. Create the new unique index (ensures only 1 batch can be 'accepting' at a time)
DROP INDEX IF EXISTS idx_one_accepting_batch;
CREATE UNIQUE INDEX idx_one_accepting_batch ON public.batches (status) WHERE status = 'accepting';

-- 7. Secure the table with Row Level Security (RLS)
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access for all" ON public.batches;
CREATE POLICY "Allow read access for all" ON public.batches FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all access for admins" ON public.batches;
CREATE POLICY "Allow all access for admins" ON public.batches USING (auth.uid() IN (SELECT admin_id FROM admin_profiles)) WITH CHECK (auth.uid() IN (SELECT admin_id FROM admin_profiles));
