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
