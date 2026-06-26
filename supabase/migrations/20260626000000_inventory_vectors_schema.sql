-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create inventory_vectors table for semantic inventory search
CREATE TABLE IF NOT EXISTS public.inventory_vectors (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id       UUID NOT NULL REFERENCES public.inventory(id) ON DELETE CASCADE,
  car_name     TEXT NOT NULL,
  content      TEXT NOT NULL,
  embedding    vector(768),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast ANN search (cosine distance, IVFFlat)
CREATE INDEX IF NOT EXISTS inventory_vectors_embedding_idx
  ON public.inventory_vectors
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Index for car_id lookups (upsert / dedup)
CREATE INDEX IF NOT EXISTS inventory_vectors_car_id_idx
  ON public.inventory_vectors (car_id);

-- Replace match_inventory with vector-based semantic search.
-- The previous preference-based overload (p_lead_id, p_preferences) has been
-- superseded by this implementation; all TypeScript callers use query_embedding.
CREATE OR REPLACE FUNCTION public.match_inventory(
  query_embedding  vector(768),
  match_threshold  FLOAT    DEFAULT 0.35,
  match_count      INTEGER  DEFAULT 5
)
RETURNS TABLE (
  car_id      UUID,
  car_name    TEXT,
  content     TEXT,
  similarity  FLOAT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    iv.car_id,
    iv.car_name,
    iv.content,
    1 - (iv.embedding <=> query_embedding) AS similarity
  FROM public.inventory_vectors iv
  WHERE 1 - (iv.embedding <=> query_embedding) >= match_threshold
  ORDER BY iv.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Helper: upsert a single inventory vector (called by ReindexInventory use-case)
CREATE OR REPLACE FUNCTION public.upsert_inventory_vector(
  p_car_id    UUID,
  p_car_name  TEXT,
  p_content   TEXT,
  p_embedding vector(768)
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.inventory_vectors (car_id, car_name, content, embedding, updated_at)
  VALUES (p_car_id, p_car_name, p_content, p_embedding, now())
  ON CONFLICT (car_id)
  DO UPDATE SET
    car_name  = EXCLUDED.car_name,
    content   = EXCLUDED.content,
    embedding = EXCLUDED.embedding,
    updated_at = now();
END;
$$;

-- Unique constraint so upsert works on car_id
ALTER TABLE public.inventory_vectors
  DROP CONSTRAINT IF EXISTS inventory_vectors_car_id_unique;
ALTER TABLE public.inventory_vectors
  ADD CONSTRAINT inventory_vectors_car_id_unique UNIQUE (car_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS inventory_vectors_updated_at ON public.inventory_vectors;
CREATE TRIGGER inventory_vectors_updated_at
  BEFORE UPDATE ON public.inventory_vectors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
