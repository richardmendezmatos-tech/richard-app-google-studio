import { createClient } from '../src/shared/api/supabase/client';

async function checkBuckets() {
  const supabase = createClient();
  const { data, error } = await supabase.storage.listBuckets();
  
  if (error) {
    console.error('❌ Error listing buckets:', error.message);
    return;
  }
  
  console.log('📦 Buckets Found:', data.map(b => b.name).join(', '));
}

checkBuckets();
