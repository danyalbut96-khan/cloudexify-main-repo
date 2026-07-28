-- CloudExify Database Schema SQL (Production Configuration)

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- CLEANUP EXISTING DATA
-- =========================================================================
TRUNCATE TABLE audit_logs CASCADE;
TRUNCATE TABLE intern_documents CASCADE;
TRUNCATE TABLE interns CASCADE;
TRUNCATE TABLE employee_documents CASCADE;
TRUNCATE TABLE employees CASCADE;
TRUNCATE TABLE projects CASCADE;
TRUNCATE TABLE proposals CASCADE;
TRUNCATE TABLE invoices CASCADE;

-- Clear previous user settings and credential profiles
TRUNCATE TABLE company_settings CASCADE;
TRUNCATE TABLE admin_signatures CASCADE;

-- =========================================================================
-- TABLES CREATION
-- =========================================================================

-- 1. Interns Table
CREATE TABLE IF NOT EXISTS interns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number text UNIQUE NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  whatsapp text,
  gender text,
  university text,
  semester integer,
  domain text NOT NULL CHECK (domain IN ('Python Programming', 'C++ Programming', 'Java Programming', 'Data Science & AI Basics', 'Cybersecurity Fundamentals', 'Full Stack Development')),
  skill_level text CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced')),
  available_hours integer,
  referral_source text,
  created_at timestamptz DEFAULT now()
);

-- 2. Intern Documents Table
CREATE TABLE IF NOT EXISTS intern_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intern_id uuid REFERENCES interns(id) ON DELETE CASCADE UNIQUE,
  offer_letter_generated boolean DEFAULT false,
  offer_letter_date timestamptz,
  certificate_generated boolean DEFAULT false,
  certificate_date timestamptz,
  experience_certificate_generated boolean DEFAULT false,
  experience_certificate_date timestamptz,
  recommendation_letter_generated boolean DEFAULT false,
  recommendation_letter_date timestamptz
);

-- 3. Employees Table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  position text NOT NULL,
  department text NOT NULL,
  joining_date date NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'terminated', 'resigned', 'on_leave')),
  created_at timestamptz DEFAULT now()
);

-- 4. Employee Documents Table
CREATE TABLE IF NOT EXISTS employee_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE UNIQUE,
  offer_letter_generated boolean DEFAULT false,
  appointment_letter_generated boolean DEFAULT false,
  experience_certificate_generated boolean DEFAULT false
);

-- 5. Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name text NOT NULL,
  client_name text NOT NULL,
  status text NOT NULL CHECK (status IN ('inquiry', 'in_progress', 'completed')),
  start_date date,
  end_date date,
  value_pkr numeric(12, 2) NOT NULL DEFAULT 0.00,
  created_at timestamptz DEFAULT now()
);

-- 6. Proposals Table
CREATE TABLE IF NOT EXISTS proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  client_email text NOT NULL,
  proposal_title text NOT NULL,
  description text,
  scope_of_work text,
  timeline text,
  estimated_cost numeric(12, 2) NOT NULL DEFAULT 0.00,
  sent_by text NOT NULL,
  sent_date date,
  status text NOT NULL CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now()
);

-- 7. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  client_email text NOT NULL,
  project_name text NOT NULL,
  invoice_number text UNIQUE NOT NULL,
  line_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  amount_pkr numeric(12, 2) NOT NULL DEFAULT 0.00,
  generated_by text NOT NULL,
  generated_date date NOT NULL,
  status text NOT NULL CHECK (status IN ('unpaid', 'paid')),
  created_at timestamptz DEFAULT now()
);

-- 8. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email text NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  timestamp timestamptz DEFAULT now()
);

-- 9. Company Settings Table
CREATE TABLE IF NOT EXISTS company_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  company_name text NOT NULL DEFAULT 'CloudExify',
  company_address text NOT NULL DEFAULT 'Plot 45-C, 24th Commercial St, Phase II Ext Defence, Karachi, Pakistan',
  company_website text NOT NULL DEFAULT 'https://cloudexify.com',
  company_email text NOT NULL DEFAULT 'info@cloudexify.com',
  company_phone text DEFAULT '+92 341 1949277',
  company_logo_url text,
  bank_details text DEFAULT 'Bank: Habib Bank Limited (HBL)
Account Name: CloudExify Private Limited
Account Number: 1234-567890-01
Branch Code: 0123
IBAN: PK00 HABB 0123 4567 8901',
  updated_at timestamptz DEFAULT now()
);

-- 10. Admin Signatures Table
CREATE TABLE IF NOT EXISTS admin_signatures (
  email text PRIMARY KEY,
  full_name text NOT NULL,
  signature_url text,
  updated_at timestamptz DEFAULT now()
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS on all tables
ALTER TABLE interns ENABLE ROW LEVEL SECURITY;
ALTER TABLE intern_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_signatures ENABLE ROW LEVEL SECURITY;

-- Helper policy: Allow full access only to authenticated users (admin logins)
DROP POLICY IF EXISTS "Admin full access to interns" ON interns;
CREATE POLICY "Admin full access to interns" ON interns FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin full access to intern_documents" ON intern_documents;
CREATE POLICY "Admin full access to intern_documents" ON intern_documents FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin full access to employees" ON employees;
CREATE POLICY "Admin full access to employees" ON employees FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin full access to employee_documents" ON employee_documents;
CREATE POLICY "Admin full access to employee_documents" ON employee_documents FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin full access to projects" ON projects;
CREATE POLICY "Admin full access to projects" ON projects FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin full access to proposals" ON proposals;
CREATE POLICY "Admin full access to proposals" ON proposals FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin full access to invoices" ON invoices;
CREATE POLICY "Admin full access to invoices" ON invoices FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin full access to audit_logs" ON audit_logs;
CREATE POLICY "Admin full access to audit_logs" ON audit_logs FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin full access to company_settings" ON company_settings;
CREATE POLICY "Admin full access to company_settings" ON company_settings FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin full access to admin_signatures" ON admin_signatures;
CREATE POLICY "Admin full access to admin_signatures" ON admin_signatures FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- =========================================================================
-- DATABASE TRIGGERS
-- =========================================================================

-- Trigger to automatically create admin signature profile row on signup
CREATE OR REPLACE FUNCTION public.handle_new_admin()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.admin_signatures (email, full_name, signature_url)
  VALUES (
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    NULL
  )
  ON CONFLICT (email) DO NOTHING;
  
  -- Create audit log of registration
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_admin();

-- =========================================================================
-- DEFAULT PROFILE SEEDING
-- =========================================================================

-- Seed Single Row Company Settings (Required for dashboard settings interface)
INSERT INTO company_settings (id, company_name, company_address, company_website, company_email, company_phone, bank_details)
VALUES (1, 'CloudExify', 'Plot 45-C, 24th Commercial St, Phase II Ext Defence, Karachi, Pakistan', 'https://cloudexify.com', 'info@cloudexify.com', '+92 341 1949277', 'Bank: Habib Bank Limited (HBL)
Account Name: CloudExify Private Limited
Account Number: 1234-567890-01
Branch Code: 0123
IBAN: PK00 HABB 0123 4567 8901')
ON CONFLICT (id) DO NOTHING;
