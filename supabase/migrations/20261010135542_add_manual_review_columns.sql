-- Add manual review columns to intern_projects table
ALTER TABLE intern_projects 
ADD COLUMN IF NOT EXISTS manual_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS manual_marks NUMERIC(5,2) NULL,
ADD COLUMN IF NOT EXISTS manual_feedback TEXT NULL;

-- Optionally, create an index for faster querying
CREATE INDEX IF NOT EXISTS idx_intern_projects_manual_status ON intern_projects(manual_status);
