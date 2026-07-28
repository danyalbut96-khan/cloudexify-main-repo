-- Add URL columns to intern_documents for the remaining document types
ALTER TABLE public.intern_documents 
ADD COLUMN IF NOT EXISTS certificate_url TEXT,
ADD COLUMN IF NOT EXISTS experience_certificate_url TEXT,
ADD COLUMN IF NOT EXISTS recommendation_letter_url TEXT;
