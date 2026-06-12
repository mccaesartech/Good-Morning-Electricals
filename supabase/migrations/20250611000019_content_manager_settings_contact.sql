-- ============================================================================
-- Migration 019: Grant content managers contact + settings permissions
-- ============================================================================

UPDATE role_permissions
SET permissions = (
  SELECT ARRAY(
    SELECT DISTINCT unnest(
      permissions || ARRAY['manage_contact', 'manage_settings']::admin_permission[]
    )
  )
)
WHERE role IN ('content_manager', 'editor');
