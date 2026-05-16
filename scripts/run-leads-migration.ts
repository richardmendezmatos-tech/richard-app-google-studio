import { createClient } from '@supabase/supabase-js';

async function runMigration() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log('🔧 Aplicando migración: leads table...');

  const sql = `
    CREATE TABLE IF NOT EXISTS public.leads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      first_name TEXT NOT NULL DEFAULT '',
      last_name TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      monthly_income TEXT,
      time_at_job TEXT,
      job_title TEXT,
      employer TEXT,
      vehicle_id TEXT,
      has_pronto BOOLEAN DEFAULT false,
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
      ai_analysis JSONB DEFAULT '{}'::jsonb,
      behavioral_metrics JSONB DEFAULT '{}'::jsonb,
      email_sequence JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Service role full access'
      ) THEN
        CREATE POLICY "Service role full access" ON public.leads FOR ALL USING (true);
      END IF;
    END $$;
  `;

  const { error } = await supabase.rpc('exec_sql' as any, { sql }).single();

  if (error) {
    // Try direct approach via REST
    console.log('⚠️  RPC no disponible, intentando vía fetch directo...');
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
      body: JSON.stringify({ sql }),
    });

    if (!res.ok) {
      // Fallback: try inserting a dummy record to check if table exists
      const { error: checkError } = await supabase.from('leads').select('id').limit(1);
      if (checkError?.code === 'PGRST205') {
        console.log('\n❌ La tabla no existe y no se puede crear via API REST.');
        console.log('👉 Ve a: https://supabase.com/dashboard/project/dizzjfijsmxdlnfqydfk/sql/new');
        console.log('   y ejecuta el SQL de supabase/migrations/20260505000000_firebase_migration.sql\n');
        process.exit(1);
      }
    }
  }

  // Verify table exists
  const { error: verifyError } = await supabase.from('leads').select('id').limit(1);
  
  if (verifyError && verifyError.code !== 'PGRST116') {
    console.error('❌ Verificación fallida:', verifyError.message);
    process.exit(1);
  }

  console.log('✅ Tabla leads lista en Supabase.');
}

runMigration().catch(err => {
  console.error('❌ Error fatal:', err.message);
  process.exit(1);
});
