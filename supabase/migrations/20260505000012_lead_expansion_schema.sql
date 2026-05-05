-- Migration: Expand Leads table for CRM functionality
-- Adding marketing data and customer memory fields.

ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS marketing_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS customer_memory JSONB DEFAULT '{}'::jsonb;
