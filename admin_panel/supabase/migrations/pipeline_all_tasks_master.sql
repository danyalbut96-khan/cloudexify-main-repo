-- ============================================================================
-- PIPELINE TASK 1: REGISTRATION, ELIGIBILITY, DUPLICATE PREVENTION & SEAT ALLOCATION
-- ============================================================================

-- 1. Add new required pipeline columns to public.interns table
ALTER TABLE public.interns 
ADD COLUMN IF NOT EXISTS university_registration_number TEXT,
ADD COLUMN IF NOT EXISTS interest TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS resume_url TEXT,
ADD COLUMN IF NOT EXISTS pipeline_stage TEXT DEFAULT 'registered',
ADD COLUMN IF NOT EXISTS waitlisted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS shortlisted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_deadline TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS payment_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_verified_by TEXT,
ADD COLUMN IF NOT EXISTS final_rejection_reason TEXT;

-- 2. Create index on university_registration_number and pipeline_stage
CREATE INDEX IF NOT EXISTS idx_interns_univ_reg_no ON public.interns (university_registration_number);
CREATE INDEX IF NOT EXISTS idx_interns_pipeline_stage ON public.interns (pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_interns_batch_domain_status ON public.interns (batch_id, domain, status);

-- 3. Pre-emptively resolve legacy duplicate emails per batch prior to creating the unique index
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY batch_id, lower(trim(email))
           ORDER BY created_at ASC, id ASC
         ) as row_num
  FROM public.interns
  WHERE batch_id IS NOT NULL AND email IS NOT NULL
)
UPDATE public.interns i
SET email = replace(i.email, '@', '+dup' || substr(replace(i.id::text, '-', ''), 1, 4) || '@')
FROM duplicates d
WHERE i.id = d.id AND d.row_num > 1;

-- Case & whitespace normalized unique indexes to strictly prevent duplicates per batch
CREATE UNIQUE INDEX IF NOT EXISTS idx_uniq_intern_batch_email 
ON public.interns (batch_id, lower(trim(email)));

CREATE UNIQUE INDEX IF NOT EXISTS idx_uniq_intern_batch_univ_reg 
ON public.interns (batch_id, lower(trim(university_registration_number))) 
WHERE university_registration_number IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_uniq_intern_batch_composite 
ON public.interns (
    batch_id, 
    lower(trim(full_name)), 
    lower(trim(email)), 
    semester, 
    lower(trim(university_registration_number))
) 
WHERE university_registration_number IS NOT NULL;

-- 4. Update the trigger function to also recognize 'cancelled_non_payment' as releasing seats
CREATE OR REPLACE FUNCTION public.handle_intern_domain_seats()
RETURNS TRIGGER AS $$
DECLARE
    v_seats_total INTEGER;
    v_seats_filled INTEGER;
