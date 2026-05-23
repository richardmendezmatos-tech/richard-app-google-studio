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

CREATE POLICY "Public can insert web vitals"
  ON web_vitals FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Service role can read all web vitals"
  ON web_vitals FOR SELECT
  TO service_role
  USING (true);
