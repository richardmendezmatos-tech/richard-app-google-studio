-- Migration: Create Intent Signals table
CREATE TABLE IF NOT EXISTS public.intent_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    car_id TEXT,
    dealer_id TEXT,
    event_type TEXT NOT NULL,
    value NUMERIC,
    session_id TEXT NOT NULL,
    lead_id TEXT,
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- RLS for intent_signals
ALTER TABLE public.intent_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Intent signals insertable by any" ON public.intent_signals
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Intent signals readable by authenticated" ON public.intent_signals
    FOR SELECT USING (auth.role() = 'authenticated');
