/**
 * Servicio de Encriptación de SSN (Client-Side) - Versión Hardened (AES-GCM)
 *
 * Este servicio implementa Encriptación Simétrica Autenticada (AES-GCM)
 * utilizando la Web Crypto API nativa para garantizar integridad y privacidad.
 */

// Helper to derive a stable CryptoKey from the MasterKey string
async function deriveKey(masterKey: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(masterKey);
  // Use SHA-256 to ensure a 256-bit key regardless of masterKey length
  const hash = await window.crypto.subtle.digest('SHA-256', keyData);

  return await window.crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, [
    'encrypt',
    'decrypt',
  ]);
}

/**
 * Encriptación Autenticada AES-GCM (256-bit)
 */
export const encryptSSN = async (ssn: string, masterKey: string): Promise<string> => {
  if (!ssn || !masterKey) {
    throw new Error('SSN y MasterKey son obligatorios.');
  }

  const cleanSSN = ssn.replace(/[^0-9]/g, '');
  const encoder = new TextEncoder();
  const data = encoder.encode(cleanSSN);

  const key = await deriveKey(masterKey);
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM

  const encryptedContent = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);

  // Combine IV + Encrypted Data and encode as Base64 for storage
  const combined = new Uint8Array(iv.length + encryptedContent.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encryptedContent), iv.length);

  return btoa(String.fromCharCode(...combined));
};

/**
 * Desencriptación Autenticada (Solo en panel de Admin)
 */
export const decryptSSN = async (base64Data: string, masterKey: string): Promise<string> => {
  try {
    const combined = new Uint8Array(
      atob(base64Data)
        .split('')
        .map((c) => c.charCodeAt(0)),
    );

    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const key = await deriveKey(masterKey);

    const decrypted = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Fallo al desencriptar SSN (AES-GCM):', error);
    return 'DECRYPTION_ERROR';
  }
};
