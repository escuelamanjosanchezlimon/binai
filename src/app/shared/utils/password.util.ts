export function randomSaltHex(length = 16): string {
    const bytes = crypto.getRandomValues(new Uint8Array(length));
    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}


const ALGO = 'AES-GCM';
const ITERATIONS = 100_000;
const KEY_LENGTH = 256;

/**
 * Deriva una clave AES-GCM desde una contraseña usando PBKDF2
 */
export async function deriveKey(
    password: string,
    salt: string
): Promise<CryptoKey> {

    const enc = new TextEncoder();

    const baseKey: CryptoKey = await crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
    );

    return await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: enc.encode(salt),
            iterations: ITERATIONS,
            hash: 'SHA-256',
        },
        baseKey,
        { name: ALGO, length: KEY_LENGTH },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * Cifra texto plano y devuelve Base64 (iv + ciphertext)
 */
export async function encryptData(
    plaintext: string,
    key: CryptoKey
): Promise<string> {

    const enc = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const ciphertext = await crypto.subtle.encrypt(
        { name: ALGO, iv },
        key,
        enc.encode(plaintext)
    );

    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(ciphertext), iv.length);

    return btoa(String.fromCharCode(...combined));
}

/**
 * Descifra Base64 (iv + ciphertext)
 */
export async function decryptData(
    base64Data: string,
    key: CryptoKey
): Promise<string> {

    const combined = Uint8Array.from(
        atob(base64Data),
        c => c.charCodeAt(0)
    );

    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
        { name: ALGO, iv },
        key,
        data
    );

    return new TextDecoder().decode(decrypted);
}
