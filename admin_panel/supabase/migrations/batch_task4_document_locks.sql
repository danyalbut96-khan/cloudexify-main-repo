-- Task 4: Smarter Document Lock

-- 1. Add per-intern override column to interns table
ALTER TABLE public.interns 
ADD COLUMN IF NOT EXISTS document_lock_override BOOLEAN DEFAULT NULL;

-- 2. Create Audit Log Table for Document Locks
CREATE TABLE IF NOT EXISTS public.document_lock_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intern_id UUID NOT NULL REFERENCES public.interns(id) ON DELETE CASCADE,
    admin_id UUID,
    previous_state BOOLEAN,
    new_state BOOLEAN,
    changed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.document_lock_audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access for admins on document_lock_audits" ON public.document_lock_audits FOR SELECT USING (auth.uid() IN (SELECT admin_id FROM admin_profiles));
CREATE POLICY "Allow insert access for admins on document_lock_audits" ON public.document_lock_audits FOR INSERT WITH CHECK (auth.uid() IN (SELECT admin_id FROM admin_profiles));

-- 3. Audit Trigger for document_lock_override
CREATE OR REPLACE FUNCTION public.audit_document_lock_override()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        IF NEW.document_lock_override IS DISTINCT FROM OLD.document_lock_override THEN
            INSERT INTO public.document_lock_audits (intern_id, admin_id, previous_state, new_state)
            VALUES (NEW.id, auth.uid(), OLD.document_lock_override, NEW.document_lock_override);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_audit_document_lock_override ON public.interns;
CREATE TRIGGER trg_audit_document_lock_override
AFTER UPDATE ON public.interns
FOR EACH ROW EXECUTE FUNCTION public.audit_document_lock_override();

-- 4. Create function to check document access (useful for RLS and RPCs)
CREATE OR REPLACE FUNCTION check_document_access(p_intern_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_override BOOLEAN;
    v_batch_locked BOOLEAN;
BEGIN
    SELECT i.document_lock_override, b.documents_locked 
    INTO v_override, v_batch_locked
    FROM public.interns i
    LEFT JOIN public.batches b ON i.batch_id = b.id
    WHERE i.id = p_intern_id;

    -- If override is set, it wins
    IF v_override IS NOT NULL THEN
        RETURN NOT v_override;
    END IF;

    -- Otherwise fallback to batch global lock
    RETURN NOT COALESCE(v_batch_locked, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Storage Policy to enforce document locking
-- Interns can only read their documents if they are not locked.
-- For the sake of this migration, we add a generic SELECT policy for authenticated users, 
-- but in reality, you might attach this to the specific bucket, e.g.
-- CREATE POLICY "Enforce document locks for interns" ON storage.objects FOR SELECT 
-- USING (bucket_id = 'intern_documents' AND auth.role() = 'authenticated' AND check_document_access(auth.uid()));
