import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function run() {
  const url = `${supabaseUrl}/rest/v1/`;
  const response = await fetch(url, {
    method: 'GET', // or OPTIONS
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`
    }
  });

  const schema = await response.json();
  console.log('Tables in schema:', Object.keys(schema.definitions || {}));
  if (schema.definitions && schema.definitions.inventory_vectors) {
    console.log('Columns in inventory_vectors:', Object.keys(schema.definitions.inventory_vectors.properties || {}));
  }
}

run();
