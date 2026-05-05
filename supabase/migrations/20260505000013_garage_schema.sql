-- Migration: Create Garage table
CREATE TABLE IF NOT EXISTS public.garage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    mileage INTEGER NOT NULL,
    vin TEXT,
    last_service_date TIMESTAMPTZ,
    next_service_due TIMESTAMPTZ,
    estimated_value NUMERIC,
    status TEXT CHECK (status IN ('active', 'sold', 'archived')) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for garage
ALTER TABLE public.garage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Garage accessible by authenticated users" ON public.garage
    FOR ALL USING (auth.role() = 'authenticated');
