-- Add public leaderboard toggle to intern_analysis_settings
ALTER TABLE intern_analysis_settings
ADD COLUMN IF NOT EXISTS public_leaderboard_open BOOLEAN DEFAULT false;

-- Create waitlist_subscribers table for "Notify me" feature
CREATE TABLE IF NOT EXISTS waitlist_subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: Ensure publication is enabled for real-time changes
ALTER PUBLICATION supabase_realtime ADD TABLE intern_analysis_settings;
