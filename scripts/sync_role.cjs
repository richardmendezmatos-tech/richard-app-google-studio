
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
const email = 'richardmendezmatos@gmail.com';

async function fixRole() {
    try {
        console.log(`--- Asegurando Rol para ${email} ---`);

        const userRecord = await admin.auth().getUserByEmail(email);
        const uid = userRecord.uid;
        console.log(`✅ Usuario encontrado. UID: ${uid}`);

        // Update role in Firestore
        await db.collection('users').doc(uid).set({
            email: email,
            role: 'admin',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log(`✅ Rol de 'admin' asegurado en Firestore.`);

        console.log(`\n--- SINCRONIZACIÓN COMPLETADA ---`);

    } catch (error) {
        console.error("❌ Error Crítico:", error.message);
    }
    process.exit();
}

fixRole();
