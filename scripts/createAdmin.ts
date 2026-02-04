

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const serviceAccount = require('../functions/serviceAccountKey.json');

// Initialize App
const apps = getApps();
if (!apps.length) {
    initializeApp({
        credential: cert(serviceAccount)
    });
}

const auth = getAuth();
const db = getFirestore();

const ADMIN_EMAIL = 'admin@richard.com';
const ADMIN_PASSWORD = 'password123';

async function createOrResetAdmin() {
    console.log(`Checking for user: ${ADMIN_EMAIL}...`);
    try {
        let user;
        try {
            user = await auth.getUserByEmail(ADMIN_EMAIL);
            console.log(`User exists (UID: ${user.uid}). Updating password...`);
            await auth.updateUser(user.uid, {
                password: ADMIN_PASSWORD,
                emailVerified: true
            });
        } catch (e: any) {
            if (e.code === 'auth/user-not-found') {
                console.log("User not found. Creating new admin user...");
                user = await auth.createUser({
                    email: ADMIN_EMAIL,
                    password: ADMIN_PASSWORD,
                    displayName: 'Admin Richard',
                    emailVerified: true
                });
            } else {
                throw e;
            }
        }

        // Force Admin Claim/Role in Firestore
        console.log("Setting Admin Role in Firestore...");
        await db.collection('users').doc(user.uid).set({
            email: ADMIN_EMAIL,
            role: 'admin',
            displayName: 'Admin Richard',
            createdAt: new Date(),
            dealerId: 'richard-automotive'
        }, { merge: true });

        console.log("\n✅ Admin User Ready!");
        console.log(`Email: ${ADMIN_EMAIL}`);
        console.log(`Password: ${ADMIN_PASSWORD}`);
        console.log("-----------------------------------");
        console.log("Login URL: http://localhost:5173/admin-login");

    } catch (error) {
        console.error("Error creating admin:", error);
    }
}

createOrResetAdmin();

