-- Migración: Sembrar tasas reales de FirstBank y Oriental Bank (Marzo-Abril 2026 / Septiembre 2024)
-- Creado: 2026-05-24
-- Autor: Richard Automotive Antigravity

-- 1. Limpiar tasas existentes para evitar duplicados
DELETE FROM public.bank_rates;

-- 2. BANCO POPULAR (TASA BASELINE PLACEHOLDER - A la espera del documento oficial)
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


-- 3. FIRSTBANK (TASAS REALES - Septiembre 2024)
-- Tier 1 (AA)
INSERT INTO public.bank_rates (bank_name, vehicle_condition, min_year, max_year, credit_tier, term, buy_rate, max_sell_rate) VALUES
('firstbank', 'new', 2025, 2027, 'tier_1', 36, 5.75, 7.75),
('firstbank', 'new', 2025, 2027, 'tier_1', 48, 5.95, 7.95),
('firstbank', 'new', 2025, 2027, 'tier_1', 60, 6.25, 8.25),
('firstbank', 'new', 2025, 2027, 'tier_1', 72, 6.25, 8.25),
('firstbank', 'new', 2025, 2027, 'tier_1', 84, 7.15, 9.15),
('firstbank', 'used', 2018, 2024, 'tier_1', 36, 13.95, 15.95),
('firstbank', 'used', 2018, 2024, 'tier_1', 48, 14.45, 16.45),
('firstbank', 'used', 2018, 2024, 'tier_1', 60, 12.25, 14.25),
('firstbank', 'used', 2018, 2024, 'tier_1', 72, 6.95, 8.95),
('firstbank', 'used', 2018, 2024, 'tier_1', 84, 7.55, 9.55);

-- Tier 2 (A)
INSERT INTO public.bank_rates (bank_name, vehicle_condition, min_year, max_year, credit_tier, term, buy_rate, max_sell_rate) VALUES
('firstbank', 'new', 2025, 2027, 'tier_2', 36, 6.45, 8.45),
('firstbank', 'new', 2025, 2027, 'tier_2', 48, 6.95, 8.95),
('firstbank', 'new', 2025, 2027, 'tier_2', 60, 7.20, 9.20),
('firstbank', 'new', 2025, 2027, 'tier_2', 72, 7.95, 9.95),
('firstbank', 'new', 2025, 2027, 'tier_2', 84, 8.75, 10.75),
('firstbank', 'used', 2018, 2024, 'tier_2', 36, 14.95, 16.95),
('firstbank', 'used', 2018, 2024, 'tier_2', 48, 15.75, 17.75),
('firstbank', 'used', 2018, 2024, 'tier_2', 60, 13.95, 15.95),
('firstbank', 'used', 2018, 2024, 'tier_2', 72, 8.95, 10.95),
('firstbank', 'used', 2018, 2024, 'tier_2', 84, 9.15, 11.15);

-- Tier 3 (B)
INSERT INTO public.bank_rates (bank_name, vehicle_condition, min_year, max_year, credit_tier, term, buy_rate, max_sell_rate) VALUES
('firstbank', 'new', 2025, 2027, 'tier_3', 36, 7.45, 9.45),
('firstbank', 'new', 2025, 2027, 'tier_3', 48, 7.95, 9.95),
('firstbank', 'new', 2025, 2027, 'tier_3', 60, 8.50, 10.50),
('firstbank', 'new', 2025, 2027, 'tier_3', 72, 9.25, 11.25),
('firstbank', 'new', 2025, 2027, 'tier_3', 84, 10.00, 12.00),
('firstbank', 'used', 2018, 2024, 'tier_3', 36, 15.95, 17.95),
('firstbank', 'used', 2018, 2024, 'tier_3', 48, 16.75, 18.75),
('firstbank', 'used', 2018, 2024, 'tier_3', 60, 15.45, 17.45),
('firstbank', 'used', 2018, 2024, 'tier_3', 72, 9.95, 11.95),
('firstbank', 'used', 2018, 2024, 'tier_3', 84, 10.25, 12.25);

-- Tier 4 (D)
INSERT INTO public.bank_rates (bank_name, vehicle_condition, min_year, max_year, credit_tier, term, buy_rate, max_sell_rate) VALUES
('firstbank', 'new', 2025, 2027, 'tier_4', 36, 10.95, 12.95),
('firstbank', 'new', 2025, 2027, 'tier_4', 48, 11.95, 13.95),
('firstbank', 'new', 2025, 2027, 'tier_4', 60, 12.95, 14.95),
('firstbank', 'new', 2025, 2027, 'tier_4', 72, 13.95, 15.95),
('firstbank', 'new', 2025, 2027, 'tier_4', 84, 15.25, 17.25),
('firstbank', 'used', 2018, 2024, 'tier_4', 36, 17.75, 19.75),
('firstbank', 'used', 2018, 2024, 'tier_4', 48, 18.75, 20.75),
('firstbank', 'used', 2018, 2024, 'tier_4', 60, 17.95, 19.95),
('firstbank', 'used', 2018, 2024, 'tier_4', 72, 14.45, 16.45),
('firstbank', 'used', 2018, 2024, 'tier_4', 84, 16.95, 18.95);


