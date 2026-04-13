const admin = require('firebase-admin');

/**
 * Safe Firebase Admin Initialization (Sentinel N23)
 * Priority:
 * 1. FIREBASE_SERVICE_ACCOUNT_JSON (Environment Variable)
 * 2. serviceAccountKey.json (Local File - ignored by git)
 */
function initializeAdmin() {
    if (admin.apps.length > 0) return admin.app();

    let serviceAccount;
    const envJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    if (envJson) {
        try {
            serviceAccount = JSON.parse(envJson);
            console.log('✅ Initializing Firebase Admin via environment variable.');
        } catch (e) {
            console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', e.message);
        }
    }

    if (!serviceAccount) {
        try {
            serviceAccount = require('../../serviceAccountKey.json');
            console.log('ℹ️ Initializing Firebase Admin via local serviceAccountKey.json.');
        } catch (e) {
            console.warn('⚠️ No service account found in environment or local file.');
        }
    }

    if (serviceAccount) {
        return admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }

    return null;
}

module.exports = { initializeAdmin, admin };
