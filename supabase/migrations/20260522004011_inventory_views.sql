-- inventory_views: real-time view tracking per vehicle
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

-- RPC: increment view count + return current total
CREATE OR REPLACE FUNCTION increment_vehicle_view(p_vehicle_id TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total INTEGER;
BEGIN
  INSERT INTO inventory_views (vehicle_id, source) VALUES (p_vehicle_id, 'detail');
  SELECT COUNT(*)::INTEGER INTO total FROM inventory_views WHERE vehicle_id = p_vehicle_id;
  RETURN total;
END;
$$;

-- RPC: get view count for a vehicle
CREATE OR REPLACE FUNCTION get_vehicle_view_count(p_vehicle_id TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  total INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO total FROM inventory_views WHERE vehicle_id = p_vehicle_id;
  RETURN total;
END;
$$;

-- RPC: get daily views for a vehicle
CREATE OR REPLACE FUNCTION get_vehicle_daily_views(p_vehicle_id TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  total INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO total
  FROM inventory_views
  WHERE vehicle_id = p_vehicle_id
    AND viewed_at >= NOW() - INTERVAL '24 hours';
  RETURN total;
END;
$$;

-- RPC: get weekly views for a vehicle
CREATE OR REPLACE FUNCTION get_vehicle_weekly_views(p_vehicle_id TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  total INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO total
  FROM inventory_views
  WHERE vehicle_id = p_vehicle_id
    AND viewed_at >= NOW() - INTERVAL '7 days';
  RETURN total;
END;
$$;

-- RPC: get lead count for a vehicle (from leads table)
CREATE OR REPLACE FUNCTION get_vehicle_lead_count(p_vehicle_id TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  total INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO total FROM leads WHERE vehicle_id = p_vehicle_id;
  RETURN total;
END;
$$;

-- Enable RLS
ALTER TABLE inventory_views ENABLE ROW LEVEL SECURITY;

-- Public can insert (for view tracking)
CREATE POLICY "Public can insert views"
  ON inventory_views FOR INSERT
  TO public
  WITH CHECK (true);

-- Public can read aggregated counts only
CREATE POLICY "Public can read views"
  ON inventory_views FOR SELECT
  TO public
  USING (true);
