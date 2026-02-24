import CryptoJS from 'crypto-js';

/**
 * Servicio de Encriptación de SSN (Client-Side)
 * 
 * Este servicio implementa una arquitectura Zero-Knowledge.
 * El SSN se encripta en el navegador del cliente antes de ser enviado a Firestore.
 */

// NOTA DE SEGURIDAD: La llave maestra DEBE ser solicitada al admin 
// en su panel y NUNCA guardarse en código duro o localStorage persistente.
export const encryptSSN = (ssn: string, masterKey: string): string => {
    if (!ssn || !masterKey) {
        throw new Error("SSN y MasterKey son obligatorios para la encriptación.");
    }

    // Limpiar SSN de guiones o espacios para normalizar antes de encriptar
    const cleanSSN = ssn.replace(/[^0-9]/g, '');

    if (cleanSSN.length !== 9) {
        console.warn("SSN inválido detectado. Asegúrate de que tenga 9 dígitos.");
    }

    // Encriptación AES-256
    const encrypted = CryptoJS.AES.encrypt(cleanSSN, masterKey).toString();

    return encrypted;
};

/**
 * Desencriptación (Solo en panel de Admin)
 */
export const decryptSSN = (encryptedSSN: string, masterKey: string): string => {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedSSN, masterKey);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);

        if (!originalText) throw new Error("Llave incorrecta o dato corrupto.");

        return originalText;
    } catch (error) {
        console.error("Fallo al desencriptar SSN:", error);
        return "DECRYPTION_ERROR";
    }
};
