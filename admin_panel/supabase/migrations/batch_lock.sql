-- Add documents_locked column to batches table
ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS documents_locked BOOLEAN DEFAULT false;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
