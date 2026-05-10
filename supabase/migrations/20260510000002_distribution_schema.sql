-- Migration: Distribution Logs Schema
-- Tracks the status of inventory distribution across different platforms.

CREATE TABLE IF NOT EXISTS public.distribution_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    car_id TEXT NOT NULL, -- References inventory(id)
    platform TEXT NOT NULL, -- 'facebook_marketplace', 'clasificados_online', etc.
    status TEXT NOT NULL DEFAULT 'pending', -- 'active', 'pending', 'error', 'none'
    external_url TEXT,
    error_msg TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    last_sync TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Unique constraint for upsert support
ALTER TABLE public.distribution_logs ADD CONSTRAINT unique_car_platform UNIQUE (car_id, platform);

-- RLS Policies
ALTER TABLE public.distribution_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated service access to distribution_logs" 
ON public.distribution_logs FOR ALL USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_distribution_logs_car_id ON public.distribution_logs(car_id);
CREATE INDEX IF NOT EXISTS idx_distribution_logs_platform ON public.distribution_logs(platform);
CREATE INDEX IF NOT EXISTS idx_distribution_logs_status ON public.distribution_logs(status);

-- Foreign key comment (Inventory is likely in public.inventory)
-- ALTER TABLE public.distribution_logs ADD CONSTRAINT fk_distribution_car FOREIGN KEY (car_id) REFERENCES public.inventory(id);
