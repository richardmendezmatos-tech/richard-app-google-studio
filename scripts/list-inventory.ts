import { createClient } from '../src/shared/api/supabase/client';

async function listInventory() {
  const supabase = createClient();
  const { data, error } = await supabase.from('inventory').select('vin, make, model, images').limit(5);
  
  if (error) {
    console.error('❌ Error listing inventory:', error.message);
    return;
  }
  
  console.log('🚗 Inventory found:', JSON.stringify(data, null, 2));
}

listInventory();
