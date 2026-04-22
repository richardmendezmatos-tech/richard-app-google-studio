import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const testVin = 'TEST_CARS' + Math.floor(Math.random() * 1000000);
  const { error } = await supabase.from('cars').insert({ vin: testVin, make: 'Ford', model: 'Test', year: 2025, price: 1000 });
  if (error) {
    console.log('Insert into cars failed:', error.message);
  } else {
    console.log('Insert into cars success! VIN:', testVin);
    await supabase.from('cars').delete().eq('vin', testVin);
  }
}

run();
