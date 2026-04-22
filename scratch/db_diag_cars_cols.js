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
  } else {
    console.log('Columns in cars:', Object.keys(data[0] || {}));
  }
}

run();
