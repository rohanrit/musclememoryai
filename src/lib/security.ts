// Bappa Security Layer — E2E Encryption, Hashing, SRI
import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64 } from 'tweetnacl-util';
import type { EncryptionKeys } from './types';

/**
 * Generate a new keypair for peer identity
 */
export function generateKeyPair(): EncryptionKeys {
  const pair = nacl.box.keyPair();
  return { publicKey: pair.publicKey, secretKey: pair.secretKey };
}

/**
 * Encrypt a message for a specific peer using their public key
 */
export function encryptForPeer(
  message: string,
  recipientPublicKey: Uint8Array,
  senderSecretKey: Uint8Array
): { encrypted: string; nonce: string } {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const messageUint8 = new TextEncoder().encode(message);
  const encrypted = nacl.box(messageUint8, nonce, recipientPublicKey, senderSecretKey);
  if (!encrypted) throw new Error('Encryption failed');
  return {
    encrypted: encodeBase64(encrypted),
    nonce: encodeBase64(nonce),
  };
}

/**
 * Decrypt a message from a peer
 */
export function decryptFromPeer(
  encryptedBase64: string,
  nonceBase64: string,
  senderPublicKey: Uint8Array,
  recipientSecretKey: Uint8Array
): string {
  const encrypted = decodeBase64(encryptedBase64);
  const nonce = decodeBase64(nonceBase64);
  const decrypted = nacl.box.open(encrypted, nonce, senderPublicKey, recipientSecretKey);
  if (!decrypted) throw new Error('Decryption failed — message may be tampered');
  return new TextDecoder().decode(decrypted);
}

/**
 * Generate a SHA-256 hash for integrity verification
 */
export async function hashChunk(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Verify chunk integrity against expected hash
 */
export async function verifyIntegrity(data: string, expectedHash: string): Promise<boolean> {
  const hash = await hashChunk(data);
  return hash === expectedHash;
}

/**
 * Generate a Subresource Integrity (SRI) hash
 */
export async function generateSRI(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(content));
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  return `sha256-${base64}`;
}

/**
 * Generate a JWT-like peer identity token (simplified)
 */
export function generatePeerToken(peerId: string, publicKey: Uint8Array): string {
  const header = btoa(JSON.stringify({ alg: 'Ed25519', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: peerId,
    pub: encodeBase64(publicKey),
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  }));
  const signature = encodeBase64(nacl.randomBytes(32)); // Simplified
  return `${header}.${payload}.${signature}`;
}
