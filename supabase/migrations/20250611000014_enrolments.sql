-- ============================================================================
-- Migration 014: Online enrolment applications
-- ============================================================================

CREATE TABLE enrolments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name        TEXT NOT NULL,
  email            TEXT NOT NULL,
  phone            TEXT NOT NULL,
  programme        TEXT NOT NULL,
  date_of_birth    DATE,
  education_level  TEXT,
  message          TEXT,
  status           enrolment_status NOT NULL DEFAULT 'pending',
  admin_notes      TEXT,
  contacted_at     TIMESTAMPTZ,
  admitted_at      TIMESTAMPTZ,
  handled_by       UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX enrolments_status_idx ON enrolments (status);
CREATE INDEX enrolments_created_at_idx ON enrolments (created_at DESC);

COMMENT ON TABLE enrolments IS 'Online enrolment applications from the public website.';
