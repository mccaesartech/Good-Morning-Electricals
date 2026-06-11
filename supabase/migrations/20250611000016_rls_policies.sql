-- ============================================================================
-- Migration 016: RLS for enquiries, enrolments, permission-aware updates
-- ============================================================================

ALTER TABLE contact_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrolments ENABLE ROW LEVEL SECURITY;

-- View enquiries: view_enquiries OR manage_enquiries
CREATE POLICY "enquiries_select_view"
  ON contact_enquiries FOR SELECT
  TO authenticated
  USING (
    has_permission('view_enquiries'::admin_permission)
    OR has_permission('manage_enquiries'::admin_permission)
  );

CREATE POLICY "enquiries_update_manage"
  ON contact_enquiries FOR UPDATE
  TO authenticated
  USING (has_permission('manage_enquiries'::admin_permission))
  WITH CHECK (has_permission('manage_enquiries'::admin_permission));

CREATE POLICY "enquiries_delete_superadmin"
  ON contact_enquiries FOR DELETE
  TO authenticated
  USING (is_superadmin());

-- View enrolments
CREATE POLICY "enrolments_select_view"
  ON enrolments FOR SELECT
  TO authenticated
  USING (
    has_permission('view_enrolments'::admin_permission)
    OR has_permission('manage_enrolments'::admin_permission)
  );

CREATE POLICY "enrolments_update_manage"
  ON enrolments FOR UPDATE
  TO authenticated
  USING (has_permission('manage_enrolments'::admin_permission))
  WITH CHECK (has_permission('manage_enrolments'::admin_permission));

CREATE POLICY "enrolments_delete_superadmin"
  ON enrolments FOR DELETE
  TO authenticated
  USING (is_superadmin());

-- Activity log: view_activity OR any manage permission (active admins)
DROP POLICY IF EXISTS "activity_log_select_admin" ON activity_log;

CREATE POLICY "activity_log_select_admin"
  ON activity_log FOR SELECT
  TO authenticated
  USING (
    has_permission('view_activity'::admin_permission)
    OR is_admin()
  );

-- Superadmins can manage role_permissions (read-only for others via existing policy)
CREATE POLICY "role_permissions_superadmin_write"
  ON role_permissions FOR ALL
  TO authenticated
  USING (is_superadmin())
  WITH CHECK (is_superadmin());
