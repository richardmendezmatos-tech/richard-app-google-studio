import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('--- Checking inventory table columns ---');
  const { data, error } = await supabase.from('inventory').select('*').limit(1);
  if (error) {
    console.error('Error fetching from inventory:', error.message);
    return;
  }
  if (data && data.length > 0) {
    const columns = Object.keys(data[0]);
    console.log('Columns found:', columns.join(', '));
    console.log('Does "sold_at" exist?', columns.includes('sold_at'));
  } else {
    console.log('No data found in inventory table to inspect columns.');
    // Try to select specifically sold_at
    const { error: err2 } = await supabase.from('inventory').select('sold_at').limit(1);
    console.log('Does "sold_at" exist? (check by selection)', !err2);
    if (err2) console.log('Error:', err2.message);
  }
}

check();
