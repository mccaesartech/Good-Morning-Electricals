-- ============================================================================
-- Migration 012: Admin user tracking + optional permission overrides
-- ============================================================================

ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS custom_permissions admin_permission[] DEFAULT NULL;

COMMENT ON COLUMN admin_users.custom_permissions IS
  'Optional per-user permission override. NULL = use role_permissions defaults.';
