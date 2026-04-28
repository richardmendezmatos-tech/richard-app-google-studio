import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Missing credentials');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const { data, error } = await supabase
    .from('inventory')
    .select('vin, make, model, price, mileage, images')
    .limit(5);

  if (error) {
    console.error('Error fetching data:', error.message);
  } else {
    console.log('--- Primeros 5 registros ---');
    console.log(JSON.stringify(data, null, 2));
  }
}

run().catch(console.error);
