-- Performance indexes for common query patterns
-- Created: 2026-05-23 — Applied via Management API
-- Updated with actual table/column names matching public schema

-- 1. Inventory: dealer_id + status filter (storefront, admin)
CREATE INDEX IF NOT EXISTS idx_inventory_dealer_status
  ON public.inventory (dealer_id, status);

-- 2. Inventory: updated_at ordering (stale check, sync)
CREATE INDEX IF NOT EXISTS idx_inventory_updated_at
  ON public.inventory (updated_at DESC);

-- 3. Inventory: composite search (make/model/year)
CREATE INDEX IF NOT EXISTS idx_inventory_make_model_year
  ON public.inventory (make, model, year DESC);

-- 4. Leads: admin queries (status + date)
CREATE INDEX IF NOT EXISTS idx_leads_status_created
  ON public.leads (status, created_at DESC);

-- 5. Leads: phone deduplication and lookup
CREATE INDEX IF NOT EXISTS idx_leads_phone
  ON public.leads (phone);

-- 6. Profiles: email lookup (admin auth)
CREATE INDEX IF NOT EXISTS idx_profiles_email
  ON public.profiles (email);

-- 7. Profiles: role filter
CREATE INDEX IF NOT EXISTS idx_profiles_role
  ON public.profiles (role);

-- 8. Dealer inventory: updated_at ordering
CREATE INDEX IF NOT EXISTS idx_dealer_inventory_updated_at
  ON public.dealer_inventory (updated_at DESC);

-- 9. Inventory views: timeline queries
CREATE INDEX IF NOT EXISTS idx_inventory_views_viewed_at
  ON public.inventory_views (viewed_at DESC);
