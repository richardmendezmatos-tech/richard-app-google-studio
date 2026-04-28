import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !anonKey || !serviceKey) {
    console.error('❌ Missing credentials');
    process.exit(1);
  }

  console.log('--- Probando con SERVICE_ROLE_KEY ---');
  const supabaseService = createClient(supabaseUrl, serviceKey);
  const { data: dataService, error: errorService, count: countService } = await supabaseService
    .from('inventory')
    .select('*', { count: 'exact', head: true });

  if (errorService) console.error('Error con Service Role:', errorService.message);
  else console.log(`Registros encontrados con Service Role: ${countService}`);

  console.log('\n--- Probando con ANON_KEY ---');
  const supabaseAnon = createClient(supabaseUrl, anonKey);
  const { data: dataAnon, error: errorAnon, count: countAnon } = await supabaseAnon
    .from('inventory')
    .select('*', { count: 'exact', head: true });

  if (errorAnon) console.error('Error con Anon:', errorAnon.message);
  else console.log(`Registros encontrados con Anon: ${countAnon}`);
}

run().catch(console.error);
