import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createLead } from '../src/dataconnect-generated/esm/index.esm.js';
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
    // 2. Obtener leads de Firestore
    console.log('📡 Leyendo colección "applications" de Firestore...');
    const snapshot = await getDocs(collection(db, 'applications'));
    const firestoreLeads = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];

    console.log(`✅ Se encontraron ${firestoreLeads.length} leads en Firestore.`);

    let successCount = 0;
    let errorCount = 0;

    // 3. Migrar cada lead
    for (const lead of firestoreLeads) {
      console.log(`\n📦 Migrando Lead: ${lead.firstName || lead.name || 'Desconocido'} (${lead.id})`);

      try {
        // Mapeo y Normalización
        let firstName = lead.firstName;
        let lastName = lead.lastName;

        if (!firstName && lead.name) {
          const parts = lead.name.split(' ');
          firstName = parts[0];
          lastName = parts.slice(1).join(' ') || 'Unknown';
        }

        const leadVars = {
          firstName: firstName || 'N/A',
          lastName: lastName || 'N/A',
          phone: lead.phone || 'N/A',
          email: lead.email || 'N/A',
          vehicleOfInterest: lead.vehicleOfInterest || null,
          type: lead.type || 'general',
          closureProbability: typeof lead.closureProbability === 'number' ? lead.closureProbability : 0,
          totalVisits: lead.behavioralMetrics?.inventoryViews || 1,
          behavioralData: lead.behavioralFingerprint ? JSON.stringify(lead.behavioralFingerprint) : null,
          aiAnalysis: lead.aiAnalysis ? JSON.stringify(lead.aiAnalysis) : null,
          marketingData: lead.marketingData ? JSON.stringify(lead.marketingData) : null,
        };

        // TODO: vehicleId mapping might require finding the UUID of the car in the new DB.
        // For now, we omit vehicleId if it doesn't match UUID format to prevent insertion error.
        
        await createLead(dataConnect, leadVars);
        console.log(`   ✅ Sincronizado con SQL con éxito.`);
        successCount++;
      } catch (err: any) {
        console.error(`   ❌ Error al migrar ${lead.id}:`, err.message);
        errorCount++;
      }
    }

    console.log('\n--- Resumen de Migración ---');
    console.log(`✅ Exitosos: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log(`📊 Total procesado: ${firestoreLeads.length}`);

  } catch (error: any) {
    console.error('❌ Error fatal en la migración:', error.message);
  }

  process.exit(0);
}

migrate();
