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

-- =========================================================================
-- INTERN PORTAL & AI ANALYSIS SYSTEM MIGRATION
-- =========================================================================

-- 1. intern_analysis_settings (singleton, id=1)
CREATE TABLE IF NOT EXISTS public.intern_analysis_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  openrouter_api_key text,
  openrouter_model text DEFAULT 'mistralai/mistral-7b-instruct:free',
  max_projects_per_intern integer DEFAULT 4,
  registration_open boolean DEFAULT false,
  batch_coming_soon_message text DEFAULT 'Batch 2 Registration Opening Soon! Stay tuned for announcements.',
  system_prompt_prefix text DEFAULT 'You are an expert software engineering mentor evaluating internship projects. Be fair, constructive, and precise. Analyze the repository carefully before scoring.',
  updated_at timestamptz DEFAULT now()
);

-- Seed default row for intern_analysis_settings
INSERT INTO public.intern_analysis_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- 2. intern_projects
CREATE TABLE IF NOT EXISTS public.intern_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intern_id uuid REFERENCES public.interns(id) ON DELETE CASCADE,
  registration_number text NOT NULL,
  intern_name text NOT NULL,
  project_title text NOT NULL,
  repo_url text NOT NULL,
  domain_code text NOT NULL,
  project_number integer NOT NULL CHECK (project_number BETWEEN 1 AND 10),
  description text,
  submitted_at timestamptz DEFAULT now(),
  ai_score numeric(5,2),
  ai_feedback jsonb,
  ai_analyzed_at timestamptz,
  analysis_status text DEFAULT 'pending' CHECK (analysis_status IN ('pending','analyzing','done','failed')),
  UNIQUE (intern_id, project_number)
);

-- 3. intern_analysis_criteria
CREATE TABLE IF NOT EXISTS public.intern_analysis_criteria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_code text NOT NULL,
  criterion_name text NOT NULL,
  criterion_description text NOT NULL,
  max_marks integer DEFAULT 5,
  sort_order integer NOT NULL,
  UNIQUE (domain_code, sort_order)
);

-- =========================================================================
-- RLS FOR NEW TABLES
-- =========================================================================

ALTER TABLE public.intern_analysis_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intern_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intern_analysis_criteria ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access to intern_analysis_settings" ON public.intern_analysis_settings;
CREATE POLICY "Admin full access to intern_analysis_settings"
  ON public.intern_analysis_settings FOR ALL
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin full access to intern_projects" ON public.intern_projects;
CREATE POLICY "Admin full access to intern_projects"
  ON public.intern_projects FOR ALL
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Public insert + select for portal (anon users can submit projects and lookup)
DROP POLICY IF EXISTS "Public can read intern_projects" ON public.intern_projects;
CREATE POLICY "Public can read intern_projects"
  ON public.intern_projects FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Public can insert intern_projects" ON public.intern_projects;
CREATE POLICY "Public can insert intern_projects"
  ON public.intern_projects FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access to intern_analysis_criteria" ON public.intern_analysis_criteria;
CREATE POLICY "Admin full access to intern_analysis_criteria"
  ON public.intern_analysis_criteria FOR ALL
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Public can read criteria (needed for portal display)
DROP POLICY IF EXISTS "Public can read intern_analysis_criteria" ON public.intern_analysis_criteria;
CREATE POLICY "Public can read intern_analysis_criteria"
  ON public.intern_analysis_criteria FOR SELECT
  TO anon
  USING (true);

-- =========================================================================
-- SEED DEFAULT SCORING CRITERIA (30 rows: 6 domains x 5 criteria)
-- =========================================================================

