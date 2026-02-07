
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
const newPass = 'Richard2026!';

async function fixAccess() {
    try {
        console.log(`--- Iniciando reparación para ${email} ---`);

        let userRecord;
        try {
            userRecord = await admin.auth().getUserByEmail(email);
            console.log(`✅ Usuario encontrado en Auth. UID: ${userRecord.uid}`);
        } catch (e) {
            console.log(`⚠️ Usuario no encontrado en Auth. Creándolo...`);
            userRecord = await admin.auth().createUser({
                email: email,
                password: newPass,
                emailVerified: true
            });
            console.log(`✅ Usuario creado en Auth. UID: ${userRecord.uid}`);
        }

        const uid = userRecord.uid;

        // Force update password just in case
        await admin.auth().updateUser(uid, {
            password: newPass
        });
        console.log(`✅ Contraseña actualizada a: ${newPass}`);

        // Ensure Firestore record exists and has admin role
        await db.collection('users').doc(uid).set({
            email: email,
            role: 'admin',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log(`✅ Rol de 'admin' asegurado en Firestore.`);

        console.log(`\n--- REPARACIÓN COMPLETADA ---`);
        console.log(`Prueba entrar con:`);
        console.log(`Email: ${email}`);
        console.log(`Pass: ${newPass}`);

    } catch (error) {
        console.error("❌ Error Crítico:", error.message);
    }
    process.exit();
}

fixAccess();