BEGIN
    -- Interns that do NOT count towards filled seats:
    -- 'Rejected', 'Waitlisted', 'cancelled_non_payment'

    -- HANDLE DELETE
    IF (TG_OP = 'DELETE') THEN
        IF OLD.status NOT IN ('Rejected', 'Waitlisted', 'cancelled_non_payment') AND OLD.batch_id IS NOT NULL THEN
            UPDATE public.batch_domains
            SET seats_filled = GREATEST(0, seats_filled - 1)
            WHERE batch_id = OLD.batch_id AND domain = OLD.domain;
        END IF;
        RETURN OLD;
    END IF;

    -- HANDLE INSERT
    IF (TG_OP = 'INSERT') THEN
        IF NEW.status NOT IN ('Rejected', 'Waitlisted', 'cancelled_non_payment') AND NEW.batch_id IS NOT NULL THEN
            SELECT seats_total, seats_filled INTO v_seats_total, v_seats_filled
            FROM public.batch_domains
            WHERE batch_id = NEW.batch_id AND domain = NEW.domain
            FOR UPDATE;

            IF NOT FOUND THEN
                RETURN NEW;
            END IF;

            IF v_seats_filled >= v_seats_total THEN
                RAISE EXCEPTION 'DOMAIN_FULL';
            END IF;

            UPDATE public.batch_domains
            SET seats_filled = seats_filled + 1
            WHERE batch_id = NEW.batch_id AND domain = NEW.domain;
        END IF;
        RETURN NEW;
    END IF;

    -- HANDLE UPDATE
    IF (TG_OP = 'UPDATE') THEN
        -- If previously occupying a seat
        IF OLD.status NOT IN ('Rejected', 'Waitlisted', 'cancelled_non_payment') AND OLD.batch_id IS NOT NULL THEN
            -- Now no longer occupying a seat (or switched batch/domain)
            IF NEW.status IN ('Rejected', 'Waitlisted', 'cancelled_non_payment') 
               OR NEW.batch_id IS NULL 
               OR NEW.batch_id != OLD.batch_id 
               OR NEW.domain != OLD.domain THEN
                UPDATE public.batch_domains
                SET seats_filled = GREATEST(0, seats_filled - 1)
                WHERE batch_id = OLD.batch_id AND domain = OLD.domain;
            END IF;
        END IF;

        -- If now occupying a seat
        IF NEW.status NOT IN ('Rejected', 'Waitlisted', 'cancelled_non_payment') AND NEW.batch_id IS NOT NULL THEN
            -- Previously was not occupying
            IF OLD.status IN ('Rejected', 'Waitlisted', 'cancelled_non_payment') 
               OR OLD.batch_id IS NULL 
               OR NEW.batch_id != OLD.batch_id 
               OR NEW.domain != OLD.domain THEN
                SELECT seats_total, seats_filled INTO v_seats_total, v_seats_filled
                FROM public.batch_domains
                WHERE batch_id = NEW.batch_id AND domain = NEW.domain
                FOR UPDATE;

                IF FOUND THEN
                    IF v_seats_filled >= v_seats_total THEN
                        RAISE EXCEPTION 'DOMAIN_FULL';
                    END IF;

                    UPDATE public.batch_domains
                    SET seats_filled = seats_filled + 1
                    WHERE batch_id = NEW.batch_id AND domain = NEW.domain;
                END IF;
            END IF;
        END IF;
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 5. Helper Function: Promote oldest waitlisted candidate when a seat opens
CREATE OR REPLACE FUNCTION public.promote_oldest_waitlisted_intern(p_batch_id UUID, p_domain TEXT)
RETURNS TABLE (
    promoted_intern_id UUID,
    promoted_name TEXT,
    promoted_email TEXT,
    promoted_reg_no TEXT
) AS $$
DECLARE
    v_target_id UUID;
BEGIN
    -- Select the oldest waitlisted intern with a row-level lock
    SELECT id INTO v_target_id
    FROM public.interns
    WHERE batch_id = p_batch_id
      AND domain = p_domain
      AND (status = 'Waitlisted' OR pipeline_stage = 'waitlisted')
    ORDER BY COALESCE(waitlisted_at, created_at) ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED;

    IF v_target_id IS NOT NULL THEN
        UPDATE public.interns
        SET status = 'Pending',
            pipeline_stage = 'interview_pending',
            waitlisted_at = NULL
        WHERE id = v_target_id;

        RETURN QUERY
        SELECT i.id, i.full_name::text, i.email::text, i.registration_number::text
        FROM public.interns i
        WHERE i.id = v_target_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- MASTER PIPELINE PART 2: AI INTERVIEW
-- ============================================================================

-- ============================================================================
-- PIPELINE TASK 2: AI INTERVIEW SETTINGS, SESSIONS, TIMERS & EVALUATIONS
-- ============================================================================

