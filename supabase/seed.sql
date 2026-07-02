-- CloudExify Database Schema & Seed Data SQL

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
  scope_of_work text, -- bullet points separated by newline
  timeline text,
  estimated_cost numeric(12, 2) NOT NULL DEFAULT 0.00,
  sent_by text NOT NULL, -- admin email
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
  line_items jsonb NOT NULL DEFAULT '[]'::jsonb, -- array of {description, quantity, unitPrice}
  amount_pkr numeric(12, 2) NOT NULL DEFAULT 0.00,
  generated_by text NOT NULL, -- admin email
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
  company_logo_url text,
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
CREATE POLICY "Admin full access to interns" ON interns FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to intern_documents" ON intern_documents FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to employees" ON employees FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to employee_documents" ON employee_documents FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to projects" ON projects FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to proposals" ON proposals FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to invoices" ON invoices FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to audit_logs" ON audit_logs FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to company_settings" ON company_settings FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to admin_signatures" ON admin_signatures FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Additional policy for public settings view (optional, but keep authenticated only as per security requirements)

-- =========================================================================
-- MOCK DATA SEEDING
-- =========================================================================

-- Seed Company Settings
INSERT INTO company_settings (id, company_name, company_address, company_website, company_email)
VALUES (1, 'CloudExify', 'Plot 45-C, 24th Commercial St, Phase II Ext Defence, Karachi, Pakistan', 'https://cloudexify.com', 'admin@cloudexify.com')
ON CONFLICT (id) DO NOTHING;

-- Seed Admin Signatures placeholder
INSERT INTO admin_signatures (email, full_name, signature_url) VALUES
('admin1@cloudexify.com', 'Admin One', NULL),
('admin2@cloudexify.com', 'Admin Two', NULL),
('admin3@cloudexify.com', 'Admin Three', NULL)
ON CONFLICT (email) DO NOTHING;

-- Seed Admin Accounts in Supabase Auth Schema (DO block)
DO $$
DECLARE
  admin1_uuid uuid := 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1';
  admin2_uuid uuid := 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2';
  admin3_uuid uuid := 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3';
