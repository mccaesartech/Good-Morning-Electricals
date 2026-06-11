-- ============================================================================
-- Migration 015: Permission helpers, profile RPC, public submit, login tracking
-- ============================================================================

-- Resolve effective permissions for a user id
CREATE OR REPLACE FUNCTION resolve_user_permissions(p_user_id UUID)
RETURNS admin_permission[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    au.custom_permissions,
    rp.permissions,
    '{}'::admin_permission[]
  )
  FROM admin_users au
  LEFT JOIN role_permissions rp ON rp.role = au.role
  WHERE au.id = p_user_id
    AND au.active = true
  LIMIT 1;
$$;

-- Check if current session has a permission
CREATE OR REPLACE FUNCTION has_permission(p_perm admin_permission)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p_perm = ANY(resolve_user_permissions(auth.uid()));
$$;

-- Updated admin profile with permissions
CREATE OR REPLACE FUNCTION get_admin_profile()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'id', au.id,
    'email', au.email,
    'full_name', au.full_name,
    'role', au.role,
    'active', au.active,
    'last_login_at', au.last_login_at,
    'custom_permissions', au.custom_permissions,
    'permissions', to_jsonb(resolve_user_permissions(au.id))
  )
  FROM admin_users au
  WHERE au.id = auth.uid()
    AND au.active = true
  LIMIT 1;
$$;

-- Record successful admin login
CREATE OR REPLACE FUNCTION record_admin_login()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RETURN;
  END IF;

  UPDATE admin_users
  SET last_login_at = now()
  WHERE id = auth.uid();

  INSERT INTO activity_log (user_id, user_email, action, entity, summary)
  SELECT auth.uid(), au.email, 'login', 'admin_users', 'Admin logged in'
  FROM admin_users au WHERE au.id = auth.uid();
END;
$$;

-- Public: submit contact enquiry (no auth required)
CREATE OR REPLACE FUNCTION submit_contact_enquiry(
  p_full_name TEXT,
  p_email TEXT,
  p_phone TEXT DEFAULT NULL,
  p_programme TEXT DEFAULT NULL,
  p_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  IF p_full_name IS NULL OR length(trim(p_full_name)) < 2 THEN
    RAISE EXCEPTION 'Full name is required';
  END IF;
  IF p_email IS NULL OR p_email !~ '^[^@]+@[^@]+\.[^@]+$' THEN
    RAISE EXCEPTION 'Valid email is required';
  END IF;
  IF p_message IS NULL OR length(trim(p_message)) < 5 THEN
    RAISE EXCEPTION 'Message is required';
  END IF;

  INSERT INTO contact_enquiries (full_name, email, phone, programme, message)
  VALUES (trim(p_full_name), lower(trim(p_email)), NULLIF(trim(p_phone), ''), NULLIF(trim(p_programme), ''), trim(p_message))
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- Public: submit enrolment application
CREATE OR REPLACE FUNCTION submit_enrolment(
  p_full_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_programme TEXT,
  p_date_of_birth DATE DEFAULT NULL,
  p_education_level TEXT DEFAULT NULL,
  p_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  IF p_full_name IS NULL OR length(trim(p_full_name)) < 2 THEN
    RAISE EXCEPTION 'Full name is required';
  END IF;
  IF p_email IS NULL OR p_email !~ '^[^@]+@[^@]+\.[^@]+$' THEN
    RAISE EXCEPTION 'Valid email is required';
  END IF;
  IF p_phone IS NULL OR length(trim(p_phone)) < 6 THEN
    RAISE EXCEPTION 'Phone number is required';
  END IF;
  IF p_programme IS NULL OR length(trim(p_programme)) < 2 THEN
    RAISE EXCEPTION 'Programme is required';
  END IF;

  INSERT INTO enrolments (full_name, email, phone, programme, date_of_birth, education_level, message)
  VALUES (
    trim(p_full_name),
    lower(trim(p_email)),
    trim(p_phone),
    trim(p_programme),
    p_date_of_birth,
    NULLIF(trim(p_education_level), ''),
    NULLIF(trim(p_message), '')
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;
