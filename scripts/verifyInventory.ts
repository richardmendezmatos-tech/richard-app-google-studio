
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
        admin.app();
    } else {
        console.error('Failed to init Admin SDK:', e);
        process.exit(1);
    }
}

const db = admin.firestore();

async function verify() {
    console.log('--- Verifying Inventory Data ---');

    // 1. Count Total Docs
    const snapshot = await db.collection('cars').get();
    console.log(`Total 'cars' documents: ${snapshot.size}`);

    if (snapshot.empty) {
        console.log('❌ Collection is completely empty.');
    } else {
        // 2. Check Dealer IDs
        console.log('Listing first 5 cars:');
        snapshot.docs.slice(0, 5).forEach(doc => {
            const data = doc.data();
            console.log(`- ID: ${doc.id}`);
            console.log(`  Name: ${data.name}`);
            console.log(`  DealerID: '${data.dealerId}'`); // Quote to see spaces
            console.log(`  Price: ${data.price}`);
        });

        // 3. Check for specific common dealerId
        const richardCars = snapshot.docs.filter(d => d.data().dealerId === 'richard-automotive');
        console.log(`\nCars with dealerId 'richard-automotive': ${richardCars.length}`);
    }

    process.exit(0);
}

verify().catch(console.error);