BEGIN
  -- Admin 1
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin1@cloudexify.com') THEN
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
      admin1_uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'admin1@cloudexify.com',
      crypt('Admin@CX2025!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Admin One"}',
      now(),
      now()
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (
      admin1_uuid,
      admin1_uuid,
      jsonb_build_object('sub', admin1_uuid, 'email', 'admin1@cloudexify.com'),
      'email',
      now(),
      now(),
      now()
    );
  END IF;

  -- Admin 2
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin2@cloudexify.com') THEN
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
      admin2_uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'admin2@cloudexify.com',
      crypt('Admin@CX2025!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Admin Two"}',
      now(),
      now()
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (
      admin2_uuid,
      admin2_uuid,
      jsonb_build_object('sub', admin2_uuid, 'email', 'admin2@cloudexify.com'),
      'email',
      now(),
      now(),
      now()
    );
  END IF;

  -- Admin 3
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin3@cloudexify.com') THEN
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
      admin3_uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'admin3@cloudexify.com',
      crypt('Admin@CX2025!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Admin Three"}',
      now(),
      now()
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (
      admin3_uuid,
      admin3_uuid,
      jsonb_build_object('sub', admin3_uuid, 'email', 'admin3@cloudexify.com'),
      'email',
      now(),
      now(),
      now()
    );
  END IF;
END $$;

-- Seed 30 Interns & Document statuses
-- Format: CX-INT-2025-001 to CX-INT-2025-030
DO $$
DECLARE
  domains text[] := ARRAY['Python Programming', 'C++ Programming', 'Java Programming', 'Data Science & AI Basics', 'Cybersecurity Fundamentals', 'Full Stack Development'];
  universities text[] := ARRAY['NUST', 'FAST-NUCES', 'NED University', 'COMSATS', 'LUMS', 'IQRA University', 'KU', 'GIKI'];
  first_names text[] := ARRAY['Soban', 'Ali', 'Aisha', 'Fatima', 'Usman', 'Hamza', 'Sana', 'Zainab', 'Bilal', 'Umer', 'Saad', 'Hassan', 'Ayesha', 'Mariam', 'Zoha', 'Muneeb', 'Mustafa', 'Kashif', 'Sara', 'Rehman', 'Waqas', 'Yasir', 'Talha', 'Bilal', 'Faisal', 'Haris', 'Kamran', 'Ahsan', 'Adnan', 'Noman'];
  last_names text[] := ARRAY['Khan', 'Ahmed', 'Siddiqui', 'Malik', 'Raza', 'Qureshi', 'Shaikh', 'Farooqi', 'Iqbal', 'Shah', 'Butt', 'Dar', 'Bhatti', 'Jamil', 'Hussain', 'Abbasi', 'Mughal', 'Latif', 'Zahid', 'Mirza'];
  skill_levels text[] := ARRAY['Beginner', 'Intermediate', 'Advanced'];
  genders text[] := ARRAY['Male', 'Female'];
  sources text[] := ARRAY['LinkedIn', 'University Placement Cell', 'Friend Referral', 'CloudExify Website', 'Indeed', 'Facebook'];
  new_intern_id uuid;
  reg_num text;
  dom text;
  uni text;
  f_name text;
  l_name text;
  email text;
  gen text;
  skill text;
  src text;
  hours integer;
  sem integer;
  offer_gen boolean;
  cert_gen boolean;
  exp_gen boolean;
  rec_gen boolean;
BEGIN
  FOR i IN 1..30 LOOP
    reg_num := 'CX-INT-2025-' || LPAD(i::text, 3, '0');
    dom := domains[1 + mod(i, 6)];
    uni := universities[1 + mod(i, 8)];
    f_name := first_names[1 + mod(i, 30)];
    l_name := last_names[1 + mod(i, 20)];
    email := lower(f_name || '.' || l_name || i::text || '@example.com');
    gen := genders[1 + mod(i, 2)];
    skill := skill_levels[1 + mod(i, 3)];
    src := sources[1 + mod(i, 6)];
    hours := ARRAY[20, 30, 40][1 + mod(i, 3)];
    sem := ARRAY[5, 6, 7, 8][1 + mod(i, 4)];
    
    INSERT INTO interns (registration_number, full_name, email, whatsapp, gender, university, semester, domain, skill_level, available_hours, referral_source)
    VALUES (reg_num, f_name || ' ' || l_name, email, '+92300' || LPAD((1000000 + i * 23456)::text, 7, '0'), gen, uni, sem, dom, skill, hours, src)
    RETURNING id INTO new_intern_id;
    
    -- Mix of generated documents
    offer_gen := (mod(i, 2) = 0);
    cert_gen := (mod(i, 3) = 0);
    exp_gen := (mod(i, 4) = 0);
    rec_gen := (mod(i, 5) = 0);
    
    INSERT INTO intern_documents (
      intern_id, 
      offer_letter_generated, offer_letter_date, 
      certificate_generated, certificate_date, 
      experience_certificate_generated, experience_certificate_date, 
      recommendation_letter_generated, recommendation_letter_date
    ) VALUES (
      new_intern_id,
      offer_gen, CASE WHEN offer_gen THEN now() - interval '30 days' ELSE NULL END,
      cert_gen, CASE WHEN cert_gen THEN now() - interval '10 days' ELSE NULL END,
      exp_gen, CASE WHEN exp_gen THEN now() - interval '10 days' ELSE NULL END,
      rec_gen, CASE WHEN rec_gen THEN now() - interval '10 days' ELSE NULL END
    );
  END LOOP;
END $$;

-- Seed Projects (5 projects: 2 completed, 2 in progress, 1 inquiry)
INSERT INTO projects (project_name, client_name, status, start_date, end_date, value_pkr) VALUES
('E-Commerce App development', 'Al-Makkah Grocers', 'completed', '2025-01-10', '2025-03-25', 1200000.00),
('SaaS CRM Portal', 'Swift Logistics Pakistan', 'in_progress', '2025-04-01', '2025-08-30', 2500000.00),
('AI Chatbot Integration', 'MedAsk Healthcare', 'completed', '2025-02-15', '2025-04-15', 750000.00),
('Corporate Web Portal', 'Karachi FinTech Ltd', 'in_progress', '2025-05-01', '2025-07-31', 950000.00),
('Mobile App Inquiry', 'Buraq Ride Hailing', 'inquiry', NULL, NULL, 1800000.00);

-- Seed Proposals (3 proposals)
INSERT INTO proposals (client_name, client_email, proposal_title, description, scope_of_work, timeline, estimated_cost, sent_by, sent_date, status) VALUES
('Buraq Ride Hailing', 'tech@buraq.pk', 'Mobile App Development for Ride-Hailing Service', 'Build a premium ride-hailing app with driver and rider modules, real-time map tracking, wallet integration, and notifications.', '1. UI/UX Design (Figma)\n2. Rider & Driver Flutter App Development\n3. Admin Panel and API development\n4. AWS Deployment and Testing', '4 Months', 1800000.00, 'admin1@cloudexify.com', '2025-06-10', 'sent'),
('HBL Asset Management', 'info@hblasset.com.pk', 'AI-Driven Financial Analytics Dashboard', 'Develop a secure dashboard for financial advisors to display real-time mutual fund tracking and automate generation of customer financial advisory reports.', '1. Data Pipeline setup\n2. Financial Analysis Engine\n3. Web dashboard frontend (Next.js)\n4. Security Audit & Deployment', '3 Months', 3500000.00, 'admin2@cloudexify.com', '2025-06-18', 'draft'),
('Apex School System', 'admin@apexschools.edu.pk', 'School Management System (SaaS)', 'Create an online portal for grade tracking, student registration, fee generation, and teacher assignments.', '1. Database structure & multi-tenancy setup\n2. Student/Parent portal\n3. Fee billing system (HBL API integration)\n4. Academic reports generator', '5 Months', 1500000.00, 'admin1@cloudexify.com', '2025-05-05', 'accepted');

-- Seed Invoices (4 invoices)
INSERT INTO invoices (client_name, client_email, project_name, invoice_number, line_items, amount_pkr, generated_by, generated_date, status) VALUES
('Al-Makkah Grocers', 'billing@almakkah.com', 'E-Commerce App development', 'CX-INV-2025-001', 
  '[{"description":"E-Commerce UI Design & Wireframes","quantity":1,"unitPrice":200000}, {"description":"Mobile App Frontend Development (React Native)","quantity":1,"unitPrice":500000}, {"description":"Backend API & Checkout integration","quantity":1,"unitPrice":500000}]'::jsonb, 
  1200000.00, 'admin1@cloudexify.com', '2025-03-20', 'paid'),
('MedAsk Healthcare', 'accounts@medask.com.pk', 'AI Chatbot Integration', 'CX-INV-2025-002', 
  '[{"description":"AI Chatbot Custom Model Training","quantity":1,"unitPrice":350000}, {"description":"Integration on Web and WhatsApp","quantity":1,"unitPrice":400000}]'::jsonb, 
  750000.00, 'admin2@cloudexify.com', '2025-04-12', 'paid'),
('Swift Logistics Pakistan', 'finance@swiftlogistics.pk', 'SaaS CRM Portal', 'CX-INV-2025-003', 
  '[{"description":"Milestone 1: DB design and Auth modules","quantity":1,"unitPrice":500000}, {"description":"Milestone 2: Dispatch management module","quantity":1,"unitPrice":500000}]'::jsonb, 
  1000000.00, 'admin1@cloudexify.com', '2025-05-15', 'unpaid'),
('Karachi FinTech Ltd', 'billing@kft.com.pk', 'Corporate Web Portal', 'CX-INV-2025-004', 
  '[{"description":"Corporate Web Portal Setup & CMS configuration","quantity":1,"unitPrice":450000}, {"description":"Payment Gateway Integration","quantity":1,"unitPrice":500000}]'::jsonb, 
  950000.00, 'admin3@cloudexify.com', '2025-06-25', 'unpaid');

-- Seed Audit Logs (5 logs)
INSERT INTO audit_logs (admin_email, action, entity_type, entity_id, timestamp) VALUES
('admin1@cloudexify.com', 'Seeded default database tables and configurations', 'system', '00000000-0000-0000-0000-000000000000', now() - interval '5 days'),
('admin1@cloudexify.com', 'Logged into CloudExify Admin Dashboard', 'auth', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', now() - interval '4 hours'),
('admin2@cloudexify.com', 'Created Proposal: AI-Driven Financial Analytics Dashboard', 'proposals', '00000000-0000-0000-0000-000000000000', now() - interval '3 hours'),
('admin1@cloudexify.com', 'Generated Offer Letter for intern Soban Khan', 'documents', 'CX-INT-2025-001', now() - interval '2 hours'),
('admin3@cloudexify.com', 'Generated Invoice CX-INV-2025-004 for Karachi FinTech Ltd', 'invoices', 'CX-INV-2025-004', now() - interval '1 hour');
