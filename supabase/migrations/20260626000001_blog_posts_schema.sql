-- Blog posts published by the AI newsroom (news-sync cron)
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                  TEXT NOT NULL,
  slug                   TEXT NOT NULL UNIQUE,
  excerpt                TEXT,
  content                TEXT,
  author                 TEXT DEFAULT 'Richard AI Newsroom',
  tags                   TEXT[] DEFAULT '{}',
  meta_description       TEXT,
  estimated_reading_time TEXT,
  image_url              TEXT,
  ford_news_url          TEXT,
  published_at           TIMESTAMPTZ DEFAULT now(),
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS blog_posts_slug_idx       ON public.blog_posts (slug);
CREATE INDEX IF NOT EXISTS blog_posts_published_idx  ON public.blog_posts (published_at DESC);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts
CREATE POLICY "blog_posts_public_select"
  ON public.blog_posts FOR SELECT
  USING (true);

-- Only service_role and admins can write
CREATE POLICY "blog_posts_service_insert"
  ON public.blog_posts FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "blog_posts_service_update"
  ON public.blog_posts FOR UPDATE
  USING (auth.role() = 'service_role');

CREATE POLICY "blog_posts_service_delete"
  ON public.blog_posts FOR DELETE
  USING (auth.role() = 'service_role');

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_blog_posts_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_blog_posts_updated_at();


-- Deduplication cache for Ford media RSS articles
CREATE TABLE IF NOT EXISTS public.ford_news_cache (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url_hash   TEXT NOT NULL UNIQUE,
  title      TEXT,
  url        TEXT,
  source     TEXT,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  status     TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'published', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ford_news_cache_hash_idx ON public.ford_news_cache (url_hash);

ALTER TABLE public.ford_news_cache ENABLE ROW LEVEL SECURITY;

-- Restricted to service_role only (internal cache, no public access)
CREATE POLICY "ford_news_cache_service_all"
  ON public.ford_news_cache FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