-- 1. Create interview_settings table
CREATE TABLE IF NOT EXISTS public.interview_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain TEXT NOT NULL,
    expertise_level TEXT NOT NULL,
    semester_band TEXT NOT NULL DEFAULT 'all',
    question_count INTEGER NOT NULL DEFAULT 3 CHECK (question_count BETWEEN 2 AND 5),
    time_limit_minutes INTEGER NOT NULL DEFAULT 15 CHECK (time_limit_minutes BETWEEN 5 AND 60),
    difficulty_guidance TEXT,
    prompt_template TEXT,
    question_bank JSONB NOT NULL DEFAULT '[]'::jsonb,
    passing_threshold INTEGER NOT NULL DEFAULT 60,
    tab_switch_cancel_enabled BOOLEAN NOT NULL DEFAULT true,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(domain, expertise_level, semester_band, version)
);

-- Enable RLS for interview_settings
ALTER TABLE public.interview_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access for all on interview_settings" ON public.interview_settings FOR SELECT USING (true);
CREATE POLICY "Allow admin write on interview_settings" ON public.interview_settings FOR ALL 
USING (auth.uid() IN (SELECT admin_id FROM admin_profiles)) 
WITH CHECK (auth.uid() IN (SELECT admin_id FROM admin_profiles));

