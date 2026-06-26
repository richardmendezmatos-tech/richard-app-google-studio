-- F&I deal context captured from the DealDesker widget
CREATE TABLE IF NOT EXISTS public.hot_leads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id      UUID REFERENCES public.inventory(id) ON DELETE SET NULL,
  vehicle_name    TEXT,
  vehicle_price   NUMERIC(12,2),
  monthly_payment NUMERIC(10,2),
  down_payment    NUMERIC(10,2),
  trade_in        BOOLEAN DEFAULT false,
  term            INTEGER,
  credit_tier     TEXT,
  source          TEXT DEFAULT 'deal-desker',
  timestamp       TIMESTAMPTZ DEFAULT now(),
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hot_leads_vehicle_idx   ON public.hot_leads (vehicle_id);
CREATE INDEX IF NOT EXISTS hot_leads_created_idx   ON public.hot_leads (created_at DESC);

ALTER TABLE public.hot_leads ENABLE ROW LEVEL SECURITY;

-- Only service_role can read/write (F&I sensitive data)
CREATE POLICY "hot_leads_service_all"
  ON public.hot_leads FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Appointments: add public INSERT so test-drive / service forms can submit
-- without requiring authentication (guests booking via web)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'appointments' AND policyname = 'appointments_public_insert'
  ) THEN
    CREATE POLICY "appointments_public_insert"
      ON public.appointments FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;
