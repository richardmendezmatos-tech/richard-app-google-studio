-- RLS hardening for inventory_vectors
ALTER TABLE public.inventory_vectors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON public.inventory_vectors
  FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "public_select" ON public.inventory_vectors
  FOR SELECT
  TO anon, authenticated
  USING (true);
