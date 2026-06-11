-- ============================================================================
-- Migration 018: Migrate legacy editor role → content_manager
-- ============================================================================

UPDATE admin_users
SET role = 'content_manager'
WHERE role = 'editor';

-- Optional: remove editor defaults from role_permissions after migration
-- DELETE FROM role_permissions WHERE role = 'editor';
