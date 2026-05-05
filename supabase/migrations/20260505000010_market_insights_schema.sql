-- Migration: Market Insights Schema
-- For storing scraped car prices and market trends in PR.

CREATE TABLE IF NOT EXISTS public.market_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    average_price NUMERIC,
    lowest_price NUMERIC,
    highest_price NUMERIC,
    listing_count INTEGER,
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.market_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view market insights" ON public.market_insights FOR SELECT USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_market_insights_make_model ON public.market_insights(make, model);
