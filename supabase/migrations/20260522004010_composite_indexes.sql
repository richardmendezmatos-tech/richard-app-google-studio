-- ============================================================
-- Richard Automotive: Composite Indexes for Inventory Queries
-- Optimizes common filter patterns used by the storefront and
-- distribution agent.
-- ============================================================

-- 1. dealer_id + status: used by getInventory() and distribution queries
CREATE INDEX IF NOT EXISTS idx_inventory_dealer_status
  ON inventory (dealer_id, status);

-- 2. dealer_id + category: used by storefront filter
CREATE INDEX IF NOT EXISTS idx_inventory_dealer_category
  ON inventory (dealer_id, category);

-- 3. status + created_at: used by distribution agent to fetch newest available units
CREATE INDEX IF NOT EXISTS idx_inventory_status_created
  ON inventory (status, created_at DESC);

-- 4. price + status: used by sorted storefront queries
CREATE INDEX IF NOT EXISTS idx_inventory_price_status
  ON inventory (price DESC, status);

-- 5. Add category column if not present (used by many storefront filters)
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS category TEXT;

-- 6. Add name column if not present (used by search_vector and display)
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS name TEXT;
