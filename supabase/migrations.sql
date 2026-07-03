-- =========================================================================
-- CLOUDEXIFY DATABASE MIGRATIONS
-- =========================================================================

-- 1. Create sheet_connections table
CREATE TABLE IF NOT EXISTS sheet_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sheet_name text NOT NULL,
  sheet_url text NOT NULL,
  mapped_to text NOT NULL CHECK (mapped_to IN ('interns', 'employees', 'projects', 'invoices', 'proposals')),
  is_active boolean DEFAULT true,
  created_by text,
  created_at timestamptz DEFAULT now()
);

-- 2. Create admin_profiles table
CREATE TABLE IF NOT EXISTS admin_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  display_name text,
  avatar_url text,
  signature_url text,
  updated_at timestamptz DEFAULT now()
);

-- =========================================================================
-- STORAGE BUCKETS CONFIGURATION
-- =========================================================================

-- Create avatars and signatures buckets if they do not exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('admin-avatars', 'admin-avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('admin-signatures', 'admin-signatures', true)
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) & POLICIES
-- =========================================================================

-- Enable RLS on new tables
ALTER TABLE sheet_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- sheet_connections policies: Authenticated admins have full read/write access
DROP POLICY IF EXISTS "Admin full access to sheet_connections" ON sheet_connections;
CREATE POLICY "Admin full access to sheet_connections" 
  ON sheet_connections FOR ALL 
  TO authenticated 
  USING (auth.role() = 'authenticated') 
  WITH CHECK (auth.role() = 'authenticated');

-- admin_profiles policies: Authenticated admins can edit their own profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON admin_profiles;
CREATE POLICY "Admins can view all profiles" 
  ON admin_profiles FOR SELECT 
  TO authenticated 
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can edit own profile" ON admin_profiles;
CREATE POLICY "Admins can edit own profile" 
  ON admin_profiles FOR ALL 
  TO authenticated 
  USING (auth.uid() = admin_id) 
  WITH CHECK (auth.uid() = admin_id);

-- Storage bucket access control policies
DROP POLICY IF EXISTS "Allow authenticated admins full access to avatars" ON storage.objects;
CREATE POLICY "Allow authenticated admins full access to avatars"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'admin-avatars')
  WITH CHECK (bucket_id = 'admin-avatars');

DROP POLICY IF EXISTS "Allow authenticated admins full access to signatures" ON storage.objects;
CREATE POLICY "Allow authenticated admins full access to signatures"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'admin-signatures')
  WITH CHECK (bucket_id = 'admin-signatures');

-- =========================================================================
-- DATABASE TRIGGERS
-- =========================================================================

-- Create trigger function to sync new signups with both admin_profiles and admin_signatures
CREATE OR REPLACE FUNCTION public.handle_new_admin()
RETURNS trigger AS $$
BEGIN
  -- Insert into public.admin_profiles
  INSERT INTO public.admin_profiles (admin_id, display_name, avatar_url, signature_url)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    NULL,
    NULL
  )
  ON CONFLICT (admin_id) DO NOTHING;

  -- Maintain backwards compatibility for documents via public.admin_signatures
  INSERT INTO public.admin_signatures (email, full_name, signature_url)
  VALUES (
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    NULL
  )
  ON CONFLICT (email) DO NOTHING;

  -- Create audit log entry
  INSERT INTO public.audit_logs (admin_email, action, entity_type, entity_id)
  VALUES (
    new.email,
    'Signed up as a system administrator',
    'auth',
    new.id::text
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Rebuild trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_admin();

-- =========================================================================
-- SYSTEM SCHEMAS ALTERATIONS (COLUMNS DRIFT)
-- =========================================================================

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_percentage numeric(5, 2) DEFAULT 0.00;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_terms text DEFAULT 'Net 30';

ALTER TABLE proposals ADD COLUMN IF NOT EXISTS why_cloudexify text DEFAULT 'CloudExify is a Pakistan-based software development company specializing in premium web apps, mobile apps, SaaS, and AI-powered solutions. We ship clean, secure, production-level code.';

ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS bank_details text DEFAULT 'Bank: Habib Bank Limited (HBL)
Account Name: CloudExify Private Limited
Account Number: 1234-567890-01
Branch Code: 0123
IBAN: PK00 HABB 0123 4567 8901';

-- =========================================================================
-- DESIGNATION COLUMNS AND URL UNESCAPING MIGRATIONS
-- =========================================================================

-- Add designation column to profiles tables for signatory roles
ALTER TABLE public.admin_profiles ADD COLUMN IF NOT EXISTS designation text;
ALTER TABLE public.admin_signatures ADD COLUMN IF NOT EXISTS designation text;

-- Cleanup script to unescape any corrupted URLs, emails, or signature paths stored in DB
UPDATE public.company_settings
SET 
  company_website = REPLACE(REPLACE(company_website, '&#x2F;', '/'), '&amp;', '&'),
  company_logo_url = REPLACE(REPLACE(company_logo_url, '&#x2F;', '/'), '&amp;', '&')
WHERE id = 1;

UPDATE public.admin_profiles
SET 
  signature_url = REPLACE(REPLACE(signature_url, '&#x2F;', '/'), '&amp;', '&'),
  avatar_url = REPLACE(REPLACE(avatar_url, '&#x2F;', '/'), '&amp;', '&');

UPDATE public.admin_signatures
SET 
  signature_url = REPLACE(REPLACE(signature_url, '&#x2F;', '/'), '&amp;', '&'),
  designation = REPLACE(REPLACE(designation, '&#x2F;', '/'), '&amp;', '&');

UPDATE public.sheet_connections
SET 
  sheet_url = REPLACE(REPLACE(sheet_url, '&#x2F;', '/'), '&amp;', '&');

-- Enable RLS on admin_signatures and add full access policy for authenticated admins
ALTER TABLE public.admin_signatures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access to admin_signatures" ON public.admin_signatures;
CREATE POLICY "Admin full access to admin_signatures" 
  ON public.admin_signatures FOR ALL 
  TO authenticated 
  USING (auth.role() = 'authenticated') 
  WITH CHECK (auth.role() = 'authenticated');

-- Add company_phone column to company_settings
ALTER TABLE public.company_settings ADD COLUMN IF NOT EXISTS company_phone text DEFAULT '+92 341 1949277';



