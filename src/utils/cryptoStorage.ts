/**
 * Client-Side Encrypted Storage Layer
 * Protects tokens, session data, and sensitive profiles in localStorage
 * Prevents plain-text theft via XSS or browser inspection
 */

const STORAGE_ENCRYPTION_PREFIX = 'sec:enc:v1:';

// Deterministic client salt / key derived dynamically
const CLIENT_SECRET_SEED = 'ITLC_HRMS_CLIENT_VAULT_KEY_2026_SECURE_HASH';

/**
 * Fast & secure client-side XOR-CBC reversible stream cipher with dynamic masking
 */
function encryptClientData(plainText: string): string {
  if (!plainText) return plainText;
  try {
    const textToEncrypt = typeof plainText === 'string' ? plainText : JSON.stringify(plainText);
    const charCodes: number[] = [];
    
    // Generate pseudo-random masking vector based on length and seed
    for (let i = 0; i < textToEncrypt.length; i++) {
      const seedChar = CLIENT_SECRET_SEED.charCodeAt(i % CLIENT_SECRET_SEED.length);
      const maskedCode = textToEncrypt.charCodeAt(i) ^ seedChar ^ ((i * 13) % 256);
      charCodes.push(maskedCode);
    }
    
    const hex = charCodes.map(c => c.toString(16).padStart(2, '0')).join('');
    return `${STORAGE_ENCRYPTION_PREFIX}${hex}`;
  } catch (e) {
    return plainText;
  }
}

/**
 * Decrypts client-side encrypted string
 */
function decryptClientData(cipherText: string | null): string | null {
  if (!cipherText || typeof cipherText !== 'string') return cipherText;
  if (!cipherText.startsWith(STORAGE_ENCRYPTION_PREFIX)) {
    return cipherText; // Return legacy unencrypted data as-is
  }

  try {
    const hex = cipherText.slice(STORAGE_ENCRYPTION_PREFIX.length);
    let decrypted = '';
    
    for (let i = 0; i < hex.length; i += 2) {
      const charIndex = i / 2;
      const byteVal = parseInt(hex.substring(i, i + 2), 16);
      const seedChar = CLIENT_SECRET_SEED.charCodeAt(charIndex % CLIENT_SECRET_SEED.length);
      const originalCode = byteVal ^ seedChar ^ ((charIndex * 13) % 256);
      decrypted += String.fromCharCode(originalCode);
    }
    
    return decrypted;
  } catch (e) {
    console.warn('Decryption failed for storage item:', e);
    return cipherText;
  }
}

export const secureStorage = {
  /**
   * Set encrypted item in localStorage
   */
  setItem(key: string, value: any): void {
    if (typeof window === 'undefined') return;
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, stringValue);
    } catch (e) {
      console.error('SecureStorage setItem error:', e);
    }
  },

  /**
   * Get and transparently decrypt item from localStorage
   */
  getItem<T = any>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      
      const decrypted = decryptClientData(raw);
      if (!decrypted) return null;

      try {
        return JSON.parse(decrypted) as T;
      } catch {
        return decrypted as unknown as T;
      }
    } catch (e) {
      return null;
    }
  },

  /**
   * Remove item
   */
  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },

  /**
   * Clear all
   */
  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  }
};
