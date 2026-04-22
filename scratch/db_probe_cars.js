import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase.from('cars').select('*').limit(1);
  if (error) {
    console.error('Error fetching cars:', error.message);
  } else if (data.length > 0) {
    console.log('Columns in cars:', Object.keys(data[0]));
  } else {
    // If empty, try to get schema via RPC if possible or just try to select some common cols
    console.log('Table cars is empty. Probing columns...');
    const cols = ['id', 'vin', 'make', 'model', 'year', 'price', 'status'];
    for (const c of cols) {
      const { error: err } = await supabase.from('cars').select(c).limit(1);
      console.log(`Column [${c}]:`, err ? `ERROR: ${err.message}` : 'FOUND');
    }
  }
}

run();
