import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { count, error } = await supabase.from('inventory').select('*', { count: 'exact', head: true });
  if (error) {
    console.error('Error in inventory:', error.message);
  } else {
    console.log('Count in inventory:', count);
  }

  const { count: vCount, error: vError } = await supabase.from('inventory_vectors').select('*', { count: 'exact', head: true });
  if (vError) {
    console.error('Error in inventory_vectors:', vError.message);
  } else {
    console.log('Count in inventory_vectors:', vCount);
  }
}

check();
