-- ============================================================
-- Richard Automotive: Sourcing Intelligence Migration
-- Phase 3: Purchase Orders & ROI Management
-- ============================================================

CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL,
  recommendation TEXT,
  estimated_roi NUMERIC(5,2),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  reason TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'archived')),
  unit_type TEXT, -- guagua, sedan, pickup, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsqueda rápida en el dashboard
CREATE INDEX IF NOT EXISTS idx_po_status ON purchase_orders (status);
CREATE INDEX IF NOT EXISTS idx_po_priority ON purchase_orders (priority);
CREATE INDEX IF NOT EXISTS idx_po_roi ON purchase_orders (estimated_roi DESC);

-- RLS (Row Level Security)
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

-- Service role full access (Internal APIs)
CREATE POLICY "Service role full access purchase_orders"
  ON purchase_orders FOR ALL
  USING (auth.role() = 'service_role');

-- Lectura pública para el dashboard (ajustar según auth final)
CREATE POLICY "Enable read for authenticated users"
  ON purchase_orders FOR SELECT
  USING (true);

-- Actualización desde el dashboard
CREATE POLICY "Enable update for service role"
  ON purchase_orders FOR UPDATE
  USING (auth.role() = 'service_role');

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_purchase_orders_modtime
    BEFORE UPDATE ON purchase_orders
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