-- 4. ORIENTAL BANK (TASAS REALES - Abril 2026)
-- Tier 1 (T1)
INSERT INTO public.bank_rates (bank_name, vehicle_condition, min_year, max_year, credit_tier, term, buy_rate, max_sell_rate) VALUES
('oriental', 'new', 2025, 2027, 'tier_1', 36, 6.74, 8.74),
('oriental', 'new', 2025, 2027, 'tier_1', 48, 6.74, 8.74),
('oriental', 'new', 2025, 2027, 'tier_1', 60, 6.74, 8.74),
('oriental', 'new', 2025, 2027, 'tier_1', 72, 7.64, 9.64),
('oriental', 'new', 2025, 2027, 'tier_1', 84, 8.34, 10.34),
('oriental', 'used', 2018, 2024, 'tier_1', 36, 12.44, 14.44),
('oriental', 'used', 2018, 2024, 'tier_1', 48, 10.94, 12.94),
('oriental', 'used', 2018, 2024, 'tier_1', 60, 9.94, 11.94),
('oriental', 'used', 2018, 2024, 'tier_1', 72, 8.94, 10.94),
('oriental', 'used', 2018, 2024, 'tier_1', 84, 8.44, 10.44);

-- Tier 2 (T2)
INSERT INTO public.bank_rates (bank_name, vehicle_condition, min_year, max_year, credit_tier, term, buy_rate, max_sell_rate) VALUES
('oriental', 'new', 2025, 2027, 'tier_2', 36, 7.74, 9.74),
('oriental', 'new', 2025, 2027, 'tier_2', 48, 7.74, 9.74),
('oriental', 'new', 2025, 2027, 'tier_2', 60, 7.74, 9.74),
('oriental', 'new', 2025, 2027, 'tier_2', 72, 8.34, 10.34),
('oriental', 'new', 2025, 2027, 'tier_2', 84, 9.04, 11.04),
('oriental', 'used', 2018, 2024, 'tier_2', 36, 13.14, 15.14),
('oriental', 'used', 2018, 2024, 'tier_2', 48, 11.64, 13.64),
('oriental', 'used', 2018, 2024, 'tier_2', 60, 10.64, 12.64),
('oriental', 'used', 2018, 2024, 'tier_2', 72, 9.64, 11.64),
('oriental', 'used', 2018, 2024, 'tier_2', 84, 9.14, 11.14);

-- Tier 3 (T3)
INSERT INTO public.bank_rates (bank_name, vehicle_condition, min_year, max_year, credit_tier, term, buy_rate, max_sell_rate) VALUES
('oriental', 'new', 2025, 2027, 'tier_3', 36, 10.54, 12.54),
('oriental', 'new', 2025, 2027, 'tier_3', 48, 10.54, 12.54),
('oriental', 'new', 2025, 2027, 'tier_3', 60, 10.54, 12.54),
('oriental', 'new', 2025, 2027, 'tier_3', 72, 11.64, 13.64),
('oriental', 'new', 2025, 2027, 'tier_3', 84, 11.94, 13.94),
('oriental', 'used', 2018, 2024, 'tier_3', 36, 16.04, 18.04),
('oriental', 'used', 2018, 2024, 'tier_3', 48, 14.54, 16.54),
('oriental', 'used', 2018, 2024, 'tier_3', 60, 13.54, 15.54),
('oriental', 'used', 2018, 2024, 'tier_3', 72, 12.54, 14.54),
('oriental', 'used', 2018, 2024, 'tier_3', 84, 12.04, 14.04);

-- Tier 4 (T4)
INSERT INTO public.bank_rates (bank_name, vehicle_condition, min_year, max_year, credit_tier, term, buy_rate, max_sell_rate) VALUES
('oriental', 'new', 2025, 2027, 'tier_4', 36, 11.84, 13.84),
('oriental', 'new', 2025, 2027, 'tier_4', 48, 11.84, 13.84),
('oriental', 'new', 2025, 2027, 'tier_4', 60, 11.84, 13.84),
('oriental', 'new', 2025, 2027, 'tier_4', 72, 12.84, 14.84),
('oriental', 'new', 2025, 2027, 'tier_4', 84, 13.44, 15.44),
('oriental', 'used', 2018, 2024, 'tier_4', 36, 19.34, 21.34),
('oriental', 'used', 2018, 2024, 'tier_4', 48, 16.34, 18.34),
('oriental', 'used', 2018, 2024, 'tier_4', 60, 15.34, 17.34),
('oriental', 'used', 2018, 2024, 'tier_4', 72, 14.34, 16.34),
('oriental', 'used', 2018, 2024, 'tier_4', 84, 13.84, 15.84);
