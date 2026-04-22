import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase.rpc('inspect_table_schema', { table_name: 'inventory_vectors' });
  if (error) {
    console.log('RPC inspect_table_schema failed (expected if not exists). Trying alternative...');
    const { data: cols, error: err2 } = await supabase.from('inventory_vectors').select('*').limit(0);
    // Even with 0 rows, sometimes we can get headers or just check the error message if we ask for a non-existent col
    console.log('Fetching col "vin" to see if it exists...');
    const { error: err3 } = await supabase.from('inventory_vectors').select('vin').limit(1);
    console.log('Column "vin" exists?', !err3);
    if (err3) console.log('Error:', err3.message);
  } else {
    console.log('Schema:', data);
  }
}

run();
