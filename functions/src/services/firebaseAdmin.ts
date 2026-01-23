import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
    console.log("Initializing Firebase Admin in firebaseAdmin.ts");
    initializeApp();
}

export const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });
