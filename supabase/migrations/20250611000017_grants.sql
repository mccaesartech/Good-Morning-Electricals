-- ============================================================================
-- Migration 017: Grants for new functions
-- ============================================================================

GRANT EXECUTE ON FUNCTION resolve_user_permissions(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION has_permission(admin_permission) TO authenticated;
GRANT EXECUTE ON FUNCTION record_admin_login() TO authenticated;
GRANT EXECUTE ON FUNCTION submit_contact_enquiry(TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION submit_enrolment(TEXT, TEXT, TEXT, TEXT, DATE, TEXT, TEXT) TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION resolve_user_permissions(UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION has_permission(admin_permission) FROM anon;
REVOKE EXECUTE ON FUNCTION record_admin_login() FROM anon;
