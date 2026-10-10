-- Task 3: Domain-Wise Seats Migration

-- 1. Create batch_domains table
CREATE TABLE IF NOT EXISTS public.batch_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    seats_total INTEGER NOT NULL DEFAULT 0 CHECK (seats_total >= 0),
    seats_filled INTEGER NOT NULL DEFAULT 0 CHECK (seats_filled >= 0),
    is_open BOOLEAN NOT NULL DEFAULT true,
    UNIQUE(batch_id, domain)
);

-- Enable RLS
ALTER TABLE public.batch_domains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access for all on batch_domains" ON public.batch_domains FOR SELECT USING (true);
CREATE POLICY "Allow all access for admins on batch_domains" ON public.batch_domains USING (auth.uid() IN (SELECT admin_id FROM admin_profiles)) WITH CHECK (auth.uid() IN (SELECT admin_id FROM admin_profiles));

-- 2. Trigger function to safely update seats_filled and enforce limits
CREATE OR REPLACE FUNCTION public.handle_intern_domain_seats()
RETURNS TRIGGER AS $$
DECLARE
    v_seats_total INTEGER;
    v_seats_filled INTEGER;
BEGIN
    -- We only count interns that are NOT Waitlisted or Rejected
    -- Assuming status can be 'Pending', 'Accepted', 'Rejected', 'Waitlisted'

    -- HANDLE DELETE
    IF (TG_OP = 'DELETE') THEN
        IF OLD.status NOT IN ('Rejected', 'Waitlisted') AND OLD.batch_id IS NOT NULL THEN
            UPDATE public.batch_domains
            SET seats_filled = GREATEST(0, seats_filled - 1)
            WHERE batch_id = OLD.batch_id AND domain = OLD.domain;
        END IF;
        RETURN OLD;
    END IF;

    -- HANDLE INSERT
    IF (TG_OP = 'INSERT') THEN
        IF NEW.status NOT IN ('Rejected', 'Waitlisted') AND NEW.batch_id IS NOT NULL THEN
            -- Lock the row for update to prevent race conditions
            SELECT seats_total, seats_filled INTO v_seats_total, v_seats_filled
            FROM public.batch_domains
            WHERE batch_id = NEW.batch_id AND domain = NEW.domain
            FOR UPDATE;

            IF NOT FOUND THEN
                -- If domain isn't explicitly restricted in batch_domains, we allow it (for backward compatibility)
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

    -- HANDLE UPDATE (e.g., status changed, domain changed, or batch changed)
    IF (TG_OP = 'UPDATE') THEN
        -- If it was previously taking a seat
        IF OLD.status NOT IN ('Rejected', 'Waitlisted') AND OLD.batch_id IS NOT NULL THEN
            -- And now it's not taking a seat (or took a different seat)
            IF NEW.status IN ('Rejected', 'Waitlisted') OR NEW.batch_id IS NULL OR NEW.batch_id != OLD.batch_id OR NEW.domain != OLD.domain THEN
                UPDATE public.batch_domains
                SET seats_filled = GREATEST(0, seats_filled - 1)
                WHERE batch_id = OLD.batch_id AND domain = OLD.domain;
            END IF;
        END IF;

        -- If it is now taking a seat
        IF NEW.status NOT IN ('Rejected', 'Waitlisted') AND NEW.batch_id IS NOT NULL THEN
            -- And previously it wasn't (or it was a different seat)
            IF OLD.status IN ('Rejected', 'Waitlisted') OR OLD.batch_id IS NULL OR NEW.batch_id != OLD.batch_id OR NEW.domain != OLD.domain THEN
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach trigger to interns table
DROP TRIGGER IF EXISTS trg_enforce_domain_seats ON public.interns;
CREATE TRIGGER trg_enforce_domain_seats
BEFORE INSERT OR UPDATE OR DELETE ON public.interns
FOR EACH ROW EXECUTE FUNCTION public.handle_intern_domain_seats();

-- 4. Initial sync of seats_filled for existing data
UPDATE public.batch_domains bd
SET seats_filled = (
    SELECT COUNT(*) 
    FROM public.interns i 
    WHERE i.batch_id = bd.batch_id 
      AND i.domain = bd.domain 
      AND i.status NOT IN ('Rejected', 'Waitlisted')
);
