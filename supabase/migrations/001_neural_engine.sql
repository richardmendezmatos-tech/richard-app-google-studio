-- ============================================================
-- Richard Automotive: Supabase Migration
-- Neural Match Engine + WhatsApp Automation Infrastructure
-- ============================================================

-- 1. Habilitar extensión vectorial (si no existe)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Tabla de embeddings de vehículos
CREATE TABLE IF NOT EXISTS vehicle_embeddings (
  car_id TEXT PRIMARY KEY,
  car_name TEXT NOT NULL,
  content TEXT,
  embedding vector(1536),
  make TEXT,
  model TEXT,
  year INT,
  price NUMERIC,
  status TEXT DEFAULT 'available',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Cola de mensajes WhatsApp
CREATE TABLE IF NOT EXISTS message_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id TEXT NOT NULL,
  lead_name TEXT,
  lead_phone TEXT,
  step_label TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'failed')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de search gaps (si no existe)
CREATE TABLE IF NOT EXISTS search_gaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL,
  detected_intent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Función RPC para búsqueda semántica (match_inventory)
CREATE OR REPLACE FUNCTION match_inventory(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  car_id TEXT,
  car_name TEXT,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ve.car_id,
    ve.car_name,
    ve.content,
    1 - (ve.embedding <=> query_embedding) AS similarity
  FROM vehicle_embeddings ve
  WHERE ve.status = 'available'
    AND 1 - (ve.embedding <=> query_embedding) > match_threshold
  ORDER BY ve.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 6. Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_vehicle_embeddings_cosine
  ON vehicle_embeddings USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_message_queue_status
  ON message_queue (status, scheduled_at);

CREATE INDEX IF NOT EXISTS idx_message_queue_lead
  ON message_queue (lead_id);

CREATE INDEX IF NOT EXISTS idx_search_gaps_created
  ON search_gaps (created_at DESC);

-- 7. RLS (Row Level Security) — Políticas básicas
ALTER TABLE vehicle_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_gaps ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública de embeddings (para búsqueda)
CREATE POLICY IF NOT EXISTS "Public read vehicle_embeddings"
  ON vehicle_embeddings FOR SELECT
  USING (true);

-- Permitir inserción de search gaps desde el cliente
CREATE POLICY IF NOT EXISTS "Public insert search_gaps"
  ON search_gaps FOR INSERT
  WITH CHECK (true);

-- Service role tiene acceso total (para APIs del server)
CREATE POLICY IF NOT EXISTS "Service role full access vehicle_embeddings"
  ON vehicle_embeddings FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY IF NOT EXISTS "Service role full access message_queue"
  ON message_queue FOR ALL
  USING (auth.role() = 'service_role');
