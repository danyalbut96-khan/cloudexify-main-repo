-- ============================================================================
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
