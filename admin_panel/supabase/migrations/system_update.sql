-- 1. Add status to interns table
ALTER TABLE public.interns ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending';

-- Update existing interns to 'Accepted' so current students don't lose access
UPDATE public.interns SET status = 'Accepted' WHERE status = 'Pending' OR status IS NULL;

-- 2. Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    week_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access for admins on tasks" ON public.tasks;
CREATE POLICY "Allow all access for admins on tasks" ON public.tasks 
USING (auth.uid() IN (SELECT admin_id FROM admin_profiles)) 
WITH CHECK (auth.uid() IN (SELECT admin_id FROM admin_profiles));

DROP POLICY IF EXISTS "Allow read access for tasks" ON public.tasks;
CREATE POLICY "Allow read access for tasks" ON public.tasks FOR SELECT USING (true);
