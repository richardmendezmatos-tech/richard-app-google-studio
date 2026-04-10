import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createCar } from '../src/dataconnect-generated/esm/index.esm.js';
import dotenv from 'dotenv';

// 1. Configuración de entorno
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

async function migrate() {
  console.log('🚀 Iniciando Migración: Firestore -> Data Connect (Postgres)...');

  // Inicializar Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const dataConnect = getDataConnect(connectorConfig);

  try {
    // 2. Obtener vehículos de Firestore
    console.log('📡 Leyendo colección "cars" de Firestore...');
    const snapshot = await getDocs(collection(db, 'cars'));
    const firestoreCars = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];

    console.log(`✅ Se encontraron ${firestoreCars.length} vehículos en Firestore.`);

    let successCount = 0;
    let errorCount = 0;

    // 3. Migrar cada vehículo
    for (const car of firestoreCars) {
      console.log(`\n📦 Migrando: ${car.name || 'Sin Nombre'} (${car.id})`);

      try {
        // Mapeo y Normalización
        const carVars = {
          // Si queremos conservar el ID original, lo pasamos (si el SDK lo permite)
          // Si no, dejamos que Data Connect genere uno nuevo
          year: parseInt(car.year) || new Date().getFullYear(),
          make: car.make || 'Universal',
          model: car.model || 'Generic',
          name: car.name || `${car.make} ${car.model}`,
          price: parseFloat(car.price) || 0,
          mileage: parseInt(car.mileage) || 0,
          type: car.type || 'standard',
          category: car.category || 'standard',
          condition: car.condition || 'used',
          img: car.img || car.image || 'https://placehold.co/600x400/000000/FFFFFF?text=Vehicle+Image',
          dealerId: car.dealerId || 'richard-automotive',
          featured: !!car.featured,
          views: parseInt(car.views) || 0,
          leadsCount: parseInt(car.leadsCount) || parseInt(car.leads_count) || 0,
        };

        await createCar(dataConnect, carVars);
        console.log(`   ✅ Sincronizado con SQL con éxito.`);
        successCount++;
      } catch (err: any) {
        console.error(`   ❌ Error al migrar ${car.id}:`, err.message);
        errorCount++;
      }
    }

    console.log('\n--- Resumen de Migración ---');
    console.log(`✅ Exitosos: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log(`📊 Total procesado: ${firestoreCars.length}`);

  } catch (error: any) {
    console.error('❌ Error fatal en la migración:', error.message);
  }

  process.exit(0);
}

migrate();
