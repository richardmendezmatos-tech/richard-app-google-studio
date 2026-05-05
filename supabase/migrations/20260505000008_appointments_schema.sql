-- Migration: Appointments Schema
-- For scheduling test drives and closings.

CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    vehicle_id TEXT,
    appointment_date TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled', 'completed')),
    dealer_id TEXT DEFAULT 'richard-automotive',
    type TEXT CHECK (type IN ('test-drive', 'closing', 'service')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can access appointments" ON public.appointments FOR ALL USING (auth.role() = 'authenticated');

-- Realtime
alter publication supabase_realtime add table public.appointments;
