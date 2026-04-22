import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  // Postgrest doesn't allow listing tables directly easily without RPC or schema inspection
  // But we can try to guess or use the SQL API if we have access (we don't via anon/service key directly in JS client usually)
  // However, we can try to hit the root endpoint or just try a few likely names.
  
  console.log('Probing tables...');
  const tables = ['inventory', 'inventory_vectors', 'vehicles', 'cars', 'vehicle_inventory', 'vehicle_embeddings'];
  for (const t of tables) {
    const { error } = await supabase.from(t).select('*').limit(0);
    console.log(`Table [${t}]:`, error ? `ERROR: ${error.message}` : 'FOUND');
  }
}

run();
