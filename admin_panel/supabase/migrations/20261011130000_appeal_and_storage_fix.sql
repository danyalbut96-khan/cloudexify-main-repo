-- ============================================================================
-- MIGRATION: 20261011130000_appeal_and_storage_fix.sql
-- Review/Appeal system for rejected candidates & public storage policies
-- ============================================================================

-- 1. Add appeal & review tracking columns to interns table
ALTER TABLE interns 
ADD COLUMN IF NOT EXISTS review_requested BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS appeal_note TEXT,
ADD COLUMN IF NOT EXISTS appeal_submitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS appeal_count INTEGER DEFAULT 0;

-- 2. Ensure payment_receipts bucket exists and is publicly accessible
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment_receipts', 'payment_receipts', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Storage policies for receipts
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public Access to payment_receipts' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Public Access to payment_receipts"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'payment_receipts');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public Upload to payment_receipts' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Public Upload to payment_receipts"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'payment_receipts');
  END IF;
END $$;