INSERT INTO public.intern_analysis_criteria (domain_code, criterion_name, criterion_description, max_marks, sort_order) VALUES
-- Python (PY)
('PY', 'Code Structure & Organization', 'Assess how well the code is organized into files, folders, functions, and classes. Look for logical separation of concerns.', 5, 1),
('PY', 'Use of Functions, Classes & Modules', 'Evaluate proper use of Python functions, OOP classes, and module imports. Avoid repetitive code.', 5, 2),
('PY', 'Error Handling & Edge Cases', 'Check for try/except blocks, input validation, and handling of unexpected inputs or failures.', 5, 3),
('PY', 'Libraries & Dependencies Used', 'Evaluate relevance and proper usage of third-party libraries (requirements.txt present, imports make sense).', 5, 4),
('PY', 'README & Documentation Quality', 'Assess README completeness: project description, setup steps, usage examples, and screenshots if applicable.', 5, 5),
-- C++ (CPP)
('CPP', 'OOP Design & Implementation', 'Evaluate correct use of classes, inheritance, encapsulation, and polymorphism in C++.', 5, 1),
('CPP', 'Memory Management', 'Check for proper use of pointers, dynamic allocation (new/delete), and absence of memory leaks.', 5, 2),
('CPP', 'Algorithm Efficiency', 'Assess time and space complexity of implemented algorithms. Look for efficient data structures.', 5, 3),
('CPP', 'Code Readability & Comments', 'Evaluate naming conventions, indentation, inline comments, and overall code clarity.', 5, 4),
('CPP', 'Build & Compilation Readiness', 'Check for Makefile, CMakeLists.txt, or clear build instructions. Code should compile without errors.', 5, 5),
-- Java (JAVA)
('JAVA', 'OOP & Design Patterns', 'Evaluate use of Java OOP principles and common design patterns (Singleton, Factory, MVC, etc.).', 5, 1),
('JAVA', 'Package & Class Structure', 'Assess proper package naming, class organization, and separation of concerns (model/view/controller).', 5, 2),
('JAVA', 'Use of Java Standard APIs', 'Check for proper use of Java Collections, Streams, I/O, and standard library APIs.', 5, 3),
('JAVA', 'Build File Present (Maven/Gradle)', 'Verify presence of pom.xml or build.gradle with correct dependencies and build configuration.', 5, 4),
('JAVA', 'Code Quality & Javadocs', 'Evaluate Javadoc comments on public methods/classes, code style, and absence of dead code.', 5, 5),
-- Data Science (DS)
('DS', 'Dataset & Problem Definition', 'Assess clarity of the problem statement and appropriateness of the dataset used for the task.', 5, 1),
('DS', 'Exploratory Data Analysis (EDA)', 'Evaluate depth of EDA: missing value handling, distributions, correlations, and data cleaning steps.', 5, 2),
('DS', 'Model or Algorithm Used', 'Check appropriateness of the chosen model/algorithm, hyperparameter tuning, and train/test split.', 5, 3),
('DS', 'Visualization & Results', 'Assess quality of charts, graphs, and final result presentation (accuracy, metrics, confusion matrix).', 5, 4),
('DS', 'Notebook & Report Quality', 'Evaluate Jupyter notebook or report structure, markdown explanations, and reproducibility.', 5, 5),
-- Cybersecurity (CYB)
('CYB', 'Vulnerability or Threat Identified', 'Assess whether a real, relevant vulnerability or threat was correctly identified and described.', 5, 1),
('CYB', 'Tools & Methodology Used', 'Evaluate the tools used (Nmap, Burp Suite, Metasploit, Wireshark, etc.) and methodology followed.', 5, 2),
('CYB', 'Ethical Scope & Responsible Use', 'Check that all testing was done ethically (lab environment, own systems, CTF) with no illegal activity.', 5, 3),
('CYB', 'Report & Documentation Quality', 'Assess quality of the security report: findings, risk ratings, evidence screenshots, remediation steps.', 5, 4),
('CYB', 'Practical Demonstration', 'Evaluate whether a working proof-of-concept or demo exists (video, screenshots, or reproducible steps).', 5, 5),
-- Full Stack (GEN)
('GEN', 'Frontend Quality & UI Design', 'Assess visual design, responsiveness, component structure, and user experience of the frontend.', 5, 1),
('GEN', 'Backend & API Implementation', 'Evaluate REST/GraphQL API design, authentication, route structure, and error handling.', 5, 2),
('GEN', 'Database Integration', 'Check for proper database schema, ORM usage or raw queries, data validation, and migrations.', 5, 3),
('GEN', 'Deployment & Live Link Present', 'Verify the app is deployed (Vercel, Railway, Heroku, etc.) with a working live URL in README.', 5, 4),
('GEN', 'Code Quality & README', 'Evaluate overall code cleanliness, comments, .env example file, and README setup instructions.', 5, 5)
ON CONFLICT (domain_code, sort_order) DO NOTHING;
