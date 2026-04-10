-- ============================================================
-- Richard Automotive: Intelligence Expansion Migration
-- Phase 1: Smart Inventory Metadata
-- ============================================================

-- 1. Agregar columnas de inteligencia a vehicle_embeddings
ALTER TABLE vehicle_embeddings 
ADD COLUMN IF NOT EXISTS sales_pitch TEXT,
ADD COLUMN IF NOT EXISTS ideal_buyer TEXT;

-- 2. Asegurar que la tabla de leads tenga soporte para scoring y CMS
-- (Asumiendo que los leads se están integrando o espejando en Supabase para el Command Center)
CREATE TABLE IF NOT EXISTS lead_scoring (
  lead_id TEXT PRIMARY KEY,
  lead_name TEXT,
  score INT DEFAULT 50,
  priority TEXT DEFAULT 'medium',
  factors JSONB DEFAULT '[]',
  last_interaction TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Índices para el dashboard de Hot Leads
CREATE INDEX IF NOT EXISTS idx_lead_scoring_score ON lead_scoring (score DESC);
CREATE INDEX IF NOT EXISTS idx_lead_scoring_priority ON lead_scoring (priority);

-- 4. RLS para lead_scoring
ALTER TABLE lead_scoring ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access lead_scoring"
  ON lead_scoring FOR ALL
  USING (auth.role() = 'service_role');

-- Nota: Richard debe ejecutar este SQL en el Dashboard de Supabase.
