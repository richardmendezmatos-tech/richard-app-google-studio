
const admin = require('firebase-admin');
const serviceAccount = require('../functions/serviceAccountKey.json');

try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    const db = admin.firestore();

    async function testWrite() {
        console.log("Attempting to write to 'cars' collection...");
        try {
            const res = await db.collection('cars').add({
                name: 'TEST_CAR_BACKEND_VERIFICATION',
                price: 99999,
                type: 'suv',
                dealerId: 'richard-automotive',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                features: ['Test Feature']
            });
            console.log('✅ WRITE SUCCESS: Document ID:', res.id);

            // Clean up
            console.log("Cleaning up test document...");
            await db.collection('cars').doc(res.id).delete();
            console.log('✅ CLEANUP SUCCESS');

        } catch (error) {
            console.error('❌ WRITE FAILED:', error);
        }
    }

    testWrite();
} catch (e) {
    console.error("Initialization Failed:", e.message);
}
