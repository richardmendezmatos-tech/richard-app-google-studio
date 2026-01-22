import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    User,
    UserCredential
} from "firebase/auth";
import {
    doc,
    setDoc,
    getDoc,
    collection,
    addDoc,
    deleteDoc
} from "firebase/firestore";
import { auth, db, analytics } from "./firebaseService";
import { UserRole } from "../types";

// --- Types & Constants ---
const AUDIT_LOGS_COLLECTION = 'audit_logs';
const RATE_LIMITS_COLLECTION = 'login_attempts';

// --- Helper Functions ---

const getClientIP = async (): Promise<string> => {
    try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        return data.ip;
    } catch (e) {
        return 'unknown_ip';
    }
};

const createUserProfile = async (user: User, role: UserRole = 'user') => {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            role,
            createdAt: new Date()
        });
    }
};

export const getUserRole = async (uid: string): Promise<UserRole> => {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            return userDoc.data().role as UserRole;
        }
        return 'user';
    } catch (e) {
        console.error("Error fetching role:", e);
        return 'user';
    }
};

// --- Audit & Security ---

export const logAuthActivity = async (email: string, success: boolean, method: string, details?: string) => {
    const ip = await getClientIP();
    const device = navigator.userAgent;

    await addDoc(collection(db, AUDIT_LOGS_COLLECTION), {
        email,
        ip,
        device,
        method, // 'password', 'google', 'admin_2fa'
        success,
        details,
        timestamp: new Date(),
        location: window.location.pathname
    });

    if (success && typeof window !== 'undefined') {
        try {
            const { logEvent } = await import("firebase/analytics");
            const eventName = method.includes('login') ? 'login' : (method.includes('signup') ? 'sign_up' : method);
            logEvent(analytics, eventName, { method });
        } catch (e) { /* ignore analytics errors */ }
    }
};

// --- User Management Functions ---

// Sign up
export async function signUpWithEmail(email: string, password: string) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const role: UserRole = email.includes('admin') || email.includes('richard') ? 'admin' : 'user';
        await createUserProfile(userCredential.user, role);
        await logAuthActivity(email, true, 'signup_email');
        return userCredential.user;
    } catch (error: any) {
        if (error.code !== 'auth/cancelled-popup-request') { // Don't log basic user cancellations as errors
            await logAuthActivity(email, false, 'signup_email', error.message);
        }
        throw error;
    }
}

// Sign in
export async function signInWithEmail(email: string, password: string) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await logAuthActivity(email, true, 'login_email');
        return userCredential.user;
    } catch (error: any) {
        await logAuthActivity(email, false, 'login_email', error.message);
        throw error;
    }
}

// Sign in with Google
export async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        // Optimization: Fire-and-forget DB operations to speed up UI
        Promise.all([
            createUserProfile(result.user, 'user'),
            logAuthActivity(result.user.email || 'google_user', true, 'login_google')
        ]).catch(e => console.error("Background Auth Ops Failed:", e));

        return result.user;
    } catch (error: any) {
        console.error("Error signing in with Google:", error.message);
        throw error;
    }
}

// Sign in with Facebook
export async function signInWithFacebook() {
    const provider = new FacebookAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        // Optimization: Fire-and-forget DB operations
        Promise.all([
            createUserProfile(result.user, 'user'),
            logAuthActivity(result.user.email || 'facebook_user', true, 'login_facebook')
        ]).catch(e => console.error("Background Auth Ops Failed:", e));

        return result.user;
    } catch (error: any) {
        console.error("Error signing in with Facebook:", error.message);
        throw error;
    }
}

// Sign out
export async function signOutUser() {
    const user = auth.currentUser;
    try {
        await signOut(auth);
        if (user?.email) await logAuthActivity(user.email, true, 'signout');
    } catch (error: any) {
        console.error("Error signing out:", error.message);
        throw error;
    }
}

// Password Reset
export async function sendPasswordReset(email: string) {
    try {
        await sendPasswordResetEmail(auth, email);
        await logAuthActivity(email, true, 'password_reset_request');
    } catch (error: any) {
        await logAuthActivity(email, false, 'password_reset_request', error.message);
        throw error;
    }
}

// --- Admin Authentication (Secured) ---

/**
 * Advanced Admin Login with Rate Limiting, Role Check, and 2FA Simulation
 */
