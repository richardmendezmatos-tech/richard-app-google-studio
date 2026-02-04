
import admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Load Service Account
const serviceAccountPath = path.resolve(process.cwd(), 'functions/serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
    console.error('CRITICAL: Service Account Key not found at', serviceAccountPath);
    console.error('Please download your service account key from Firebase Console -> Project Settings -> Service Accounts');
    console.error('And save it as functions/serviceAccountKey.json');
    process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

console.log('Initializing Firebase Admin SDK...');
try {
    if (!admin.credential) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } else {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
} catch (e: any) {
    if (e.code === 'app/already-exists') {
        admin.app(); // Use existing
    } else {
        console.error('Failed to init Admin SDK:', e);
        process.exit(1);
    }
}

const db = admin.firestore();

const initialInventoryData = [
    {
        name: 'Hyundai Tucson 2026',
        price: 39500,
        type: 'suv',
        badge: 'Rediseñado',
        img: 'https://images.unsplash.com/photo-1695221971766-3d778d910dc7?q=80&w=1200&auto=format&fit=crop',
        featured: true,
        dealerId: 'richard-automotive'
    },
    {
        name: 'Hyundai Elantra 2026',
        price: 28900,
        type: 'sedan',
        badge: 'Deportivo',
        img: 'https://images.unsplash.com/photo-1609520505218-7421da3b3d80?q=80&w=1200&auto=format&fit=crop', // White Sedan
        featured: true,
        dealerId: 'richard-automotive'
    },
    {
        name: 'Hyundai Venue 2026',
        price: 24500,
        type: 'suv',
        badge: 'Compacto',
        img: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=1200&auto=format&fit=crop', // Compact SUV vibe
        featured: false,
        dealerId: 'richard-automotive'
    },
    {
        name: 'Hyundai Santa Fe 2026',
        price: 44200,
        type: 'suv',
        badge: 'Más Espacio',
        img: 'https://images.unsplash.com/photo-1631522858632-1b157bd752e2?q=80&w=1200&auto=format&fit=crop',
        featured: true,
        dealerId: 'richard-automotive'
    },
    {
        name: 'Hyundai Palisade 2026',
        price: 58900,
        type: 'luxury',
        badge: 'Flagship',
        img: 'https://images.unsplash.com/photo-1647494480572-c2834b6e56ad?q=80&w=1200&auto=format&fit=crop',
        featured: true,
        dealerId: 'richard-automotive'
    }
];

async function populate() {
    console.log('Starting Inventory Population...');
    const batch = db.batch();
    const carsCollection = db.collection('cars');

    for (const car of initialInventoryData) {
        const docRef = carsCollection.doc();
        batch.set(docRef, {
            ...car,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Prepared: ${car.name}`);
    }

    await batch.commit();
    console.log('✅ Inventory populated successfully!');
    process.exit(0);
}

populate().catch(console.error);
