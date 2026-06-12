-- ============================================================================
-- Migration 020: Google Maps coordinates on contact
-- ============================================================================

ALTER TABLE contact
  ADD COLUMN IF NOT EXISTS map_latitude  DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS map_longitude DOUBLE PRECISION;

COMMENT ON COLUMN contact.map_latitude IS 'Google Maps latitude for campus embed';
COMMENT ON COLUMN contact.map_longitude IS 'Google Maps longitude for campus embed';

UPDATE contact
SET
  map_latitude = 5.6602529,
  map_longitude = -0.0391007,
  gps_code = COALESCE(NULLIF(trim(gps_code), ''), '5.6602529, -0.0391007')
WHERE map_latitude IS NULL OR map_longitude IS NULL;