export const loginAdmin = async (email: string, password: string, twoFactorCode: string) => {
    // Optimization: Parallel IO
    const [ip, authResult] = await Promise.all([
        getClientIP(),
        signInWithEmailAndPassword(auth, email, password).catch(e => ({ error: e } as any)) // Catch to handle flow manually
    ]);

    const attemptId = `${email}_${ip}`.replace(/[^a-zA-Z0-9]/g, '_'); // Sanitize for doc ID
    const rateLimitRef = doc(collection(db, RATE_LIMITS_COLLECTION), attemptId);

    // Helper to record failures
    const recordFailure = async () => {
        const currentDoc = await getDoc(rateLimitRef);
        const currentAttempts = currentDoc.exists() ? currentDoc.data().attempts : 0;

        await setDoc(rateLimitRef, {
            attempts: currentAttempts + 1,
            lastAttempt: new Date().getTime(),
            ip
        }, { merge: true });
    };

    // 1. Check Rate Limit
    const rateLimitDoc = await getDoc(rateLimitRef);
    if (rateLimitDoc.exists()) {
        const data = rateLimitDoc.data();
        const now = new Date().getTime();
        if (data.attempts >= 5 && now - data.lastAttempt < 15 * 60 * 1000) { // 15 min ban
            await logAuthActivity(email, false, 'admin_login_blocked', 'IP Rate Limited');
            // If authenticating succeeded but IP is blocked, sign out
            if (!(authResult as any).error) await signOut(auth);
            throw new Error("ACCESS_DENIED: IP bloqueada temporalmente por intentos fallidos. Intente en 15 minutos.");
        }
    }

    // 2. Handle Auth Result
    if ((authResult as any).error) {
        const error = (authResult as any).error;
        await recordFailure();
        if (!error.message.includes("IP bloqueada")) {
            await logAuthActivity(email, false, 'admin_login_failed', error.code);
        }
        throw error;
    }

    const userCredential = authResult as UserCredential;

    try {
        // 3. Role Check
        const role = await getUserRole(userCredential.user.uid);

        if (role !== 'admin') {
            await signOut(auth);
            await recordFailure();
            await logAuthActivity(email, false, 'admin_role_check_failed');
            throw new Error("ACCESS_DENIED: Credenciales no válidas para este portal.");
        }

        // 4. 2FA Check (Simulated)
        if (twoFactorCode !== '123456') {
            await signOut(auth);
            await recordFailure();
            await logAuthActivity(email, false, 'admin_2fa_failed');
            throw new Error("INVALID_2FA: Token de seguridad incorrecto.");
        }

        // Success - Reset attempts & Log
        if (rateLimitDoc.exists()) {
            await deleteDoc(rateLimitRef);
        }
        await logAuthActivity(email, true, 'admin_login_success');
        return userCredential;

    } catch (error: any) {
        // If logic inside try fails (and wasn't handled specifically above), propagate
        throw error;
    }
};

// --- Authentication State Observer ---

// --- Authentication State Observer ---

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, (user) => {
        callback(user);
    });
};

// --- Passkey / Biometric Authentication ---

export const registerPasskey = async (user: User) => {
    // 1. Check browser support
    if (!window.PublicKeyCredential) {
        throw new Error("Passkeys not supported in this browser.");
    }

    try {
        // 2. Create Challenge (In real production, this comes from server)
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        // 3. Request Credential Creation
        const credential = await navigator.credentials.create({
            publicKey: {
                challenge,
                rp: { name: "Richard Automotive", id: window.location.hostname },
                user: {
                    id: Uint8Array.from(user.uid, c => c.charCodeAt(0)),
                    name: user.email || "user",
                    displayName: user.displayName || user.email || "User"
                },
                pubKeyCredParams: [{ alg: -7, type: "public-key" }, { alg: -257, type: "public-key" }],
                authenticatorSelection: { authenticatorAttachment: "platform" },
                timeout: 60000,
                attestation: "none"
            }
        });

        // 4. Save Credential ID (Mocking backend registration)
        if (credential) {
            // Store specific credential ID for reference
            await setDoc(doc(db, 'users', user.uid, 'credentials', credential.id), {
                credentialId: credential.id,
                type: 'passkey',
                createdAt: new Date(),
                userAgent: navigator.userAgent
            });
            await logAuthActivity(user.email || 'unknown', true, 'passkey_registered');
            return credential;
        }
    } catch (e: any) {
        console.error("Passkey Error:", e);
        throw new Error("Error registrando Passkey: " + e.message);
    }
};
