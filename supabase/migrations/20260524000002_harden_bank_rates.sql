-- Migración: Endurecimiento de Seguridad para public.bank_rates (Confidencialidad)
-- Creado: 2026-05-24
-- Autor: Richard Automotive Antigravity

-- 1. Eliminar la política pública de lectura que permitía acceso anónimo
DROP POLICY IF EXISTS "Anyone can read bank_rates" ON public.bank_rates;

-- 2. Asegurar que las políticas existentes solo permitan acceso a usuarios autenticados (Richard y agentes)
DROP POLICY IF EXISTS "Admins and agents can manage bank_rates" ON public.bank_rates;

CREATE POLICY "Admins and agents can manage bank_rates" 
ON public.bank_rates 
FOR ALL 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
