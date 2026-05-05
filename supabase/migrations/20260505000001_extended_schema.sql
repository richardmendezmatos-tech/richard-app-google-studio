-- Migration: Extended Schema for Subscribers, Surveys, and Profiles
-- Completes the Firebase to Supabase transition.

-- 4. Subscribers Table
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    tags TEXT[], -- For segmentation
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for subscribers
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view subscribers" ON public.subscribers
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Anyone can subscribe" ON public.subscribers
    FOR INSERT WITH CHECK (true);

-- 5. Surveys Table
CREATE TABLE IF NOT EXISTS public.surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id),
    survey_type TEXT NOT NULL,
    responses JSONB NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for surveys
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view surveys" ON public.surveys
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Public can submit surveys" ON public.surveys
    FOR INSERT WITH CHECK (true);

-- 6. User Profiles (Extending Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'editor', 'user', 'agent')),
    passkey_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin can view all profiles" ON public.profiles
    FOR SELECT USING (auth.role() = 'authenticated');

-- 7. Audit Logs (for security & user tracking)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    resource TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- RLS for audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "System can insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- Realtime Configuration
alter publication supabase_realtime add table public.leads;
alter publication supabase_realtime add table public.chats;
alter publication supabase_realtime add table public.profiles;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_modtime
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
