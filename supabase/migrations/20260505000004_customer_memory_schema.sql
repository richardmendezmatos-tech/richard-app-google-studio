-- Migration: Customer Memory Schema
-- For long-term memory and cognitive profiling.

CREATE TABLE IF NOT EXISTS public.customer_memory (
    lead_id UUID PRIMARY KEY REFERENCES public.leads(id) ON DELETE CASCADE,
    preferences JSONB DEFAULT '{}'::jsonb,
    history TEXT[] DEFAULT '{}'::text[],
    notes TEXT[] DEFAULT '{}'::text[],
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for customer_memory
ALTER TABLE public.customer_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view customer memory" ON public.customer_memory
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "System can upsert customer memory" ON public.customer_memory
    FOR ALL USING (auth.role() = 'authenticated' OR true);

-- Realtime for live updates
alter publication supabase_realtime add table public.customer_memory;
