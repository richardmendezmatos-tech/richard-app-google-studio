-- Migration: Sentinel N25 Telemetry Optimization
-- Resolves 404 errors by establishing core metrics and logging tables.

-- 1. Sentinel Metrics Table
CREATE TABLE IF NOT EXISTS public.sentinel_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    data JSONB,
    operational_score INTEGER DEFAULT 0,
    friction_point TEXT,
    persuasion_profile TEXT,
    metadata JSONB,
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- 2. System Logs Table (Audit Trail)
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level TEXT DEFAULT 'info',
    category TEXT,
    message TEXT NOT NULL,
    metadata JSONB,
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.sentinel_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated service access to metrics" 
ON public.sentinel_metrics FOR ALL USING (true);

CREATE POLICY "Allow authenticated service access to logs" 
ON public.system_logs FOR ALL USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sentinel_metrics_type ON public.sentinel_metrics(type);
CREATE INDEX IF NOT EXISTS idx_sentinel_metrics_timestamp ON public.sentinel_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_system_logs_category ON public.system_logs(category);
