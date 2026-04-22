
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkInventory() {
  const { data, count, error } = await supabase
    .from('inventory')
    .select('*', { count: 'exact' });
  
  if (error) {
    console.error('Error fetching inventory:', error);
    return;
  }
  
  console.log('Total vehicles in inventory:', count);
  console.log('First 5 vehicles:', data?.slice(0, 5).map(v => ({ vin: v.vin, make: v.make, model: v.model })));
}

checkInventory();
