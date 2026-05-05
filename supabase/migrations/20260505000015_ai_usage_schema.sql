-- Migration: Create AI Usage table for observability
CREATE TABLE IF NOT EXISTS public.ai_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model TEXT NOT NULL,
    prompt_tokens INTEGER NOT NULL,
    completion_tokens INTEGER NOT NULL,
    total_tokens INTEGER NOT NULL,
    latency_ms INTEGER NOT NULL,
    feature TEXT NOT NULL,
    lead_id TEXT,
    estimated_cost NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for ai_usage
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "AI usage accessible by authenticated users" ON public.ai_usage
    FOR ALL USING (auth.role() = 'authenticated');
