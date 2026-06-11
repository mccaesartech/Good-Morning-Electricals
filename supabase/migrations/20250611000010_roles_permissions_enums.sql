-- ============================================================================
-- Migration 010: Extend roles, permissions, audit actions, submission statuses
-- RUN MANUALLY IN SUPABASE SQL EDITOR — do not auto-execute from app
-- ============================================================================

-- New admin roles (editor will be migrated to content_manager in 018)
ALTER TYPE admin_role ADD VALUE IF NOT EXISTS 'content_manager';
ALTER TYPE admin_role ADD VALUE IF NOT EXISTS 'staff_manager';
ALTER TYPE admin_role ADD VALUE IF NOT EXISTS 'viewer';

-- Permission keys used by admin app + RLS
CREATE TYPE admin_permission AS ENUM (
  'manage_programmes',
  'manage_staff',
  'manage_gallery',
  'manage_testimonials',
  'manage_faq',
  'manage_hero',
  'manage_facilities',
  'manage_contact',
  'manage_settings',
  'manage_users',
  'manage_enquiries',
  'manage_enrolments',
  'view_activity',
  'view_enquiries',
  'view_enrolments'
);

-- Extend audit trail actions
ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'login';
ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'logout';
ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'activated';
ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'deactivated';
ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'password_reset';

-- Submission workflow statuses
CREATE TYPE enquiry_status AS ENUM ('new', 'contacted', 'archived');
CREATE TYPE enrolment_status AS ENUM ('pending', 'contacted', 'admitted', 'archived');
