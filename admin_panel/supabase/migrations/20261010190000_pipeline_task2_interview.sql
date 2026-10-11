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