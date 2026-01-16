
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from 'fs';
import { join } from 'path';

// Load service account key
const serviceAccount = JSON.parse(
    readFileSync(join(process.cwd(), 'functions/serviceAccountKey.json'), 'utf-8')
);

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

async function simulateLead() {
    const newLead = {
        firstName: "Carlos",
        lastName: "Rivera",
        email: "test.carlos@example.com",
        phone: "787-555-0199",
        ssn: "XXX-XX-9999",
        monthlyIncome: "5200",
        employer: "Tech Solutions PR",
        jobTitle: "Software Engineer",
        timeAtJob: "3 years",
        city: "San Juan",
        timestamp: new Date()
    };

    console.log("🚀 Simulating new lead application...");
    const docRef = await db.collection("applications").add(newLead);
    console.log(`✅ Lead added with ID: ${docRef.id}`);
    console.log("Check your Cloud Functions logs to see the AI analysis!");
}

simulateLead().catch(console.error);
