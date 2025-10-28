const ENCODER = new TextEncoder();
const DECODER = new TextDecoder();
const ENCRYPTION_SECRET =
  process.env.REACT_APP_OPENAI_KEY_SECRET || "mind-trix-local-secret";
const COLLECTION_NAME = "openaiKeys";

function toBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function fromBase64(value) {
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
}

async function deriveAesKey(userId, saltBytes) {
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    ENCODER.encode(`${ENCRYPTION_SECRET}:${userId}`),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBytes,
      iterations: 120000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptApiKey(userId, apiKey) {
  const saltBytes = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const cryptoKey = await deriveAesKey(userId, saltBytes);
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    ENCODER.encode(apiKey)
  );

  return {
    salt: toBase64(saltBytes),
    iv: toBase64(iv),
    ciphertext: toBase64(ciphertext),
    updatedAt: new Date().toISOString(),
  };
}

export async function decryptApiKey(userId, payload) {
  if (!payload) return "";

  const saltBytes = fromBase64(payload.salt);
  const iv = fromBase64(payload.iv);
  const cryptoKey = await deriveAesKey(userId, saltBytes);
  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    fromBase64(payload.ciphertext)
  );

  return DECODER.decode(decrypted);
}

export async function saveEncryptedKey({ firestore, userId, apiKey }) {
  const { doc, setDoc } = await import("firebase/firestore");
  const encrypted = await encryptApiKey(userId, apiKey);
  const docRef = doc(firestore, COLLECTION_NAME, userId);
  await setDoc(docRef, encrypted, { merge: true });
  return encrypted;
}

export async function loadEncryptedKey({ firestore, userId }) {
  const { doc, getDoc } = await import("firebase/firestore");
  const docRef = doc(firestore, COLLECTION_NAME, userId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) {
    return null;
  }
  return snapshot.data();
}

export async function clearEncryptedKey({ firestore, userId }) {
  const { doc, deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(firestore, COLLECTION_NAME, userId));
}
