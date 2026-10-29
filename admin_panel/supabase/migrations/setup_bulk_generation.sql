-- 1. Add URL column to intern_documents
ALTER TABLE public.intern_documents 
ADD COLUMN IF NOT EXISTS offer_letter_url TEXT;

-- 2. Create the storage bucket for intern documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('intern-documents', 'intern-documents', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up Storage Policies for the new bucket
-- Allow public access to view the files (since they are verified via QR code anyway)
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'intern-documents' );

-- Allow authenticated admins (or service role) to upload files
CREATE POLICY "Admin Upload Access" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'intern-documents' AND auth.role() = 'authenticated' );

CREATE POLICY "Admin Update Access" 
ON storage.objects FOR UPDATE 
WITH CHECK ( bucket_id = 'intern-documents' AND auth.role() = 'authenticated' );

CREATE POLICY "Admin Delete Access" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'intern-documents' AND auth.role() = 'authenticated' );
