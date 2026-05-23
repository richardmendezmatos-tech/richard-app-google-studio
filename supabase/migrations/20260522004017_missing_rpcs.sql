-- Migration: Missing RPCs for Supabase audit
-- Creates match_inventory and vector search RPCs + batch_upsert_inventory

-- 1. batch_upsert_inventory: Atomic batch upsert for inventory
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

-- 2. match_inventory: AI-driven inventory matching RPC
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

-- 3. search_inventory_vector: Full-text vector search RPC
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
    vehicle_trim TEXT,
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

-- 4. get_nearby_dealerships: Geographic search (using city/state)
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
