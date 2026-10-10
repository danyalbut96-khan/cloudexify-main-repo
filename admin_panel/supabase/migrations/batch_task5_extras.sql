-- Task 5: Extras (Archive Feature)

-- Add is_archived column to batches table
ALTER TABLE public.batches 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
