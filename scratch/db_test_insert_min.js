import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const testVin = 'TEST_MIN' + Math.floor(Math.random() * 1000000);
  const payload = {
    vin: testVin,
    make: 'Ford',
    model: 'Test',
    year: 2025,
    price: 1000
  };

  const { error } = await supabase.from('inventory_vectors').insert(payload);
  if (error) {
    console.log('Insert failed:', error.message);
  } else {
    console.log('Insert success! VIN:', testVin);
    await supabase.from('inventory_vectors').delete().eq('vin', testVin);
  }
}

run();
