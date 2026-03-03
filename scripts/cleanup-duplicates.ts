import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();

const resolveServiceAccountPath = () => {
    const candidates = [
        path.join(ROOT, 'functions', 'serviceAccountKey.json'),
        path.join(ROOT, 'serviceAccountKey.json')
    ];
    return candidates.find((candidate) => fs.existsSync(candidate));
};

const runCleanup = async () => {
    const serviceAccountPath = resolveServiceAccountPath();
    if (!serviceAccountPath) {
        console.error('Service account not found.');
        return;
    }

    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }

    const db = admin.firestore();
    const snapshot = await db.collection('cars').get();

    console.log(`Found ${snapshot.size} total cars. Cleaning up duplicates...`);

    const batch = db.batch();
    let deleteCount = 0;

    snapshot.docs.forEach(doc => {
        const id = doc.id;
        // Auto-generated Firestore IDs are exactly 20 characters and alphanumeric
        // Our news IDs are slugs like 'hyundai-kona-2026'
        const isLegacyId = /^[a-zA-Z0-9]{20}$/.test(id);

        if (isLegacyId) {
            batch.delete(doc.ref);
            deleteCount++;
            console.log(`Scheduling deletion for legacy ID: ${id}`);
        }
    });

    if (deleteCount > 0) {
        await batch.commit();
        console.log(`Successfully deleted ${deleteCount} legacy/duplicate records.`);
    } else {
        console.log('No legacy records found.');
    }
};

runCleanup().catch(console.error);
