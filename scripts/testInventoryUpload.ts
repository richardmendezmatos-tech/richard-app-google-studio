import admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Load Service Account
const serviceAccountPath = path.resolve(process.cwd(), 'functions/serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
    console.error('CRITICAL: Service Account Key not found at', serviceAccountPath);
    process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

console.log('Initializing Firebase Admin SDK...');
try {
    if (!admin.credential) {
        console.error('Error: admin.credential is undefined. Import might be incorrect.');
        console.log('Admin object keys:', Object.keys(admin));
    }

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} catch (e: any) {
    if (e.code === 'app/already-exists') {
        admin.app(); // Use existing
    } else {
        console.error('Failed to init Admin SDK:', e);
        process.exit(1);
    }
}

const db = admin.firestore();

async function runTest() {
    console.log('Starting Inventory Upload Test (Admin SDK)...');

    try {
        const testCar = {
            name: 'ADMIN TEST CAR',
            price: 99999,
            dealerId: 'richard-automotive',
            type: 'sedan',
            timestamp: admin.firestore.Timestamp.now(), // Use admin timestamp
            isTest: true,
            notes: 'Created by Antigravity diagnostics'
        };

        console.log('Attempting to add document to "cars" collection...');
        const docRef = await db.collection('cars').add(testCar);
        console.log('✅ Document written with ID: ', docRef.id);

        console.log('Attempting cleanup (delete document)...');
        await db.collection('cars').doc(docRef.id).delete();
        console.log('✅ Cleanup successful. Database is writable via Admin SDK.');

        process.exit(0);

    } catch (error: any) {
        console.error('❌ Test Failed:', error);
        process.exit(1);
    }
}

runTest();
