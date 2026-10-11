-- Add internship details columns to the batches table
ALTER TABLE public.batches 
ADD COLUMN IF NOT EXISTS duration TEXT DEFAULT '1 Month or 3 Months (Flexible Selection)',
ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT '100% Remote (Online Work)',
ADD COLUMN IF NOT EXISTS projects TEXT DEFAULT '5 Real Client Projects assigned by your PM',
ADD COLUMN IF NOT EXISTS compensation TEXT DEFAULT 'Unpaid (Industrial Experience & Mentorship)',
ADD COLUMN IF NOT EXISTS certificate TEXT DEFAULT 'Yes — Official Cloudexify Internship Certificate';

-- You can now edit these values via the Supabase Dashboard, and soon through your admin panel.
