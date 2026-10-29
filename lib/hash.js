// ─── Client-Side SHA-256 Hash Engine ─────────────────────────────────────────
// Uses crypto-js to compute a SHA-256 fingerprint of file bytes in the browser.
// Raw document bytes NEVER leave the client — only the hash is sent anywhere.

import CryptoJS from "crypto-js";

/**
 * Compute SHA-256 fingerprint of a File object.
 * @param {File} file - The PDF/document file selected by the user.
 * @returns {Promise<string>} Lowercase hex SHA-256 digest (64 chars).
 */
export async function computeFileHash(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        // Convert ArrayBuffer → WordArray for CryptoJS
        const arrayBuffer = e.target.result;
        const wordArray   = CryptoJS.lib.WordArray.create(arrayBuffer);
        const hash        = CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex);
        resolve(hash);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Compute SHA-256 fingerprint of a plain text string (for demo/testing).
 * @param {string} text - Any text string.
 * @returns {string} Lowercase hex SHA-256 digest.
 */
export function computeTextHash(text) {
  return CryptoJS.SHA256(text).toString(CryptoJS.enc.Hex);
}

/**
 * Format a 64-char hex hash with spaces every 8 chars for display readability.
 * e.g. "a3f5c8e1 d2b47f9e 6a0c3d5b ..."
 */
export function formatHashDisplay(hash) {
  if (!hash) return "";
  return hash.match(/.{1,8}/g)?.join(" ") || hash;
}

/**
 * Validate that a string looks like a SHA-256 hex digest (64 lowercase hex chars).
 */
export function isValidHash(hash) {
  return /^[a-f0-9]{64}$/.test(hash);
}

/**
 * Simulate typewriter-reveal of a hash string.
 * Calls onUpdate(partial) as each character is appended.
 * @param {string}   hash     - Full hash string to reveal.
 * @param {Function} onUpdate - Callback invoked with growing partial string.
 * @param {number}   delay    - Delay in ms between characters (default: 25ms).
 */
export async function animateHashReveal(hash, onUpdate, delay = 18) {
  let revealed = "";
  for (const char of hash) {
    revealed += char;
    onUpdate(revealed);
    await new Promise((r) => setTimeout(r, delay));
  }
}
