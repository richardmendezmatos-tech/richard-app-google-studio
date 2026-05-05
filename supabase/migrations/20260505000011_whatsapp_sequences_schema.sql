-- Migration: WhatsApp Sequences Schema
-- For managing automated WhatsApp follow-up flows.

CREATE TABLE IF NOT EXISTS public.whatsapp_sequences (
    lead_id UUID PRIMARY KEY REFERENCES public.leads(id) ON DELETE CASCADE,
    current_stage TEXT NOT NULL,
    sequence_data JSONB DEFAULT '{}'::jsonb,
    last_interaction TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.whatsapp_sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can access sequences" ON public.whatsapp_sequences FOR ALL USING (auth.role() = 'authenticated');
