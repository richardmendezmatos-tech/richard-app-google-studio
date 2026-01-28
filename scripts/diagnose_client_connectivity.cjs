
const { initializeApp } = require("firebase/app");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");
const { getFirestore, collection, addDoc, serverTimestamp } = require("firebase/firestore");

// Configuration from client code
const firebaseConfig = {
    apiKey: "AIzaSyDlj3o08kSJrEhKJjU2Xb1LMNeXD2hxWhY",
    authDomain: "richard-automotive.firebaseapp.com",
    projectId: "richard-automotive",
    storageBucket: "richard-automotive.firebasestorage.app",
    messagingSenderId: "197990063384",
    appId: "1:197990063384:web:2e797f109bda021e2e926d",
    measurementId: "G-BB5QFNTHHG"
};

// NOTE: Fill in the API Key manually if environment variable is missing in this context
// For this test I will assume the user has the credentials we set earlier.
const email = 'richardmendezmatos@gmail.com';
const password = 'Richard2026!';

async function testClientWrite() {
    console.log("--- Starting Client SDK Diagnostic ---");

    try {
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        console.log(`1. Attempting login as ${email}...`);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log(`✅ Login Successful. UID: ${user.uid}`);

        console.log("2. Attempting Firestore Write to 'cars' collection...");
        const carsRef = collection(db, 'cars');
        const docRef = await addDoc(carsRef, {
            name: "DIAGNOSTIC TEST CAR",
            price: 12345,
            type: "sedan",
            img: "https://example.com/test.jpg",
            dealerId: "richard-automotive",
            createdAt: serverTimestamp(),
            isDiagnostic: true
        });

        console.log(`✅ Write Successful! Document ID: ${docRef.id}`);
        console.log("-----------------------------------------");
        console.log("CONCLUSION: Client SDK works from this machine.");
        console.log("If the browser fails, the issue is Browser Cache, Extensions, or CORS.");

    } catch (error) {
        console.error("❌ DIAGNOSTIC FAILED");
        console.error("Error Code:", error.code);
        console.error("Error Message:", error.message);

        if (error.code === 'auth/invalid-api-key') {
            console.error("⚠️  API KEY IS MISSING OR INVALID IN CONFIG");
        }
    }
    process.exit();
}

testClientWrite();
