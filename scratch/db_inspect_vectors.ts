import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.rpc('inspect_table_schema', { table_name: 'inventory_vectors' });
  if (error) {
     // If RPC doesn't exist, try a direct query to check if it's a view
     const { data: viewData, error: viewError } = await supabase.from('inventory_vectors').select('*').limit(1);
     console.log('Direct query result:', viewData);
     if (viewError) console.error('Direct query error:', viewError.message);
  } else {
     console.log('Schema:', data);
  }
}

check();
