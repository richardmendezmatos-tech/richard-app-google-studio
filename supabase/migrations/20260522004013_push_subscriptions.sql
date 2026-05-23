-- Push subscription storage for Web Push API
CREATE TABLE IF NOT EXISTS push_subscriptions (
  endpoint TEXT PRIMARY KEY,
  auth TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Push notification logs
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

-- Public can upsert subscriptions
CREATE POLICY "Public can upsert push subscriptions"
  ON push_subscriptions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update push subscriptions"
  ON push_subscriptions FOR UPDATE
  TO public
  USING (true);

-- Service role full access
CREATE POLICY "Service role all push_subscriptions"
  ON push_subscriptions FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Service role all push_logs"
  ON push_logs FOR ALL
  TO service_role
  USING (true);
