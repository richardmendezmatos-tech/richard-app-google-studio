-- ============================================================
-- Richard Automotive: Full-Text Search & pg_trgm Support
-- Enables fast ilike wildcard searches, tsvector full-text search,
-- and composite indexes for inventory queries.
-- ============================================================

-- 1. Enable pg_trgm extension (safe to run even if already enabled)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. GIN index for fast ilike wildcard searches on make, model, and name
CREATE INDEX IF NOT EXISTS idx_inventory_make_model_trgm
  ON inventory USING gin (make gin_trgm_ops, model gin_trgm_ops);

-- 3. Add search_vector column for full-text search (Spanish)
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 4. GIN index on the search_vector column
CREATE INDEX IF NOT EXISTS idx_inventory_search_vector
  ON inventory USING gin (search_vector);

-- 5. Function to generate search_vector from make, model, name
CREATE OR REPLACE FUNCTION inventory_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('spanish', COALESCE(NEW.make, '')), 'A') ||
    setweight(to_tsvector('spanish', COALESCE(NEW.model, '')), 'B') ||
    setweight(to_tsvector('spanish', COALESCE(NEW.name, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger to auto-update search_vector on INSERT or UPDATE
DROP TRIGGER IF EXISTS trg_inventory_search_vector ON inventory;
CREATE TRIGGER trg_inventory_search_vector
  BEFORE INSERT OR UPDATE OF make, model, name
  ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION inventory_search_vector_update();

-- 7. Backfill search_vector for existing rows
UPDATE inventory SET search_vector =
  setweight(to_tsvector('spanish', COALESCE(make, '')), 'A') ||
  setweight(to_tsvector('spanish', COALESCE(model, '')), 'B') ||
  setweight(to_tsvector('spanish', COALESCE(name, '')), 'C')
WHERE search_vector IS NULL;
