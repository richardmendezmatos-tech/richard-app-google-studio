/**
 * Debug file for Firestore connectivity in Node.js
 * 
 * Verifies if we can fetch inventory directly from Firestore.
 * Run with: npx tsx --env-file=.env tests/firestore-debug.test.ts
 */

import { getInventoryOnce } from '../services/firebaseService';

async function debugFirestore() {
    console.log('🔍 Debugging Firestore connectivity...\n');

    try {
        console.log('Fetching inventory for default dealer: richard-automotive');
        const cars = await getInventoryOnce();

        console.log(`✅ Success! Found ${cars.length} cars.`);
        if (cars.length > 0) {
            console.log('Sample car:', cars[0].name, '-', cars[0].price);
        } else {
            console.log('⚠️ No cars found for this dealer ID. Check firestore collection "cars" and dealerId field.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Firestore fetch failed:', error);
        process.exit(1);
    }
}

debugFirestore();
