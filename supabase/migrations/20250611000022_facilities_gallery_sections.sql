-- ============================================================================
-- Migration 022: Section headings for Facilities and Photo Gallery
-- ============================================================================

CREATE TABLE facilities_section (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_label TEXT DEFAULT 'Our Campus',
  title         TEXT NOT NULL DEFAULT 'Facilities & Practical Training',
  description   TEXT,
  status        content_status NOT NULL DEFAULT 'published',
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by    UUID REFERENCES auth.users (id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX facilities_section_singleton_idx ON facilities_section ((true));

CREATE TABLE gallery_section (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_label TEXT DEFAULT 'In the Field',
  title         TEXT NOT NULL DEFAULT 'Photo Gallery',
  description   TEXT DEFAULT 'Photos from school practicals, workshop sessions, and real training on site.',
  status        content_status NOT NULL DEFAULT 'published',
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by    UUID REFERENCES auth.users (id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX gallery_section_singleton_idx ON gallery_section ((true));

INSERT INTO facilities_section (id, section_label, title, description, status, published_at)
VALUES (
  'a0000020-0000-4000-8000-000000000020',
  'Our Campus',
  'Facilities & Practical Training',
  'Learn in an environment built for real-world electrical engineering excellence.',
  'published',
  now()
);

INSERT INTO gallery_section (id, section_label, title, description, status, published_at)
VALUES (
  'a0000021-0000-4000-8000-000000000021',
  'In the Field',
  'Photo Gallery',
  'Photos from school practicals, field work, and hands-on training at the academy.',
  'published',
  now()
);

ALTER TABLE facilities_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_section ENABLE ROW LEVEL SECURITY;

CREATE POLICY "facilities_section_public_select"
  ON facilities_section FOR SELECT TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "facilities_section_admin_select"
  ON facilities_section FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY "facilities_section_admin_insert"
  ON facilities_section FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "facilities_section_admin_update"
  ON facilities_section FOR UPDATE TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "facilities_section_admin_delete"
  ON facilities_section FOR DELETE TO authenticated
  USING (is_admin());

CREATE POLICY "gallery_section_public_select"
  ON gallery_section FOR SELECT TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "gallery_section_admin_select"
  ON gallery_section FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY "gallery_section_admin_insert"
  ON gallery_section FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "gallery_section_admin_update"
  ON gallery_section FOR UPDATE TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "gallery_section_admin_delete"
  ON gallery_section FOR DELETE TO authenticated
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