-- 2. Create interview_sessions table
CREATE TABLE IF NOT EXISTS public.interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intern_id UUID NOT NULL REFERENCES public.interns(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    expertise_level TEXT NOT NULL,
    semester INTEGER NOT NULL,
    settings_id UUID REFERENCES public.interview_settings(id) ON DELETE SET NULL,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    submitted_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'in_progress',
    violation_count INTEGER NOT NULL DEFAULT 0,
    violations_log JSONB NOT NULL DEFAULT '[]'::jsonb,
    flagged_question_index INTEGER,
    retry_count INTEGER NOT NULL DEFAULT 0,
    retry_granted_by TEXT,
    retry_granted_at TIMESTAMPTZ,
    ai_score NUMERIC(5,2),
    ai_suggestion TEXT,
    ai_confidence NUMERIC(3,2),
    ai_evaluation JSONB,
    ai_evaluated_at TIMESTAMPTZ,
    ai_model TEXT,
    ai_prompt_version TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for interview_sessions
CREATE INDEX IF NOT EXISTS idx_interview_sessions_intern ON public.interview_sessions(intern_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_batch ON public.interview_sessions(batch_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_status ON public.interview_sessions(status);

-- Enable RLS for interview_sessions
-- RULE: Interns cannot read scores or evaluations. Only admins can access everything.
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on interview_sessions" ON public.interview_sessions FOR ALL
USING (auth.uid() IN (SELECT admin_id FROM admin_profiles))
WITH CHECK (auth.uid() IN (SELECT admin_id FROM admin_profiles));

-- Seed default interview settings for domains and levels if empty
INSERT INTO public.interview_settings (domain, expertise_level, question_count, time_limit_minutes, difficulty_guidance, prompt_template, passing_threshold)
VALUES
('Python Programming', 'Beginner', 3, 20, 'Focus on basic syntax, data structures (lists, dicts), loops, and basic functions.', 'Ask foundational Python conceptual and small logic questions.', 60),
('Python Programming', 'Intermediate', 3, 15, 'Focus on OOP, list comprehensions, decorators, generators, and exception handling.', 'Ask practical problem-solving questions using Python idiomatic features.', 65),
('Python Programming', 'Expert', 4, 12, 'Focus on memory management, GIL, async/await, concurrency, design patterns, and optimization.', 'Ask in-depth systems and architecture level Python questions.', 70),
('Full Stack Development', 'Beginner', 3, 20, 'Focus on HTML/CSS, basic JavaScript DOM, HTTP methods, and basic React concepts.', 'Ask fundamental web development questions.', 60),
('Full Stack Development', 'Intermediate', 3, 15, 'Focus on React state management, REST APIs, database queries, and authentication basics.', 'Ask full-stack architecture and integration questions.', 65),
('Full Stack Development', 'Expert', 4, 12, 'Focus on SSR, Next.js App Router, database indexing, caching strategies, and security.', 'Ask advanced web architecture and scalability questions.', 70),
('Data Science & AI Basics', 'Beginner', 3, 20, 'Focus on NumPy, Pandas basics, exploratory data analysis, and basic stats.', 'Ask fundamental data manipulation and analysis questions.', 60),
('Data Science & AI Basics', 'Intermediate', 3, 15, 'Focus on Scikit-Learn pipelines, supervised vs unsupervised learning, model evaluation metrics.', 'Ask applied machine learning workflow questions.', 65),
('Data Science & AI Basics', 'Expert', 4, 12, 'Focus on deep learning, transformer architectures, feature engineering, and MLOps deployment.', 'Ask advanced machine learning and AI architecture questions.', 70),
('Cybersecurity Fundamentals', 'Beginner', 3, 20, 'Focus on CIA triad, basic networking concepts, password hashing, and phishing defense.', 'Ask introductory information security questions.', 60),
('Cybersecurity Fundamentals', 'Intermediate', 3, 15, 'Focus on OWASP Top 10 vulnerabilities, encryption types (symmetric vs asymmetric), and firewall rules.', 'Ask hands-on vulnerability assessment and mitigation questions.', 65),
('Cybersecurity Fundamentals', 'Expert', 4, 12, 'Focus on penetration testing, zero-trust architectures, incident response, and cryptographic protocols.', 'Ask advanced security auditing and threat defense questions.', 70),
('Java Programming', 'Beginner', 3, 20, 'Focus on core Java syntax, classes, objects, and basic collections.', 'Ask foundational Java OOP questions.', 60),
('Java Programming', 'Intermediate', 3, 15, 'Focus on interfaces, abstract classes, collections framework, and streams API.', 'Ask intermediate Java design questions.', 65),
('Java Programming', 'Expert', 4, 12, 'Focus on JVM internals, multithreading, garbage collection, and Spring Boot architecture.', 'Ask in-depth enterprise Java questions.', 70),
('C++ Programming', 'Beginner', 3, 20, 'Focus on pointers, references, control structures, and basic functions.', 'Ask core C++ syntax and memory questions.', 60),
('C++ Programming', 'Intermediate', 3, 15, 'Focus on classes, operator overloading, STL containers, and basic templates.', 'Ask intermediate C++ OOP and STL questions.', 65),
('C++ Programming', 'Expert', 4, 12, 'Focus on smart pointers, RAII, move semantics, template metaprogramming, and memory alignment.', 'Ask advanced systems-level C++ questions.', 70)
ON CONFLICT (domain, expertise_level, semester_band, version) DO NOTHING;

NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- MASTER PIPELINE PART 3: ADMIN DESK & AUDIT LOGS
-- ============================================================================

﻿-- ============================================================================
-- PIPELINE TASK 3: ADMIN AI INTERVIEW AUDIT LOGS, OVERRIDES & EXTENSIONS
-- ============================================================================

-- 1. Add override and review columns to interview_sessions if not existing
ALTER TABLE public.interview_sessions
ADD COLUMN IF NOT EXISTS override_score NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS override_reason TEXT,
ADD COLUMN IF NOT EXISTS override_by TEXT,
ADD COLUMN IF NOT EXISTS override_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS decision TEXT, -- 'shortlisted', 'rejected', 'hold'
ADD COLUMN IF NOT EXISTS decision_by TEXT,
ADD COLUMN IF NOT EXISTS decision_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS decision_reason TEXT;

-- 2. Create admin_audit_logs table to track decisions, score overrides, retries, etc.
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_target ON public.admin_audit_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON public.admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created ON public.admin_audit_logs(created_at DESC);

-- Enable RLS for admin_audit_logs
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admin full access on admin_audit_logs" ON public.admin_audit_logs FOR ALL
USING (auth.uid() IN (SELECT admin_id FROM admin_profiles))
WITH CHECK (auth.uid() IN (SELECT admin_id FROM admin_profiles));

NOTIFY pgrst, 'reload schema';


-- ============================================================================
-- MASTER PIPELINE PART 4: APPEALS & STORAGE FIX
-- ============================================================================

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
