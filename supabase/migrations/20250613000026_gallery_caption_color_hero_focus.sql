-- Migration 026: Gallery caption color + hero background focus position

ALTER TABLE gallery
  ADD COLUMN IF NOT EXISTS caption_color TEXT NOT NULL DEFAULT '#ffffff';

ALTER TABLE hero
  ADD COLUMN IF NOT EXISTS bg_image_focus TEXT NOT NULL DEFAULT 'center center';

COMMENT ON COLUMN gallery.caption_color IS 'Hex color for the caption text overlay on the public gallery.';
COMMENT ON COLUMN hero.bg_image_focus IS 'CSS object-position for hero background, e.g. center center, 50% 35%, top center.';
