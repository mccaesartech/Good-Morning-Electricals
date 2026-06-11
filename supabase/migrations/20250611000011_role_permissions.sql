-- ============================================================================
-- Migration 011: Role → default permissions mapping
-- ============================================================================

CREATE TABLE role_permissions (
  role        admin_role PRIMARY KEY,
  permissions admin_permission[] NOT NULL DEFAULT '{}'
);

COMMENT ON TABLE role_permissions IS 'Default permission set per admin role.';

INSERT INTO role_permissions (role, permissions) VALUES
(
  'superadmin',
  ARRAY[
    'manage_programmes','manage_staff','manage_gallery','manage_testimonials',
    'manage_faq','manage_hero','manage_facilities','manage_contact',
    'manage_settings','manage_users','manage_enquiries','manage_enrolments',
    'view_activity','view_enquiries','view_enrolments'
  ]::admin_permission[]
),
(
  'content_manager',
  ARRAY[
    'manage_programmes','manage_gallery','manage_testimonials','manage_faq',
    'manage_hero','manage_facilities','manage_enquiries','manage_enrolments',
    'view_enquiries','view_enrolments'
  ]::admin_permission[]
),
(
  'staff_manager',
  ARRAY[
    'manage_staff','manage_gallery','view_enquiries','view_enrolments'
  ]::admin_permission[]
),
(
  'viewer',
  ARRAY[
    'view_activity','view_enquiries','view_enrolments'
  ]::admin_permission[]
),
(
  'editor',
  ARRAY[
    'manage_programmes','manage_gallery','manage_testimonials','manage_faq',
    'manage_hero','manage_facilities','manage_enquiries','manage_enrolments',
    'view_enquiries','view_enrolments'
  ]::admin_permission[]
);

ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "role_permissions_read_authenticated"
  ON role_permissions FOR SELECT
  TO authenticated
  USING (true);
