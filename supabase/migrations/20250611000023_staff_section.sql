-- ============================================================================
-- Migration 023: Editable heading for Instructors & Staff section
-- ============================================================================

CREATE TABLE staff_section (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_label TEXT DEFAULT 'Meet the Team',
  title         TEXT NOT NULL DEFAULT 'Our Instructors & Staff',
  description   TEXT DEFAULT 'Learn from experienced professionals dedicated to your success.',
  status        content_status NOT NULL DEFAULT 'published',
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by    UUID REFERENCES auth.users (id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX staff_section_singleton_idx ON staff_section ((true));

INSERT INTO staff_section (id, section_label, title, description, status, published_at)
VALUES (
  'a0000022-0000-4000-8000-000000000022',
  'Meet the Team',
  'Our Instructors & Staff',
  'Learn from experienced professionals dedicated to your success.',
  'published',
  now()
);

ALTER TABLE staff_section ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_section_public_select"
  ON staff_section FOR SELECT TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "staff_section_admin_select"
  ON staff_section FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY "staff_section_admin_insert"
  ON staff_section FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "staff_section_admin_update"
  ON staff_section FOR UPDATE TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "staff_section_admin_delete"
  ON staff_section FOR DELETE TO authenticated
  USING (is_admin());

CREATE OR REPLACE FUNCTION get_published_site_content()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'settings',
      (SELECT to_jsonb(s) FROM site_settings s WHERE s.status = 'published' LIMIT 1),
    'hero',
      (SELECT to_jsonb(h) FROM hero h WHERE h.status = 'published' LIMIT 1),
    'about',
      (SELECT to_jsonb(a) FROM about a WHERE a.status = 'published' LIMIT 1),
    'admissions',
      (SELECT to_jsonb(ad) FROM admissions ad WHERE ad.status = 'published' LIMIT 1),
    'contact',
      (SELECT to_jsonb(c) FROM contact c WHERE c.status = 'published' LIMIT 1),
    'facilities_section',
      (SELECT to_jsonb(fs) FROM facilities_section fs WHERE fs.status = 'published' LIMIT 1),
    'staff_section',
      (SELECT to_jsonb(ss) FROM staff_section ss WHERE ss.status = 'published' LIMIT 1),
    'gallery_section',
      (SELECT to_jsonb(gs) FROM gallery_section gs WHERE gs.status = 'published' LIMIT 1),
    'features',
      COALESCE(
        (SELECT jsonb_agg(to_jsonb(f) ORDER BY f.sort_order)
         FROM features f WHERE f.status = 'published'),
        '[]'::jsonb
      ),
    'programmes',
      COALESCE(
        (SELECT jsonb_agg(to_jsonb(p) ORDER BY p.sort_order)
         FROM programmes p WHERE p.status = 'published'),
        '[]'::jsonb
      ),
    'facilities',
      COALESCE(
        (SELECT jsonb_agg(to_jsonb(f) ORDER BY f.sort_order)
         FROM facilities f WHERE f.status = 'published'),
        '[]'::jsonb
      ),
    'staff',
      COALESCE(
        (SELECT jsonb_agg(to_jsonb(s) ORDER BY s.sort_order)
         FROM staff s WHERE s.status = 'published'),
        '[]'::jsonb
      ),
    'gallery',
      COALESCE(
        (SELECT jsonb_agg(to_jsonb(g) ORDER BY g.sort_order)
         FROM gallery g WHERE g.status = 'published'),
        '[]'::jsonb
      ),
    'testimonials',
      COALESCE(
        (SELECT jsonb_agg(to_jsonb(t) ORDER BY t.sort_order)
         FROM testimonials t WHERE t.status = 'published'),
        '[]'::jsonb
      ),
    'faq',
      COALESCE(
        (SELECT jsonb_agg(to_jsonb(f) ORDER BY f.sort_order)
         FROM faq f WHERE f.status = 'published'),
        '[]'::jsonb
      ),
    'journey',
      COALESCE(
        (SELECT jsonb_agg(to_jsonb(j) ORDER BY j.sort_order)
         FROM journey j WHERE j.status = 'published'),
        '[]'::jsonb
      ),
    'careers',
      COALESCE(
        (SELECT jsonb_agg(to_jsonb(c) ORDER BY c.sort_order)
         FROM careers c WHERE c.status = 'published'),
        '[]'::jsonb
      ),
    'fetched_at', to_jsonb(now())
  );
$$;
