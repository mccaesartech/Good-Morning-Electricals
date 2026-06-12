-- ============================================================================
-- Migration 021: Staff + Gallery access for content managers
-- ============================================================================

UPDATE role_permissions
SET permissions = (
  SELECT array_agg(DISTINCT perm ORDER BY perm)
  FROM unnest(
    permissions || ARRAY['manage_staff', 'manage_gallery']::admin_permission[]
  ) AS perm
)
WHERE role IN ('content_manager', 'editor');

-- Merge role defaults with custom_permissions (custom adds extras; no longer replaces all)
CREATE OR REPLACE FUNCTION resolve_user_permissions(p_user_id UUID)
RETURNS admin_permission[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT array_agg(DISTINCT perm ORDER BY perm)
      FROM unnest(
        COALESCE(rp.permissions, '{}'::admin_permission[]) ||
        COALESCE(au.custom_permissions, '{}'::admin_permission[])
      ) AS perm
    ),
    '{}'::admin_permission[]
  )
  FROM admin_users au
  LEFT JOIN role_permissions rp ON rp.role = au.role
  WHERE au.id = p_user_id
    AND au.active = true
  LIMIT 1;
$$;
