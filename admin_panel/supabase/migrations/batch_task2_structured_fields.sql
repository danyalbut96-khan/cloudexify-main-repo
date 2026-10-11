-- Task 2: Structured Fields Migration

-- 1. Create ENUM types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'batch_mode') THEN
        CREATE TYPE batch_mode AS ENUM ('onsite', 'remote', 'hybrid');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'batch_location') THEN
        CREATE TYPE batch_location AS ENUM ('Islamabad', 'Lahore', 'Karachi', 'Remote');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'compensation_type') THEN
        CREATE TYPE compensation_type AS ENUM ('paid', 'unpaid', 'stipend');
    END IF;
END$$;

-- 2. Add new structured columns
ALTER TABLE public.batches 
ADD COLUMN IF NOT EXISTS mode_enum batch_mode DEFAULT 'remote',
ADD COLUMN IF NOT EXISTS location_enum batch_location DEFAULT 'Remote',
ADD COLUMN IF NOT EXISTS comp_type compensation_type DEFAULT 'unpaid',
ADD COLUMN IF NOT EXISTS comp_amount NUMERIC;

-- 3. Safely migrate existing data (best effort heuristics based on text values)
UPDATE public.batches
SET 
    -- Map mode (checking for keywords in the old text field)
    mode_enum = CASE 
        WHEN mode ILIKE '%hybrid%' THEN 'hybrid'::batch_mode
        WHEN mode ILIKE '%onsite%' THEN 'onsite'::batch_mode
        ELSE 'remote'::batch_mode
    END,
    
    -- Map compensation type
    comp_type = CASE 
        WHEN compensation ILIKE '%unpaid%' THEN 'unpaid'::compensation_type
        WHEN compensation ILIKE '%stipend%' THEN 'stipend'::compensation_type
        WHEN compensation ILIKE '%paid%' THEN 'paid'::compensation_type
        ELSE 'unpaid'::compensation_type
    END,

    -- Extract amount if possible (simple regex to grab the first number), otherwise null
    comp_amount = CASE 
        WHEN compensation ~ '[0-9]+' THEN NULLIF(regexp_replace(compensation, '\D', '', 'g'), '')::NUMERIC
        ELSE NULL
    END
WHERE mode_enum IS NULL OR comp_type IS NULL;

-- Note: We are keeping the old text columns ('duration', 'mode', 'compensation') for safety.
-- 'duration' doesn't need a new column because it can be dynamically calculated in queries
-- as EXTRACT(DAY FROM (end_date - start_date)) / 7.
