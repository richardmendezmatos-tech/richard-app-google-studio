import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const tables = ['inventory', 'inventory_vectors', 'vehicle_embeddings'];
  for (const table of tables) {
     const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
     console.log(`Table ${table}: ${error ? 'ERROR: ' + error.message : count + ' rows'}`);
  }
}

check();
