
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
};

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const geminiKey = process.env.VITE_GEMINI_API_KEY!;

const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp);
const supabase = createClient(supabaseUrl, supabaseKey);
const genAI = new GoogleGenerativeAI(geminiKey);

async function syncRAG() {
    console.log("🚀 Starting RAG Sync...");

    // 1. Fetch from Firestore
    const carsSnapshot = await getDocs(collection(db, "cars"));
    const cars = carsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`📦 Found ${cars.length} cars in Firestore.`);

    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

    for (const car of cars as any) {
        if (!car.id || !car.name) {
            console.warn(`⚠️ Skipping invalid car document (ID: ${car.id}, Name: ${car.name})`);
            continue;
        }
        console.log(`🔍 Processing: ${car.name}`);

        // Create a rich text representation for embedding
        const content = `
      Vehículo: ${car.name}
      Tipo: ${car.type}
      Precio: $${car.price}
      Año: ${car.year || 'N/A'}
      Descripción: ${car.description || 'Sin descripción'}
      Características: ${(car.features || []).join(", ")}
      Tags: ${car.badge || ''}
    `.trim();

        try {
            // 2. Generate Embedding
            const result = await model.embedContent(content);
            const embedding = result.embedding.values;

            // 3. Save to Supabase
            const { error } = await supabase.from("inventory_vectors").upsert({
                car_id: car.id,
                car_name: car.name,
                content: content,
                embedding: embedding,
                metadata: {
                    price: car.price,
                    type: car.type,
                    img: car.img
                }
            }, { onConflict: 'car_id' });

            if (error) console.error(`❌ Error saving ${car.name}:`, error.message);
            else console.log(`✅ ${car.name} synced to Vector Store.`);

        } catch (e) {
            console.error(`❌ Failed to embed ${car.name}:`, e);
        }
    }

    console.log("🏁 RAG Sync Complete!");
}

syncRAG();
