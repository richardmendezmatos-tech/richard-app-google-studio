-- Migration: Voice Intelligence Schema
-- For real-time call analysis and rebuttals.

CREATE TABLE IF NOT EXISTS public.live_call_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id TEXT NOT NULL,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    transcript_snippet TEXT,
    sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    suggested_rebuttal TEXT,
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.live_call_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view call insights" ON public.live_call_insights FOR SELECT USING (auth.role() = 'authenticated');

-- Realtime
alter publication supabase_realtime add table public.live_call_insights;
