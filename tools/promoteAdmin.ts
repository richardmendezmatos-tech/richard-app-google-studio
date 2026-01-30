
import { doc, setDoc } from "firebase/firestore";
import { db } from "../services/firebaseService";

/**
 * Script para promover un usuario a ADMIN en Firestore.
 * 
 * INSTRUCCIONES:
 * 1. Copia el 'User ID' (UID) desde Firebase Console > Authentication.
 * 2. Pega el UID en la llamada final de este script.
 */

export const promoteToAdmin = async (uid: string) => {
    try {
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, {
            role: 'admin',
            updatedAt: new Date()
        }, { merge: true });

        console.log("✅ ÉXITO: El usuario con UID " + uid + " ahora es ADMINISTRADOR.");
    } catch (error) {
        console.error("❌ ERROR al promover usuario:", error);
    }
};
