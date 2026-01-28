
import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load service account
const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

initializeApp({
    credential: cert(serviceAccount),
    storageBucket: 'richard-automotive.firebasestorage.app'
});

const bucket = getStorage().bucket();

async function setCors() {
    console.log('🚀 Strategic Fix: Configuring CORS for bucket...', bucket.name);

    const cors = [
        {
            origin: ['*'],
            method: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'],
            responseHeader: ['Content-Type', 'Authorization', 'x-goog-resumable'],
            maxAgeSeconds: 3600
        }
    ];

    try {
        await bucket.setCorsConfiguration(cors);
        console.log('✅ CORS configured successfully. Browser uploads from Mac should now be permitted.');
    } catch (error) {
        console.error('❌ Failed to set CORS:', error);
        process.exit(1);
    }
}

setCors();
