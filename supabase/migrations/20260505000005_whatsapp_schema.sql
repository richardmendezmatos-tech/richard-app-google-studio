-- Migration: WhatsApp Automation Schema
-- Tracks messages, conversions and scheduled follow-ups.

CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    message TEXT NOT NULL,
    direction TEXT CHECK (direction IN ('inbound', 'outbound')),
    status TEXT CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    media_url TEXT,
    template TEXT,
    provider TEXT DEFAULT 'twilio-mock',
    timestamp TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.whatsapp_conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT NOT NULL,
    conversion_type TEXT CHECK (conversion_type IN ('appointment', 'test_drive', 'sale', 'lead')),
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.scheduled_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT NOT NULL,
    car_id TEXT,
    scheduled_time TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled')),
    type TEXT DEFAULT 'follow_up',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can access WhatsApp data" ON public.whatsapp_messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can access WhatsApp conversions" ON public.whatsapp_conversions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can access scheduled messages" ON public.scheduled_messages FOR ALL USING (auth.role() = 'authenticated');

-- Realtime
alter publication supabase_realtime add table public.whatsapp_messages;
