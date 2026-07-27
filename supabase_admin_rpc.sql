-- Enable pgcrypto for password hashing if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Fetch Admin Team Members
CREATE OR REPLACE FUNCTION get_admin_team_members()
RETURNS TABLE (
  id uuid,
  email varchar,
  full_name text,
  designation text,
  is_active boolean,
  is_super_admin boolean,
  created_at timestamptz
) 
SECURITY DEFINER
AS $$
BEGIN
  -- Check if caller is super admin
  IF NOT EXISTS (SELECT 1 FROM public.admin_profiles WHERE admin_id = auth.uid() AND is_super_admin = true) THEN
    RAISE EXCEPTION 'Unauthorized: Super Admin access required';
  END IF;
  
  RETURN QUERY
  SELECT 
    u.id, 
    u.email::varchar, 
    COALESCE(p.display_name, split_part(u.email, '@', 1))::text as full_name,
    COALESCE(p.designation, 'Administrator')::text as designation,
    (u.banned_until IS NULL OR u.banned_until < now()) as is_active,
    COALESCE(p.is_super_admin, false) as is_super_admin,
    u.created_at
  FROM auth.users u
  LEFT JOIN public.admin_profiles p ON u.id = p.admin_id;
END;
$$ LANGUAGE plpgsql;


-- 2. Toggle Admin Status (Disable / Enable)
CREATE OR REPLACE FUNCTION toggle_admin_status(target_admin_id uuid, action_type text)
RETURNS void
SECURITY DEFINER
AS $$
BEGIN
  -- Check if caller is super admin
  IF NOT EXISTS (SELECT 1 FROM public.admin_profiles WHERE admin_id = auth.uid() AND is_super_admin = true) THEN
    RAISE EXCEPTION 'Unauthorized: Super Admin access required';
  END IF;
  
  -- Prevent self-lockout
  IF target_admin_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot modify your own status from here';
  END IF;
  
  IF action_type = 'disable' THEN
    UPDATE auth.users SET banned_until = '2100-01-01 00:00:00+00' WHERE id = target_admin_id;
  ELSIF action_type = 'enable' THEN
    UPDATE auth.users SET banned_until = NULL WHERE id = target_admin_id;
  ELSE
    RAISE EXCEPTION 'Invalid action_type';
  END IF;
END;
$$ LANGUAGE plpgsql;


-- 3. Delete Admin User
CREATE OR REPLACE FUNCTION delete_admin_user(target_admin_id uuid)
RETURNS void
SECURITY DEFINER
AS $$
BEGIN
  -- Check if caller is super admin
  IF NOT EXISTS (SELECT 1 FROM public.admin_profiles WHERE admin_id = auth.uid() AND is_super_admin = true) THEN
    RAISE EXCEPTION 'Unauthorized: Super Admin access required';
  END IF;
  
  -- Prevent self-deletion
  IF target_admin_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot delete yourself from here. Use account settings.';
  END IF;
  
  -- Deleting from auth.users automatically cascades to public.admin_profiles
  DELETE FROM auth.users WHERE id = target_admin_id;
END;
$$ LANGUAGE plpgsql;


-- 4. Update Admin Password
CREATE OR REPLACE FUNCTION update_admin_password(target_admin_id uuid, new_password text)
RETURNS void
SECURITY DEFINER
AS $$
BEGIN
  -- Check if caller is super admin
  IF NOT EXISTS (SELECT 1 FROM public.admin_profiles WHERE admin_id = auth.uid() AND is_super_admin = true) THEN
    RAISE EXCEPTION 'Unauthorized: Super Admin access required';
  END IF;
  
  IF length(new_password) < 6 THEN
    RAISE EXCEPTION 'Password must be at least 6 characters';
  END IF;
  
  -- Update using bcrypt hash via pgcrypto
  UPDATE auth.users 
  SET encrypted_password = crypt(new_password, gen_salt('bf'))
  WHERE id = target_admin_id;
END;
$$ LANGUAGE plpgsql;
