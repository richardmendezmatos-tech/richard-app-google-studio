import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('--- Checking inventory_vectors table ---');
  const { data, error } = await supabase.from('inventory_vectors').select('*').limit(1);
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Sample Row:', data[0]);
    console.log('Columns:', Object.keys(data[0] || {}));
  }

  console.log('\n--- Checking inventory table ---');
  const { data: invData, error: invError } = await supabase.from('inventory').select('*').limit(1);
  if (invError) {
    console.error('Error:', invError.message);
  } else {
    console.log('Sample Row:', invData[0]);
    console.log('Columns:', Object.keys(invData[0] || {}));
  }
}

check();
