-- Migration: Behavioral Events Schema
-- Tracks user interactions for retargeting and cognitive profiling.

CREATE TABLE IF NOT EXISTS public.behavioral_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    car_id TEXT,
    action TEXT CHECK (action IN ('view', 'garage_add', 'configure', 'doc_upload')),
    metadata JSONB DEFAULT '{}'::jsonb,
    session_id TEXT,
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.behavioral_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can insert behavioral events" ON public.behavioral_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can view behavioral events" ON public.behavioral_events FOR SELECT USING (auth.role() = 'authenticated');
