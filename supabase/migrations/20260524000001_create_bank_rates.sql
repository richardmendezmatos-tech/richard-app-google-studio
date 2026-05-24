-- Migración: Crear tabla public.bank_rates y sembrar tasas baseline
-- Creado: 2026-05-24
-- Autor: Richard Automotive Antigravity

CREATE TABLE IF NOT EXISTS public.bank_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_name VARCHAR(50) NOT NULL CHECK (bank_name IN ('popular', 'firstbank', 'oriental')),
    vehicle_condition VARCHAR(10) NOT NULL CHECK (vehicle_condition IN ('new', 'used')),
    min_year INT NOT NULL,
    max_year INT NOT NULL,
    credit_tier VARCHAR(10) NOT NULL CHECK (credit_tier IN ('tier_1', 'tier_2', 'tier_3', 'tier_4')),
    term INT NOT NULL CHECK (term IN (36, 48, 60, 72, 84)),
    buy_rate NUMERIC(5, 2) NOT NULL,
    max_sell_rate NUMERIC(5, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.bank_rates ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admins and agents can manage bank_rates" 
ON public.bank_rates 
FOR ALL 
USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can read bank_rates" 
ON public.bank_rates 
FOR SELECT 
USING (true);

-- Índices de velocidad para búsquedas rápidas en el DealDesker
CREATE INDEX IF NOT EXISTS idx_bank_rates_lookup 
ON public.bank_rates(bank_name, vehicle_condition, credit_tier, term);

-- Sembrar tasas baseline para Banco Popular, FirstBank y Oriental
-- Formato de inserción: bank_name, vehicle_condition, min_year, max_year, credit_tier, term, buy_rate, max_sell_rate

DELETE FROM public.bank_rates;

-- 1. BANCO POPULAR (Tasas sólidas, políticas tradicionales)
-- Tier 1
INSERT INTO public.bank_rates (bank_name, vehicle_condition, min_year, max_year, credit_tier, term, buy_rate, max_sell_rate) VALUES
('popular', 'new', 2025, 2027, 'tier_1', 36, 5.75, 7.75),
('popular', 'new', 2025, 2027, 'tier_1', 48, 5.95, 7.95),
('popular', 'new', 2025, 2027, 'tier_1', 60, 6.25, 8.25),
('popular', 'new', 2025, 2027, 'tier_1', 72, 6.45, 8.45),
('popular', 'new', 2025, 2027, 'tier_1', 84, 6.95, 8.95),
('popular', 'used', 2018, 2024, 'tier_1', 36, 6.25, 8.25),
('popular', 'used', 2018, 2024, 'tier_1', 48, 6.45, 8.45),
('popular', 'used', 2018, 2024, 'tier_1', 60, 6.75, 8.75),
('popular', 'used', 2018, 2024, 'tier_1', 72, 6.95, 8.95),
('popular', 'used', 2018, 2024, 'tier_1', 84, 7.45, 9.45);

-- Tier 2
INSERT INTO public.bank_rates (bank_name, vehicle_condition, min_year, max_year, credit_tier, term, buy_rate, max_sell_rate) VALUES
('popular', 'new', 2025, 2027, 'tier_2', 36, 6.75, 8.75),
('popular', 'new', 2025, 2027, 'tier_2', 48, 6.95, 8.95),
('popular', 'new', 2025, 2027, 'tier_2', 60, 7.25, 9.25),
('popular', 'new', 2025, 2027, 'tier_2', 72, 7.45, 9.45),
('popular', 'new', 2025, 2027, 'tier_2', 84, 7.95, 9.95),
('popular', 'used', 2018, 2024, 'tier_2', 36, 7.25, 9.25),
('popular', 'used', 2018, 2024, 'tier_2', 48, 7.45, 9.45),
('popular', 'used', 2018, 2024, 'tier_2', 60, 7.75, 9.75),
('popular', 'used', 2018, 2024, 'tier_2', 72, 7.95, 9.95),
('popular', 'used', 2018, 2024, 'tier_2', 84, 8.45, 10.45);

-- Tier 3
INSERT INTO public.bank_rates (bank_name, vehicle_condition, min_year, max_year, credit_tier, term, buy_rate, max_sell_rate) VALUES
('popular', 'new', 2025, 2027, 'tier_3', 36, 8.95, 10.95),
('popular', 'new', 2025, 2027, 'tier_3', 48, 9.25, 11.25),
('popular', 'new', 2025, 2027, 'tier_3', 60, 9.75, 11.75),
('popular', 'new', 2025, 2027, 'tier_3', 72, 9.95, 11.95),
('popular', 'new', 2025, 2027, 'tier_3', 84, 10.45, 12.45),
('popular', 'used', 2018, 2024, 'tier_3', 36, 9.45, 11.45),
('popular', 'used', 2018, 2024, 'tier_3', 48, 9.75, 11.75),
('popular', 'used', 2018, 2024, 'tier_3', 60, 10.25, 12.25),
('popular', 'used', 2018, 2024, 'tier_3', 72, 10.45, 12.45),
('popular', 'used', 2018, 2024, 'tier_3', 84, 11.25, 13.25);

-- Tier 4
INSERT INTO public.bank_rates (bank_name, vehicle_condition, min_year, max_year, credit_tier, term, buy_rate, max_sell_rate) VALUES
('popular', 'new', 2025, 2027, 'tier_4', 36, 12.95, 14.95),
('popular', 'new', 2025, 2027, 'tier_4', 48, 13.25, 15.25),
('popular', 'new', 2025, 2027, 'tier_4', 60, 13.75, 15.75),
('popular', 'new', 2025, 2027, 'tier_4', 72, 13.95, 15.95),
('popular', 'new', 2025, 2027, 'tier_4', 84, 14.95, 16.95),
('popular', 'used', 2018, 2024, 'tier_4', 36, 13.45, 15.45),
('popular', 'used', 2018, 2024, 'tier_4', 48, 13.75, 15.75),
('popular', 'used', 2018, 2024, 'tier_4', 60, 14.25, 16.25),
('popular', 'used', 2018, 2024, 'tier_4', 72, 14.95, 16.95),
('popular', 'used', 2018, 2024, 'tier_4', 84, 15.95, 17.95);


-- 2. FIRSTBANK (Tasas más agresivas en Tiers altos, excelente para autos nuevos)
-- Tier 1
INSERT INTO public.bank_rates (bank_name, vehicle_condition, min_year, max_year, credit_tier, term, buy_rate, max_sell_rate) VALUES
('firstbank', 'new', 2025, 2027, 'tier_1', 36, 5.45, 7.45),
('firstbank', 'new', 2025, 2027, 'tier_1', 48, 5.75, 7.75),
('firstbank', 'new', 2025, 2027, 'tier_1', 60, 5.95, 7.95),
('firstbank', 'new', 2025, 2027, 'tier_1', 72, 6.25, 8.25),
('firstbank', 'new', 2025, 2027, 'tier_1', 84, 6.75, 8.75),
('firstbank', 'used', 2018, 2024, 'tier_1', 36, 5.95, 7.95),
('firstbank', 'used', 2018, 2024, 'tier_1', 48, 6.25, 8.25),
('firstbank', 'used', 2018, 2024, 'tier_1', 60, 6.45, 8.45),
('firstbank', 'used', 2018, 2024, 'tier_1', 72, 6.75, 8.75),
('firstbank', 'used', 2018, 2024, 'tier_1', 84, 7.25, 9.25);

-- Tier 2
INSERT INTO public.bank_rates (bank_name, vehicle_condition, min_year, max_year, credit_tier, term, buy_rate, max_sell_rate) VALUES
('firstbank', 'new', 2025, 2027, 'tier_2', 36, 6.45, 8.45),
('firstbank', 'new', 2025, 2027, 'tier_2', 48, 6.75, 8.75),
('firstbank', 'new', 2025, 2027, 'tier_2', 60, 6.95, 8.95),
('firstbank', 'new', 2025, 2027, 'tier_2', 72, 7.25, 9.25),
('firstbank', 'new', 2025, 2027, 'tier_2', 84, 7.75, 9.75),
('firstbank', 'used', 2018, 2024, 'tier_2', 36, 6.95, 8.95),
('firstbank', 'used', 2018, 2024, 'tier_2', 48, 7.25, 9.25),
('firstbank', 'used', 2018, 2024, 'tier_2', 60, 7.45, 9.45),
('firstbank', 'used', 2018, 2024, 'tier_2', 72, 7.75, 9.75),
('firstbank', 'used', 2018, 2024, 'tier_2', 84, 8.25, 10.25);

-- Tier 3
INSERT INTO public.bank_rates (bank_name, vehicle_condition, min_year, max_year, credit_tier, term, buy_rate, max_sell_rate) VALUES
('firstbank', 'new', 2025, 2027, 'tier_3', 36, 8.75, 10.75),
('firstbank', 'new', 2025, 2027, 'tier_3', 48, 8.95, 10.95),
('firstbank', 'new', 2025, 2027, 'tier_3', 60, 9.45, 11.45),
('firstbank', 'new', 2025, 2027, 'tier_3', 72, 9.75, 11.75),
('firstbank', 'new', 2025, 2027, 'tier_3', 84, 10.25, 12.25),
('firstbank', 'used', 2018, 2024, 'tier_3', 36, 9.25, 11.25),
('firstbank', 'used', 2018, 2024, 'tier_3', 48, 9.45, 11.45),
('firstbank', 'used', 2018, 2024, 'tier_3', 60, 9.95, 11.95),
('firstbank', 'used', 2018, 2024, 'tier_3', 72, 10.25, 12.25),
('firstbank', 'used', 2018, 2024, 'tier_3', 84, 10.95, 12.95);

-- Tier 4
INSERT INTO public.bank_rates (bank_name, vehicle_condition, min_year, max_year, credit_tier, term, buy_rate, max_sell_rate) VALUES
('firstbank', 'new', 2025, 2027, 'tier_4', 36, 12.75, 14.75),
('firstbank', 'new', 2025, 2027, 'tier_4', 48, 12.95, 14.95),
('firstbank', 'new', 2025, 2027, 'tier_4', 60, 13.45, 15.45),
('firstbank', 'new', 2025, 2027, 'tier_4', 72, 13.75, 15.75),
('firstbank', 'new', 2025, 2027, 'tier_4', 84, 14.75, 16.75),
('firstbank', 'used', 2018, 2024, 'tier_4', 36, 13.25, 15.25),
('firstbank', 'used', 2018, 2024, 'tier_4', 48, 13.45, 15.45),
('firstbank', 'used', 2018, 2024, 'tier_4', 60, 13.95, 15.95),
('firstbank', 'used', 2018, 2024, 'tier_4', 72, 14.75, 16.75),
('firstbank', 'used', 2018, 2024, 'tier_4', 84, 15.75, 17.75);


-- 3. ORIENTAL (Políticas flexibles de crédito medio Tier 2/3, excelente para autos usados)
-- Tier 1
INSERT INTO public.bank_rates (bank_name, vehicle_condition, min_year, max_year, credit_tier, term, buy_rate, max_sell_rate) VALUES
('oriental', 'new', 2025, 2027, 'tier_1', 36, 5.95, 7.95),
('oriental', 'new', 2025, 2027, 'tier_1', 48, 6.15, 8.15),
('oriental', 'new', 2025, 2027, 'tier_1', 60, 6.45, 8.45),
('oriental', 'new', 2025, 2027, 'tier_1', 72, 6.75, 8.75),
('oriental', 'new', 2025, 2027, 'tier_1', 84, 7.25, 9.25),
('oriental', 'used', 2018, 2024, 'tier_1', 36, 6.15, 8.15),
('oriental', 'used', 2018, 2024, 'tier_1', 48, 6.35, 8.35),
('oriental', 'used', 2018, 2024, 'tier_1', 60, 6.65, 8.65),
('oriental', 'used', 2018, 2024, 'tier_1', 72, 6.95, 8.95),
('oriental', 'used', 2018, 2024, 'tier_1', 84, 7.45, 9.45);

-- Tier 2
INSERT INTO public.bank_rates (bank_name, vehicle_condition, min_year, max_year, credit_tier, term, buy_rate, max_sell_rate) VALUES
('oriental', 'new', 2025, 2027, 'tier_2', 36, 6.95, 8.95),
('oriental', 'new', 2025, 2027, 'tier_2', 48, 7.15, 9.15),
('oriental', 'new', 2025, 2027, 'tier_2', 60, 7.45, 9.45),
('oriental', 'new', 2025, 2027, 'tier_2', 72, 7.75, 9.75),
('oriental', 'new', 2025, 2027, 'tier_2', 84, 8.25, 10.25),
('oriental', 'used', 2018, 2024, 'tier_2', 36, 6.75, 8.75),
('oriental', 'used', 2018, 2024, 'tier_2', 48, 6.95, 8.95),
('oriental', 'used', 2018, 2024, 'tier_2', 60, 7.25, 9.25),
('oriental', 'used', 2018, 2024, 'tier_2', 72, 7.45, 9.45),
('oriental', 'used', 2018, 2024, 'tier_2', 84, 7.95, 9.95);

-- Tier 3
INSERT INTO public.bank_rates (bank_name, vehicle_condition, min_year, max_year, credit_tier, term, buy_rate, max_sell_rate) VALUES
('oriental', 'new', 2025, 2027, 'tier_3', 36, 8.45, 10.45),
('oriental', 'new', 2025, 2027, 'tier_3', 48, 8.75, 10.75),
('oriental', 'new', 2025, 2027, 'tier_3', 60, 8.95, 10.95),
('oriental', 'new', 2025, 2027, 'tier_3', 72, 9.25, 11.25),
('oriental', 'new', 2025, 2027, 'tier_3', 84, 9.75, 11.75),
('oriental', 'used', 2018, 2024, 'tier_3', 36, 8.95, 10.95),
('oriental', 'used', 2018, 2024, 'tier_3', 48, 9.25, 11.25),
('oriental', 'used', 2018, 2024, 'tier_3', 60, 9.45, 11.45),
('oriental', 'used', 2018, 2024, 'tier_3', 72, 9.75, 11.75),
('oriental', 'used', 2018, 2024, 'tier_3', 84, 10.45, 12.45);

-- Tier 4
INSERT INTO public.bank_rates (bank_name, vehicle_condition, min_year, max_year, credit_tier, term, buy_rate, max_sell_rate) VALUES
('oriental', 'new', 2025, 2027, 'tier_4', 36, 12.45, 14.45),
('oriental', 'new', 2025, 2027, 'tier_4', 48, 12.75, 14.75),
('oriental', 'new', 2025, 2027, 'tier_4', 60, 12.95, 14.95),
('oriental', 'new', 2025, 2027, 'tier_4', 72, 13.25, 15.25),
('oriental', 'new', 2025, 2027, 'tier_4', 84, 14.25, 16.25),
('oriental', 'used', 2018, 2024, 'tier_4', 36, 12.95, 14.95),
('oriental', 'used', 2018, 2024, 'tier_4', 48, 13.25, 15.25),
('oriental', 'used', 2018, 2024, 'tier_4', 60, 13.45, 15.45),
('oriental', 'used', 2018, 2024, 'tier_4', 72, 13.75, 15.75),
('oriental', 'used', 2018, 2024, 'tier_4', 84, 14.75, 16.75);
