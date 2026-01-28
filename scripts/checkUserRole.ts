
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

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
const uid = 'UkHfcQ6PEtQbDWAmehFzOqEQqQu1'; // From user logs

async function checkUser() {
    console.log(`Checking user ${uid}...`);

    // Check Auth
    try {
        const userRecord = await admin.auth().getUser(uid);
        console.log('Auth Record Found:', { email: userRecord.email, disabled: userRecord.disabled });
    } catch (e) {
        console.error('Auth Check Failed:', e);
    }

    // Check Firestore Profile
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
        console.error('❌ User document DOES NOT EXIST in Firestore /users collection.');
        console.log('Attempting to create it...');
        await db.collection('users').doc(uid).set({
            email: 'richardmendezmatos@gmail.com', // inferred
            role: 'admin',
            dealerId: 'richard-automotive',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Created missing user profile with admin role.');
    } else {
        console.log('Firestore Profile:', userDoc.data());
        if (userDoc.data()?.role !== 'admin') {
            console.error('❌ User ROLE is NOT admin:', userDoc.data()?.role);
            console.log('Fixing role...');
            await userDoc.ref.update({ role: 'admin' });
            console.log('✅ Role updated to admin.');
        } else {
            console.log('✅ User has ADMIN role.');
        }
    }
    process.exit(0);
}

checkUser();
