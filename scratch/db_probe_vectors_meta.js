import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const cols = ['id', 'metadata', 'content', 'embedding', 'created_at'];
  for (const c of cols) {
    const { error: err } = await supabase.from('inventory_vectors').select(c).limit(1);
    console.log(`Column [${c}]:`, err ? `ERROR: ${err.message}` : 'FOUND');
  }
}

run();
