import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { error } = await supabase.from('inventory_vectors').select('xyz_non_existent').limit(1);
  if (error) {
    console.log('Error Message:', error.message);
    console.log('Error Details:', error.details);
    console.log('Error Hint:', error.hint);
  }
}

run();
