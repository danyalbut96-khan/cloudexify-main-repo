-- 1. Create Batches Table
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure only one batch can be active at a time (Optional but good practice, though we can enforce it in code)
-- Create a unique index for active batches to prevent multiple active batches
CREATE UNIQUE INDEX idx_one_active_batch ON public.batches (is_active) WHERE is_active = true;

-- Enable RLS for batches
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access for all" ON public.batches FOR SELECT USING (true);
CREATE POLICY "Allow all access for admins" ON public.batches USING (auth.uid() IN (SELECT id FROM admin_profiles));

-- Insert an initial "Batch 1"
INSERT INTO public.batches (name, start_date, end_date, is_active)
VALUES ('Batch 1', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month', true)
ON CONFLICT DO NOTHING;

-- 2. Modify Interns Table to include batch_id
ALTER TABLE public.interns ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES public.batches(id);

-- Assign existing interns to the first batch
UPDATE public.interns 
SET batch_id = (SELECT id FROM public.batches WHERE name = 'Batch 1' LIMIT 1) 
WHERE batch_id IS NULL;

-- 3. Create Monthly Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    week_number INTEGER NOT NULL,
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access for all" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Allow all access for admins" ON public.tasks USING (auth.uid() IN (SELECT id FROM admin_profiles));
