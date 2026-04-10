import { createClient } from '@supabase/supabase-js';
import { initializeApp } from 'firebase/app';
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createCar } from '../src/dataconnect-generated/esm/index.esm.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

initializeApp(firebaseConfig);

async function testIngest() {
  console.log('🚀 Starting Database Sync Test (Richard Automotive)...');

  const vehicle = {
    id: 'test-' + Date.now(),
    name: '2025 Ford F-150 Raptor (Test)',
    year: '2025',
    make: 'Ford',
    model: 'F-150 Raptor',
    price: '95000',
    mileage: '10',
    type: 'Pickup',
    category: 'High-Performance',
    condition: 'New',
    description: 'Unidad de prueba para validación de arquitectura Dual-Write.'
  };

  // 1. Supabase Verification
  console.log('\n--- [Supabase Check] ---');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  Supabase URL or Key is missing. Skipping Supabase check.');
  } else {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.warn('⚠️  SERVICE_ROLE_KEY missing. Falling back to ANON_KEY (Read-Only test).');
        const { data, error } = await supabase.from('vehicle_embeddings').select('car_id').limit(1);
        if (error) console.error('❌ Supabase Read Error:', error.message);
        else console.log('✅ Supabase read successful (using ANON_KEY)');
      } else {
        const { error } = await supabase.from('vehicle_embeddings').upsert({
          car_id: vehicle.id,
          car_name: vehicle.name,
          price: vehicle.price,
          status: 'test'
        }, { onConflict: 'car_id' });

        if (error) console.error('❌ Supabase Upsert Error:', error.message);
        else console.log('✅ Supabase upsert successful (using SERVICE_ROLE_KEY)');
      }
    } catch (e: any) {
      console.error('❌ Supabase unexpected error:', e.message);
    }
  }

  // 2. Data Connect Verification
  console.log('\n--- [Data Connect Check] ---');
  try {
    const dataConnect = getDataConnect(connectorConfig);
    await createCar(dataConnect, {
      year: parseInt(vehicle.year),
      make: vehicle.make,
      model: vehicle.model,
      name: vehicle.name,
      price: parseFloat(vehicle.price),
      mileage: parseInt(vehicle.mileage),
      type: vehicle.type,
      category: vehicle.category,
      condition: vehicle.condition
    });
    console.log('✅ Firebase Data Connect sync successful');
  } catch (e: any) {
    console.error('❌ Data Connect Error:', e.message);
    console.log('Tip: Make sure the local Data Connect emulator is running or connected to your Cloud SQL instance.');
  }

  console.log('\n🏁 Test complete.');
}

testIngest().catch(console.error);
