-- ============================================================================
-- RUN THIS IN SUPABASE SQL EDITOR (one paste, in order)
-- Required if you previously stopped at migration 018.
-- Safe to re-run: uses IF NOT EXISTS / ON CONFLICT patterns where possible.
-- ============================================================================

-- 019: content managers can edit contact + settings
UPDATE role_permissions
SET permissions = (
  SELECT ARRAY(
    SELECT DISTINCT unnest(
      permissions || ARRAY['manage_contact', 'manage_settings']::admin_permission[]
    )
  )
)
WHERE role IN ('content_manager', 'editor');

-- 020: map coordinates on contact (skip if columns already exist)
ALTER TABLE contact ADD COLUMN IF NOT EXISTS map_latitude DOUBLE PRECISION;
ALTER TABLE contact ADD COLUMN IF NOT EXISTS map_longitude DOUBLE PRECISION;
UPDATE contact
SET map_latitude = 5.6602529, map_longitude = -0.0391007
WHERE map_latitude IS NULL OR map_longitude IS NULL;

-- 021: staff + gallery permissions + permission merge fix
UPDATE role_permissions
SET permissions = (
  SELECT array_agg(DISTINCT perm ORDER BY perm)
  FROM unnest(
    permissions || ARRAY['manage_staff', 'manage_gallery']::admin_permission[]
  ) AS perm
)
WHERE role IN ('content_manager', 'editor');

CREATE OR REPLACE FUNCTION resolve_user_permissions(p_user_id UUID)
RETURNS admin_permission[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT array_agg(DISTINCT perm ORDER BY perm)
      FROM unnest(
        COALESCE(rp.permissions, '{}'::admin_permission[]) ||
        COALESCE(au.custom_permissions, '{}'::admin_permission[])
      ) AS perm
    ),
    '{}'::admin_permission[]
  )
  FROM admin_users au
  LEFT JOIN role_permissions rp ON rp.role = au.role
  WHERE au.id = p_user_id
    AND au.active = true
  LIMIT 1;
$$;

-- 022 + 023 + RPC: run full migration files if tables missing
-- If you already ran 022/023 individually, skip to section 024 below.

-- 024: publish any draft content so it appears on the live site
UPDATE staff_section
SET status = 'published', published_at = COALESCE(published_at, now())
WHERE status = 'draft';

UPDATE gallery_section
SET status = 'published', published_at = COALESCE(published_at, now())
WHERE status = 'draft';

UPDATE facilities_section
SET status = 'published', published_at = COALESCE(published_at, now())
WHERE status = 'draft';

UPDATE staff
SET status = 'published', published_at = COALESCE(published_at, now())
WHERE status = 'draft';

UPDATE gallery
SET status = 'published', published_at = COALESCE(published_at, now())
WHERE status = 'draft';

UPDATE features
SET status = 'published', published_at = COALESCE(published_at, now())
WHERE status = 'draft';

UPDATE programmes
SET status = 'published', published_at = COALESCE(published_at, now())
WHERE status = 'draft';

UPDATE facilities
SET status = 'published', published_at = COALESCE(published_at, now())
WHERE status = 'draft';

UPDATE testimonials
SET status = 'published', published_at = COALESCE(published_at, now())
WHERE status = 'draft';

UPDATE faq
SET status = 'published', published_at = COALESCE(published_at, now())
WHERE status = 'draft';

UPDATE journey
SET status = 'published', published_at = COALESCE(published_at, now())
WHERE status = 'draft';

UPDATE careers
SET status = 'published', published_at = COALESCE(published_at, now())
WHERE status = 'draft';

UPDATE hero SET status = 'published', published_at = COALESCE(published_at, now()) WHERE status = 'draft';
UPDATE about SET status = 'published', published_at = COALESCE(published_at, now()) WHERE status = 'draft';
UPDATE admissions SET status = 'published', published_at = COALESCE(published_at, now()) WHERE status = 'draft';
UPDATE contact SET status = 'published', published_at = COALESCE(published_at, now()) WHERE status = 'draft';
UPDATE site_settings SET status = 'published', published_at = COALESCE(published_at, now()) WHERE status = 'draft';

-- Ensure public RPC is callable
GRANT EXECUTE ON FUNCTION get_published_site_content() TO anon, authenticated;

-- 026: gallery caption color + hero background focus position
ALTER TABLE gallery
  ADD COLUMN IF NOT EXISTS caption_color TEXT NOT NULL DEFAULT '#ffffff';

ALTER TABLE hero
  ADD COLUMN IF NOT EXISTS bg_image_focus TEXT NOT NULL DEFAULT 'center center';

-- 027: rejected enrolment status for email notifications
ALTER TYPE enrolment_status ADD VALUE IF NOT EXISTS 'rejected';
