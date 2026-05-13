-- Migration: Sentinel N25 Security Hardening (RLS)
-- Restricts system logs and metrics to admin users only.

-- 1. Hardening system_logs
DROP POLICY IF EXISTS "Allow authenticated service access to logs" ON public.system_logs;

CREATE POLICY "Admins can view system logs"
ON public.system_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Note: No INSERT policy needed as agents use SERVICE_ROLE_KEY (bypasses RLS)
-- If we ever need non-service-role agents to log, we can add a policy here.

-- 2. Hardening sentinel_metrics
DROP POLICY IF EXISTS "Allow authenticated service access to metrics" ON public.sentinel_metrics;

CREATE POLICY "Admins can view sentinel metrics"
ON public.sentinel_metrics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can manage sentinel metrics"
ON public.sentinel_metrics
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 3. Verify RLS is enabled (should be from previous migration but just in case)
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentinel_metrics ENABLE ROW LEVEL SECURITY;
