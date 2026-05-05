-- Migration: Conversations Schema
-- Stores multi-channel interaction history for RAG.

CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    source TEXT CHECK (source IN ('whatsapp', 'web', 'sms')),
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can access conversations" ON public.conversations FOR ALL USING (auth.role() = 'authenticated');

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_conversations_lead_id ON public.conversations(lead_id);
