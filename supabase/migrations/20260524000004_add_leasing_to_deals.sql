-- Migración: Añadir estructura de leasing a la tabla de deals
-- Creado: 2026-05-24
-- Autor: Richard Automotive Antigravity

ALTER TABLE public.deals 
ADD COLUMN IF NOT EXISTS structure_type VARCHAR(20) DEFAULT 'conventional' CHECK (structure_type IN ('conventional', 'leasing')),
ADD COLUMN IF NOT EXISTS residual_value NUMERIC(10, 2) DEFAULT 0.00;
