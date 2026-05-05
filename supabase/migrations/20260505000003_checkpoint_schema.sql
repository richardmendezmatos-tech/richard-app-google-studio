-- Migration: Workspace Checkpoints Schema
-- For the "Workspace Manager" protocol traceability.

CREATE TABLE IF NOT EXISTS public.checkpoints (
    id TEXT PRIMARY KEY,
    fecha TEXT NOT NULL,
    categoria TEXT NOT NULL,
    titulo TEXT,
    resumen TEXT,
    estatus TEXT,
    datos JSONB DEFAULT '{}'::jsonb,
    eficiencia_estimada_ew NUMERIC,
    autor TEXT,
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- RLS for checkpoints
ALTER TABLE public.checkpoints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view checkpoints" ON public.checkpoints
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "System can upsert checkpoints" ON public.checkpoints
    FOR ALL USING (auth.role() = 'authenticated' OR true); -- Allowing service role bypass
