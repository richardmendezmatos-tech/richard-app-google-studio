import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { initialInventoryData } from '../src/entities/inventory/model/initialInventory.ts';

const ROOT = process.cwd();
const CARS_COLLECTION = 'cars';

const resolveServiceAccountPath = () => {
    const candidates = [
        path.join(ROOT, 'functions', 'serviceAccountKey.json'),
        path.join(ROOT, 'serviceAccountKey.json')
    ];
    return candidates.find((candidate) => fs.existsSync(candidate));
};

const runReseed = async () => {
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
    const batch = db.batch();
    const currentDealerId = 'richard-automotive';

    console.log(`Reseeding ${initialInventoryData.length} vehicles...`);

    initialInventoryData.forEach((car: any) => {
        const idSlug = car.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        const carRef = db.collection(CARS_COLLECTION).doc(idSlug);
        batch.set(carRef, {
            ...car,
            dealerId: currentDealerId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log(`Queued: ${idSlug}`);
    });

    await batch.commit();
    console.log('Reseed complete.');
};

runReseed().catch(console.error);
