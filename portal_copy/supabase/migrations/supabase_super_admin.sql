-- =========================================================================
-- SUPER ADMIN ACCESS MIGRATION
-- =========================================================================

-- 1. Add the is_super_admin column to the existing admin_profiles table
ALTER TABLE public.admin_profiles ADD COLUMN IF NOT EXISTS is_super_admin boolean DEFAULT false;

-- 2. IMPORTANT: Run the following line manually to upgrade your specific email.
-- Replace 'danyalbut96@gmail.com' with the exact email address you use to log in!
UPDATE public.admin_profiles 
SET is_super_admin = true 
WHERE admin_id = (SELECT id FROM auth.users WHERE email = 'danyalbut96@gmail.com'||'fazalraheem742@gmail.com');
