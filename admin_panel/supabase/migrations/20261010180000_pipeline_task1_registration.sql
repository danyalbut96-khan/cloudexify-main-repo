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