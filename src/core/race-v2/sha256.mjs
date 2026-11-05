// Shared WebCrypto adapter: secure context in browsers, WebCrypto in Node.
// This provides integrity checking, not authentication.
export async function sha256(text) {
  if (typeof text !== 'string' || !globalThis.crypto?.subtle) throw new Error('WebCrypto SHA-256 unavailable');
  const bytes = new TextEncoder().encode(text);
  const digest = new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256', bytes));
  return Array.from(digest, b => b.toString(16).padStart(2, '0')).join('');
}
