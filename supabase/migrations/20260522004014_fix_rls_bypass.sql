-- Fix: Remove OR true bypass on RLS policies
-- The OR true made RLS completely ineffective

ALTER TABLE public.checkpoints DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkpoints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "System can upsert checkpoints" ON public.checkpoints;
CREATE POLICY "System can upsert checkpoints" ON public.checkpoints
    FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admin can view checkpoints" ON public.checkpoints;
CREATE POLICY "Admin can view checkpoints" ON public.checkpoints
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

ALTER TABLE public.customer_memory DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_memory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "System can upsert customer memory" ON public.customer_memory;
CREATE POLICY "System can upsert customer memory" ON public.customer_memory
    FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admin can view customer memory" ON public.customer_memory;
CREATE POLICY "Admin can view customer memory" ON public.customer_memory
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
