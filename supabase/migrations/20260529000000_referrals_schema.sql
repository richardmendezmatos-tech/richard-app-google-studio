CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_phone TEXT NOT NULL,
    referrer_name TEXT,
    referee_name TEXT,
    referee_phone TEXT,
    referee_email TEXT,
    code TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'expired')),
    referrer_reward_type TEXT DEFAULT 'discount' CHECK (referrer_reward_type IN ('discount', 'gift_card', 'cash')),
    referrer_reward_amount NUMERIC DEFAULT 200,
    referee_reward_type TEXT DEFAULT 'discount' CHECK (referee_reward_type IN ('discount', 'gift_card', 'cash')),
    referee_reward_amount NUMERIC DEFAULT 100,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    converted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_phone ON public.referrals(referrer_phone);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Public can insert referrals (anyone can refer)
CREATE POLICY "public_insert_referrals" ON public.referrals
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Authenticated users can read their own referrals
CREATE POLICY "auth_select_own_referrals" ON public.referrals
    FOR SELECT
    TO authenticated
    USING (referrer_phone = current_setting('request.jwt.claims')::json->>'phone');

-- Service role can manage all
CREATE POLICY "service_role_all_referrals" ON public.referrals
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Admins can read all
CREATE POLICY "admin_select_referrals" ON public.referrals
    FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'agent')
    ));

CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$;
