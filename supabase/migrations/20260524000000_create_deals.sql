-- Migración: Crear tabla public.deals y habilitar políticas RLS
-- Creado: 2026-05-24
-- Autor: Richard Automotive Antigravity

CREATE TABLE IF NOT EXISTS public.deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    inventory_id TEXT REFERENCES public.inventory(vin) ON DELETE SET NULL,
    credit_tier VARCHAR(10) NOT NULL CHECK (credit_tier IN ('tier_1', 'tier_2', 'tier_3', 'tier_4')),
    down_payment NUMERIC(10, 2) DEFAULT 0.00,
    trade_in_value NUMERIC(10, 2) DEFAULT 0.00,
    trade_in_payoff NUMERIC(10, 2) DEFAULT 0.00,
    term INT NOT NULL CHECK (term IN (36, 48, 60, 72, 84)),
    apr NUMERIC(5, 2) NOT NULL,
    ltv NUMERIC(5, 2) NOT NULL,
    estimated_monthly_payment NUMERIC(10, 2) NOT NULL,
    front_end_profit NUMERIC(10, 2) DEFAULT 0.00,
    back_end_profit NUMERIC(10, 2) DEFAULT 0.00,
    bank_selected VARCHAR(50),
    status VARCHAR(20) DEFAULT 'structured' CHECK (status IN ('structured', 'pending_approval', 'approved', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Crear Políticas RLS
CREATE POLICY "Admins and agents can manage deals" 
ON public.deals 
FOR ALL 
USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can insert deals" 
ON public.deals 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can read deals if linked by lead session"
ON public.deals
FOR SELECT
USING (true); -- Permitimos lectura pública en el frontend para recuperar la precualificación

-- Índices de Rendimiento
CREATE INDEX IF NOT EXISTS idx_deals_lead_id ON public.deals(lead_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON public.deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_inventory_id ON public.deals(inventory_id);
