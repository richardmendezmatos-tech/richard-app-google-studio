import { createClient } from '@supabase/supabase-js';

async function fixRLS() {
  // Use service role to manage RLS policies
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log('🔧 Verificando tabla leads y políticas RLS...');

  // Test insert with anon key to see if it's blocked
  const anon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const { error: anonError } = await anon.from('leads').insert({
    first_name: 'TEST',
    last_name: 'RLS_CHECK',
    phone: '787-000-0000',
    email: 'test@rls-check.com',
    status: 'new',
  }).select('id').single();

  if (anonError) {
    console.log('⚠️  Anon insert blocked:', anonError.code, '-', anonError.message);
    console.log('   → Usando service role para crear la policy pública de INSERT...\n');

    // Can't run DDL via REST, but we can verify the service role works fine
    const { data, error: adminError } = await admin.from('leads').insert({
      first_name: 'SENTINEL',
      last_name: 'TEST_LEAD',
      phone: '787-555-0001',
      email: 'sentinel@richard-automotive.com',
      vehicle_of_interest: 'Hyundai Tucson 2026',
      category: 'HOT',
      status: 'new',
      behavioral_metrics: { source: 'cli_test', notes: 'Test lead from sentinel CLI' },
    }).select('id').single();

    if (adminError) {
      console.error('❌ Admin insert also failed:', adminError.message);
    } else {
      console.log('✅ Service role insert OK — Lead ID:', data.id);
      console.log('\n⚠️  PUBLIC INSERT POLICY NEEDED');
      console.log('   Go to: https://supabase.com/dashboard/project/dizzjfijsmxdlnfqydfk/sql/new');
      console.log('   Run: CREATE POLICY "Public insert" ON public.leads FOR INSERT WITH CHECK (true);');
    }
  } else {
    console.log('✅ Anon insert OK — RLS allows public inserts.');
  }
}

fixRLS().catch(err => console.error('Fatal:', err.message));
