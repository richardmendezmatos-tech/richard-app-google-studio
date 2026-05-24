-- Performance indexes for common query patterns
-- Created: 2026-05-23
-- Aplicar via Supabase Dashboard > SQL Editor

-- 1. Inventory: dealer_id + status filter (storefront, admin)
CREATE INDEX IF NOT EXISTS idx_inventory_dealer_status
  ON public.inventory (dealer_id, status);

-- 2. Inventory: updated_at ordering (stale check, sync)
CREATE INDEX IF NOT EXISTS idx_inventory_updated_at
  ON public.inventory (updated_at DESC);

-- 3. Inventory: composite search (make/model/year)
CREATE INDEX IF NOT EXISTS idx_inventory_make_model_year
  ON public.inventory (make, model, year DESC);

-- 4. Leads: admin queries (dealer + status + date)
CREATE INDEX IF NOT EXISTS idx_leads_dealer_status_created
  ON public.leads (dealer_id, status, created_at DESC);

-- 5. Leads: phone deduplication and lookup
CREATE INDEX IF NOT EXISTS idx_leads_phone
  ON public.leads (phone);

-- 6. Appraisal: VIN lookup (join with inventory)
CREATE INDEX IF NOT EXISTS idx_appraisal_vin
  ON public.appraisal (vin);

-- 7. Conversations: lead chat history ordering
CREATE INDEX IF NOT EXISTS idx_conversations_lead
  ON public.conversations (lead_id, created_at DESC);

-- 8. Users: email lookup (auth, admin)
CREATE INDEX IF NOT EXISTS idx_users_email
  ON public.users (email);
