-- ══════════════════════════════════════════════════════
-- RICHARD AUTOMOTIVE — TODAS LAS MIGRACIONES PENDIENTES
-- ══════════════════════════════════════════════════════
-- Copia y pega TODO este archivo en el SQL Editor de
-- https://supabase.com/dashboard/project/dizzjfijsmxdlnfqydfk/sql/new
-- ══════════════════════════════════════════════════════

-- ──────────────────────────────────────────────
-- 1. SEARCH INDEXES (pg_trgm + GIN + tsvector)
-- ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

CREATE INDEX IF NOT EXISTS idx_inventory_make_model_trgm
  ON inventory USING GIN (make extensions.gin_trgm_ops, model extensions.gin_trgm_ops);

ALTER TABLE inventory ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION inventory_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('spanish', COALESCE(NEW.make,'') || ' ' || COALESCE(NEW.model,'') || ' ' || COALESCE(NEW.name,'') || ' ' || COALESCE(NEW.trim,''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_inventory_search_vector ON inventory;
CREATE TRIGGER trg_inventory_search_vector
  BEFORE INSERT OR UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION inventory_search_vector_update();

UPDATE inventory SET search_vector = to_tsvector('spanish', COALESCE(make,'') || ' ' || COALESCE(model,'') || ' ' || COALESCE(name,'') || ' ' || COALESCE(trim,'')) WHERE search_vector IS NULL;

CREATE INDEX IF NOT EXISTS idx_inventory_search_vector ON inventory USING GIN (search_vector);

-- ──────────────────────────────────────────────
-- 2. COMPOSITE INDEXES
-- ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_inventory_dealer_status ON inventory(dealer_id, status);
CREATE INDEX IF NOT EXISTS idx_inventory_dealer_category ON inventory(dealer_id, category);
CREATE INDEX IF NOT EXISTS idx_inventory_price_status ON inventory(price DESC, status);
CREATE INDEX IF NOT EXISTS idx_inventory_status_created ON inventory(status, created_at DESC);

-- ──────────────────────────────────────────────
-- 3. INVENTORY VIEWS (Social Proof)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id TEXT NOT NULL REFERENCES inventory(vin) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_id TEXT,
  source TEXT DEFAULT 'card' CHECK (source IN ('card', 'detail', 'search', 'compare')),
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_inventory_views_vehicle_id ON inventory_views(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_inventory_views_viewed_at ON inventory_views(viewed_at DESC);

CREATE OR REPLACE FUNCTION increment_vehicle_view(p_vehicle_id TEXT)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE total INTEGER;
BEGIN
  INSERT INTO inventory_views (vehicle_id, source) VALUES (p_vehicle_id, 'detail');
  SELECT COUNT(*)::INTEGER INTO total FROM inventory_views WHERE vehicle_id = p_vehicle_id;
  RETURN total;
END;
$$;

CREATE OR REPLACE FUNCTION get_vehicle_view_count(p_vehicle_id TEXT)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
DECLARE total INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO total FROM inventory_views WHERE vehicle_id = p_vehicle_id;
  RETURN total;
END;
$$;

CREATE OR REPLACE FUNCTION get_vehicle_daily_views(p_vehicle_id TEXT)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
DECLARE total INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO total FROM inventory_views WHERE vehicle_id = p_vehicle_id AND viewed_at >= NOW() - INTERVAL '24 hours';
  RETURN total;
END;
$$;

CREATE OR REPLACE FUNCTION get_vehicle_weekly_views(p_vehicle_id TEXT)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
DECLARE total INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO total FROM inventory_views WHERE vehicle_id = p_vehicle_id AND viewed_at >= NOW() - INTERVAL '7 days';
  RETURN total;
END;
$$;

CREATE OR REPLACE FUNCTION get_vehicle_lead_count(p_vehicle_id TEXT)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
DECLARE total INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO total FROM leads WHERE vehicle_id = p_vehicle_id;
  RETURN total;
END;
$$;

ALTER TABLE inventory_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can insert views" ON inventory_views FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public can read views" ON inventory_views FOR SELECT TO public USING (true);

-- ──────────────────────────────────────────────
-- 4. WEB VITALS (Core Web Vitals RUM)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS web_vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric TEXT NOT NULL,
  value NUMERIC NOT NULL,
  rating TEXT CHECK (rating IN ('good', 'needs-improvement', 'poor')),
  page TEXT,
  session_id TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_web_vitals_metric ON web_vitals(metric);
CREATE INDEX IF NOT EXISTS idx_web_vitals_timestamp ON web_vitals(timestamp DESC);

ALTER TABLE web_vitals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can insert web vitals" ON web_vitals FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Service role can read all web vitals" ON web_vitals FOR SELECT TO service_role USING (true);

-- ──────────────────────────────────────────────
-- 5. PUSH SUBSCRIPTIONS (Web Push API)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS push_subscriptions (
  endpoint TEXT PRIMARY KEY,
  auth TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS push_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  target TEXT DEFAULT 'all',
  sent INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can upsert push subscriptions" ON push_subscriptions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public can update push subscriptions" ON push_subscriptions FOR UPDATE TO public USING (true);
CREATE POLICY "Service role all push_subscriptions" ON push_subscriptions FOR ALL TO service_role USING (true);
CREATE POLICY "Service role all push_logs" ON push_logs FOR ALL TO service_role USING (true);

-- ══════════════════════════════════════════════════════
-- ✅ LISTO. 5 migraciones aplicadas en un solo script.
-- ══════════════════════════════════════════════════════


-- ══════════════════════════════════════════════════════
-- 9. FIX RLS BYPASS
-- ══════════════════════════════════════════════════════

-- Fix: Remove OR true bypass on RLS policies
ALTER TABLE public.checkpoints DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkpoints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "System can upsert checkpoints" ON public.checkpoints;
CREATE POLICY "System can upsert checkpoints" ON public.checkpoints
    FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admin can view checkpoints" ON public.checkpoints;
CREATE POLICY "Admin can view checkpoints" ON public.checkpoints
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

ALTER TABLE public.customer_memory DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_memory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "System can upsert customer memory" ON public.customer_memory;
CREATE POLICY "System can upsert customer memory" ON public.customer_memory
    FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admin can view customer memory" ON public.customer_memory;
CREATE POLICY "Admin can view customer memory" ON public.customer_memory
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ══════════════════════════════════════════════════════
-- 10. ENCRYPT SSN
-- ══════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.leads
    ADD COLUMN IF NOT EXISTS ssn_encrypted TEXT,
    ADD COLUMN IF NOT EXISTS ssn_encrypted_deterministic TEXT;

UPDATE public.leads
SET
    ssn_encrypted = CASE
        WHEN ssn IS NOT NULL AND ssn != '' THEN pgp_sym_encrypt(ssn, current_setting('app.settings.encryption_key', true))
        ELSE NULL
    END,
    ssn_encrypted_deterministic = CASE
        WHEN ssn IS NOT NULL AND ssn != '' THEN encode(encrypt(ssn::bytea, 'richard-auto-key'::bytea, 'aes-256-cbc'::text), 'base64')
        ELSE NULL
    END
WHERE ssn IS NOT NULL AND ssn != '';

COMMENT ON COLUMN public.leads.ssn IS 'DEPRECATED: Use ssn_encrypted instead. Will be removed after migration verified.';
COMMENT ON COLUMN public.leads.ssn_encrypted IS 'PGP encrypted SSN (asymmetric) - high security';
COMMENT ON COLUMN public.leads.ssn_encrypted_deterministic IS 'AES-256-CBC deterministic encryption for lookups (last 4 SSN matching)';

-- ══════════════════════════════════════════════════════
-- 11. MISSING TABLES
-- ══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.dealerships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.dealerships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active dealerships" ON public.dealerships
    FOR SELECT USING (is_active = true OR auth.role() = 'service_role');
CREATE POLICY "Admins can manage dealerships" ON public.dealerships
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ip_address TEXT,
    user_agent TEXT,
    device_type TEXT,
    location TEXT,
    started_at TIMESTAMPTZ DEFAULT now(),
    ended_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true
);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sessions" ON public.user_sessions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage sessions" ON public.user_sessions
    FOR ALL USING (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT,
    type TEXT DEFAULT 'info',
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage notifications" ON public.notifications
    FOR ALL USING (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS public.dealer_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dealer_id UUID NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,
    inventory_vin TEXT NOT NULL REFERENCES public.inventory(vin) ON DELETE CASCADE,
    price NUMERIC(10,2),
    status TEXT DEFAULT 'available',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(dealer_id, inventory_vin)
);

ALTER TABLE public.dealer_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view dealer inventory" ON public.dealer_inventory
    FOR SELECT USING (true);
CREATE POLICY "Admins can manage dealer inventory" ON public.dealer_inventory
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    page_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    device_info JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage analytics" ON public.analytics_events
    FOR ALL USING (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    key_prefix TEXT NOT NULL,
    scopes TEXT[] DEFAULT '{}'::text[],
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own API keys" ON public.api_keys
    FOR ALL USING (auth.uid() = user_id AND auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_dealer_inventory_dealer ON public.dealer_inventory(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_inventory_vin ON public.dealer_inventory(inventory_vin);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON public.analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON public.api_keys(user_id);

-- ══════════════════════════════════════════════════════
-- 12. MISSING RPCs
-- ══════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.batch_upsert_inventory(vehicles_data JSONB)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v JSONB;
BEGIN
    FOR v IN SELECT * FROM jsonb_array_elements(vehicles_data)
    LOOP
        INSERT INTO public.inventory (
            vin, price, status, mileage, images, trim,
            body_style, transmission, engine, drive_train,
            exterior_color, interior_color, last_scraped_at
        )
        VALUES (
            v->>'vin',
            (v->>'price')::numeric,
            v->>'status',
            (v->>'mileage')::integer,
            (v->>'images')::text[],
            v->>'trim',
            v->>'body_style',
            v->>'transmission',
            v->>'engine',
            v->>'drive_train',
            v->>'exterior_color',
            v->>'interior_color',
            (v->>'last_scraped_at')::timestamptz
        )
        ON CONFLICT (vin) DO UPDATE SET
            price = EXCLUDED.price,
            status = EXCLUDED.status,
            mileage = EXCLUDED.mileage,
            images = EXCLUDED.images,
            trim = EXCLUDED.trim,
            body_style = EXCLUDED.body_style,
            transmission = EXCLUDED.transmission,
            engine = EXCLUDED.engine,
            drive_train = EXCLUDED.drive_train,
            exterior_color = EXCLUDED.exterior_color,
            interior_color = EXCLUDED.interior_color,
            last_scraped_at = EXCLUDED.last_scraped_at;
    END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.match_inventory(
    p_lead_id UUID,
    p_preferences JSONB DEFAULT '{}'::jsonb,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
    vin TEXT,
    make TEXT,
    model TEXT,
    year INTEGER,
    price NUMERIC,
    mileage INTEGER,
    match_score NUMERIC,
    match_reason TEXT
)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
    v_pref_make TEXT := p_preferences->>'make';
    v_pref_model TEXT := p_preferences->>'model';
    v_pref_min_year INTEGER := (p_preferences->>'min_year')::INTEGER;
    v_pref_max_price NUMERIC := (p_preferences->>'max_price')::NUMERIC;
    v_pref_max_mileage INTEGER := (p_preferences->>'max_mileage')::INTEGER;
BEGIN
    RETURN QUERY
    SELECT
        i.vin,
        i.make,
        i.model,
        i.year,
        i.price,
        i.mileage,
        (
            CASE WHEN v_pref_make IS NULL OR i.make ILIKE v_pref_make THEN 25 ELSE 0 END +
            CASE WHEN v_pref_model IS NULL OR i.model ILIKE v_pref_model THEN 25 ELSE 0 END +
            CASE WHEN v_pref_min_year IS NULL OR i.year >= v_pref_min_year THEN 20 ELSE GREATEST(0, 20 - (v_pref_min_year - i.year)) END +
            CASE WHEN v_pref_max_price IS NULL OR i.price <= v_pref_max_price THEN 15 ELSE GREATEST(0, 15 - ((i.price - v_pref_max_price) / 1000)) END +
            CASE WHEN v_pref_max_mileage IS NULL OR i.mileage <= v_pref_max_mileage THEN 15 ELSE GREATEST(0, 15 - ((i.mileage - v_pref_max_mileage) / 5000)) END
        )::NUMERIC AS match_score,
        CASE
            WHEN v_pref_make IS NOT NULL AND i.make ILIKE v_pref_make AND v_pref_model IS NOT NULL AND i.model ILIKE v_pref_model THEN 'Exact make/model match'
            WHEN v_pref_make IS NOT NULL AND i.make ILIKE v_pref_make THEN 'Same make'
            WHEN v_pref_model IS NOT NULL AND i.model ILIKE v_pref_model THEN 'Same model'
            ELSE 'General inventory match'
        END AS match_reason
    FROM public.inventory i
    WHERE i.status IN ('AVAILABLE', 'PENDING', 'available')
    ORDER BY match_score DESC, i.price ASC
    LIMIT p_limit;
END;
$$;

CREATE OR REPLACE FUNCTION public.search_inventory_vector(
    p_search_query TEXT,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
    vin TEXT,
    make TEXT,
    model TEXT,
    year INTEGER,
    price NUMERIC,
    mileage INTEGER,
    trim TEXT,
    body_style TEXT,
    transmission TEXT,
    engine TEXT,
    drive_train TEXT,
    exterior_color TEXT,
    interior_color TEXT,
    images TEXT[],
    rank REAL
)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
    v_query TSVECTOR := plainto_tsquery('english', p_search_query);
BEGIN
    RETURN QUERY
    SELECT
        i.vin,
        i.make,
        i.model,
        i.year,
        i.price,
        i.mileage,
        i.trim,
        i.body_style,
        i.transmission,
        i.engine,
        i.drive_train,
        i.exterior_color,
        i.interior_color,
        i.images,
        ts_rank(i.search_vector, v_query) AS rank
    FROM public.inventory i
    WHERE i.search_vector @@ v_query
        AND i.status IN ('AVAILABLE', 'PENDING', 'available')
    ORDER BY rank DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_nearby_dealerships(
    p_city TEXT,
    p_state TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
    id UUID,
    name TEXT,
    slug TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    phone TEXT,
    distance_score INTEGER
)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.id,
        d.name,
        d.slug,
        d.address,
        d.city,
        d.state,
        d.phone,
        CASE
            WHEN LOWER(d.city) = LOWER(p_city) AND (p_state IS NULL OR LOWER(d.state) = LOWER(p_state)) THEN 100
            WHEN LOWER(d.city) = LOWER(p_city) THEN 80
            WHEN p_state IS NOT NULL AND LOWER(d.state) = LOWER(p_state) THEN 50
            ELSE 10
        END AS distance_score
    FROM public.dealerships d
    WHERE d.is_active = true
    ORDER BY distance_score DESC, d.name ASC
    LIMIT p_limit;
END;
$$;

-- ══════════════════════════════════════════════════════
-- 13. RLS AUTHENTICATED HARDENING
-- ══════════════════════════════════════════════════════

-- Ensure ALL tables have RLS enabled
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename NOT IN ('schema_migrations', 'audit_logs')
        AND tablename NOT IN (
            SELECT tablename FROM pg_tables
            WHERE schemaname = 'public'
            AND EXISTS (
                SELECT 1 FROM pg_policies
                WHERE schemaname = 'public' AND tablename = pg_tables.tablename
            )
        )
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    END LOOP;
END;
$$;
