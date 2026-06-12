-- ============================================================================
-- Migration 024: Publish draft staff/gallery/section rows so live site shows them
-- (Safe to run multiple times — only updates rows still marked draft.)
-- ============================================================================

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
