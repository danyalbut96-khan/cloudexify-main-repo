-- Migration for AI Feedback visibility
ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS release_ai_feedback BOOLEAN DEFAULT false;
ALTER TABLE public.intern_projects ADD COLUMN IF NOT EXISTS is_feedback_hidden BOOLEAN DEFAULT false;
