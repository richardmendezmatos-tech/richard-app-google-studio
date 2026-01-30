
import { initializeApp } from "firebase/app";
import { getFirestore, doc, deleteDoc } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";
import "dotenv/config";

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function deleteGhost() {
    try {
        console.log("🔐 Authenticating anonymously...");
        await signInAnonymously(auth);
        console.log("✅ Signed in.");

        console.log("🧹 Attempting to delete ghost document cars/UhxMCV9XKFu1zkbufCGD...");
        await deleteDoc(doc(db, "cars", "UhxMCV9XKFu1zkbufCGD"));
        console.log("✅ Successfully deleted ghost document.");
    } catch (e) {
        const error = e as Error;
        console.error("❌ Error deleting document (likely permission denied):", error.message);
    }
}

deleteGhost();
