
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const serviceAccount = require('../serviceAccountKey.json');

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();
const auth = getAuth();

const email = 'admin@richard.com';

async function setAdminRole() {
    try {
        console.log(`Looking for user with email: ${email}...`);
        const userRecord = await auth.getUserByEmail(email);
        console.log(`Found user: ${userRecord.uid}`);

        // Update Firestore
        const userRef = db.collection('users').doc(userRecord.uid);
        await userRef.set({
            email: email,
            role: 'admin',
            updatedAt: new Date()
        }, { merge: true });

        console.log(`Successfully updated role to 'admin' for user: ${email}`);
        process.exit(0);
    } catch (error) {
        console.error('Error setting admin role:', error);
        process.exit(1);
    }
}

setAdminRole();
