
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function checkSchema() {
  const supabase = createClient(supabaseUrl!, supabaseKey!);
  
  console.log('Checking inventory table structure...');
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching inventory:', error);
  } else {
    console.log('Sample data:', data);
    // Try to describe columns by checking a row
    if (data && data.length > 0) {
      console.log('Columns found:', Object.keys(data[0]));
    } else {
      console.log('Table is empty. Cannot determine columns via select.');
    }
  }

  // Try to check if sold_at exists specifically
  const { error: insertError } = await supabase
    .from('inventory')
    .insert([{ vin: 'test-schema-check', sold_at: new Date().toISOString() }]);

  if (insertError && insertError.message.includes('column "sold_at" of relation "inventory" does not exist')) {
    console.log('❌ sold_at column is MISSING');
  } else if (insertError && insertError.code === '42501') {
    console.log('⚠️ RLS Error: Permission denied for insert.');
  } else if (insertError) {
    console.log('Other error during test insert:', insertError);
  } else {
    console.log('✅ sold_at column EXISTS (or test insert failed differently)');
    // Cleanup
    await supabase.from('inventory').delete().eq('vin', 'test-schema-check');
  }
}

checkSchema();
