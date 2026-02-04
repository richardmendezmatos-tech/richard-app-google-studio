
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const serviceAccount = require('../functions/serviceAccountKey.json');

const apps = getApps();
if (!apps.length) {
    initializeApp({
        credential: cert(serviceAccount)
    });
}

const db = getFirestore();
const auth = getAuth();

const EMAIL = 'admin@richard.com';

async function diagnose() {
    console.log(`Diagnosing user: ${EMAIL}`);

    // 1. Check Auth User
    try {
        const user = await auth.getUserByEmail(EMAIL);
        console.log(`[PASS] Auth User found: ${user.uid}`);
        console.log(`       Email Verified: ${user.emailVerified}`);
        console.log(`       Disabled: ${user.disabled}`);
    } catch (e: any) {
        console.error(`[FAIL] Auth User lookup failed: ${e.message}`);
        return;
    }

    // 2. Check Firestore User Profile
    const user = await auth.getUserByEmail(EMAIL);
    const userDoc = await db.collection('users').doc(user.uid).get();

    if (userDoc.exists) {
        const data = userDoc.data();
        console.log(`[PASS] Firestore Profile found.`);
        console.log(`       Role: ${data?.role}`);
        console.log(`       DealerId: ${data?.dealerId}`);
        if (data?.role !== 'admin') {
            console.error(`[WARN] Role is NOT admin! It is: ${data?.role}`);
        }
    } else {
        console.error(`[FAIL] Firestore Profile MISSING for uid: ${user.uid}`);
    }

    // 3. Check Rate Limits (if explicit block exists)
    // The code sanitizes email: (email || 'anon').replace(/[@.]/g, '_');
    const sanitizedEmail = EMAIL.replace(/[@.]/g, '_');
    // We can't easily guess IP here, but we can list docs starting with email
    console.log(`[INFO] Checking rate limits for ${sanitizedEmail}...`);
    // This is hard to query without exact ID (email_ip), skipping for now.
}

diagnose();
