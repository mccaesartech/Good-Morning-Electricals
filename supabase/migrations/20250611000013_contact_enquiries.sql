-- ============================================================================
-- Migration 013: Contact form submissions
-- ============================================================================

CREATE TABLE contact_enquiries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  programme     TEXT,
  message       TEXT NOT NULL,
  status        enquiry_status NOT NULL DEFAULT 'new',
  admin_notes   TEXT,
  contacted_at  TIMESTAMPTZ,
  contacted_by  UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX contact_enquiries_status_idx ON contact_enquiries (status);
CREATE INDEX contact_enquiries_created_at_idx ON contact_enquiries (created_at DESC);

COMMENT ON TABLE contact_enquiries IS 'Public contact form submissions from the website.';
