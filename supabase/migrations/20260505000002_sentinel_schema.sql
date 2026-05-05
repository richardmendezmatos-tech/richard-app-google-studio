-- Migration: raSentinel Metrics Schema
-- For monitoring business health and conversion friction.

CREATE TABLE IF NOT EXISTS public.sentinel_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    operational_score INTEGER DEFAULT 100,
    friction_point TEXT,
    persuasion_profile TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- RLS for sentinel_metrics
ALTER TABLE public.sentinel_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view sentinel metrics" ON public.sentinel_metrics
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Public can insert sentinel metrics" ON public.sentinel_metrics
    FOR INSERT WITH CHECK (true);

-- Realtime for live dashboarding
alter publication supabase_realtime add table public.sentinel_metrics;
