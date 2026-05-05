-- Migration: Create Video Content table
CREATE TABLE IF NOT EXISTS public.video_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    car_id TEXT NOT NULL,
    type TEXT NOT NULL,
    content JSONB NOT NULL,
    status TEXT DEFAULT 'ready',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for video_content
ALTER TABLE public.video_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Video content accessible by authenticated users" ON public.video_content
    FOR ALL USING (auth.role() = 'authenticated');
