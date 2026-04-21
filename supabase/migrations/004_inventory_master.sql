-- ============================================================
-- Richard Automotive: Inventory Master Migration
-- Phase 4: Transactional Inventory & Sync Tracking
-- ============================================================

-- 1. Tabla maestra de inventario
CREATE TABLE IF NOT EXISTS inventory (
  vin TEXT PRIMARY KEY,
  make TEXT NOT NULL DEFAULT 'Ford',
  model TEXT NOT NULL,
  year INT NOT NULL,
  price NUMERIC(12,2) DEFAULT 0,
  mileage NUMERIC DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'PENDING', 'SOLD', 'ARCHIVED')),
  condition TEXT DEFAULT 'USED' CHECK (condition IN ('NEW', 'USED')),
  dealer_id TEXT DEFAULT 'central-ford-vega-alta',
  
  -- Telemetría de Scraping
  last_scraped_at TIMESTAMPTZ DEFAULT NOW(),
  sold_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Índices para rendimiento del Command Center
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory (status);
CREATE INDEX IF NOT EXISTS idx_inventory_condition ON inventory (condition);
CREATE INDEX IF NOT EXISTS idx_inventory_make_model ON inventory (make, model);
CREATE INDEX IF NOT EXISTS idx_inventory_price ON inventory (price DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_dealer ON inventory (dealer_id);

-- 3. RLS (Row Level Security)
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Lectura pública (Para el storefront y dashboard)
CREATE POLICY "Public read access for inventory"
  ON inventory FOR SELECT
  USING (true);

-- Acceso total para el service role (El Scraper usa este rol)
CREATE POLICY "Service role full access for inventory"
  ON inventory FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 4. Trigger para updated_at
CREATE TRIGGER update_inventory_modtime
    BEFORE UPDATE ON inventory
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
