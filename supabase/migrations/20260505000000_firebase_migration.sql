-- Migration: Firebase to Supabase PostgreSQL schema
-- Creates tables for Leads, Logs, and Chats to replace Firestore.

-- 1. Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    monthly_income TEXT,
    time_at_job TEXT,
    job_title TEXT,
    employer TEXT,
    vehicle_id TEXT,
    has_pronto BOOLEAN DEFAULT false,
    ssn TEXT,
    address_line_1 TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    housing_type TEXT,
    time_at_address TEXT,
    time_at_employer TEXT,
    has_credit_application BOOLEAN DEFAULT false,
    chat_interactions INTEGER DEFAULT 0,
    viewed_inventory_multiple_times BOOLEAN DEFAULT false,
    location TEXT,
    category TEXT CHECK (category IN ('HOT', 'WARM', 'COLD')),
    status TEXT DEFAULT 'new',
    responded BOOLEAN DEFAULT false,
    documents_sent BOOLEAN DEFAULT false,
    deal_closed BOOLEAN DEFAULT false,
    appointment_completed BOOLEAN DEFAULT false,
    vehicle_of_interest TEXT,
    work_status TEXT,
    down_payment_amount NUMERIC,
    trade_in TEXT,
    
    -- JSONB for nested/flexible data that changes often
    ai_analysis JSONB DEFAULT '{}'::jsonb,
    behavioral_metrics JSONB DEFAULT '{}'::jsonb,
    email_sequence JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leads accessible by authenticated users" ON public.leads
    FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Leads insertable by service role" ON public.leads
    FOR INSERT WITH CHECK (true);

-- 2. Logs Table (for telemetry, replacing FirestoreLogRepository)
CREATE TABLE IF NOT EXISTS public.logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level TEXT NOT NULL, -- e.g., 'info', 'error', 'warn'
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    source TEXT,
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- Enable Realtime for logs (Telemetry)
alter publication supabase_realtime add table public.logs;

-- RLS for logs
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Logs read-only for authenticated" ON public.logs
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Logs insertable by any" ON public.logs
    FOR INSERT WITH CHECK (true); -- Usually API routes insert logs via service role or anon

-- 3. Chats Table (for replacing FirestoreChatRepository)
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    user_id UUID, -- References auth.users if needed
    message TEXT NOT NULL,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant', 'system')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for chats
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own chats" ON public.chats
    FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'authenticated');
CREATE POLICY "Users can insert chats" ON public.chats
    FOR INSERT WITH CHECK (true);

-- Functions and Triggers
-- Auto update updated_at timestamp on leads
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_modtime
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
