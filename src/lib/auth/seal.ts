import { CompactEncrypt, compactDecrypt } from "jose";
import { createHash, hkdfSync } from "node:crypto";
import { deflateRawSync, inflateRawSync } from "node:zlib";

/**
 * Encrypted cookie values: JWE compact, `alg: dir`, `enc: A256GCM`. The key is HKDF-SHA256 of
 * ADMIN_SESSION_SECRET with a per-purpose label, so the login cookie and the session cookie can never be
 * swapped for one another. Ported from rockypoint-net `apps/web/src/lib/staff-auth/seal.ts` (own salt/labels,
 * so an RPN cookie never opens here).
 *
 * The plaintext is raw-deflated JSON: an Entra access token is ~1.5–2.5 KB, and deflate wins back much of
 * the JWE base64 overhead, which keeps the session near a single 4 KB cookie. AES-GCM authenticates the
 * ciphertext, so tampering fails to decrypt. `exp` (seconds) is checked on open.
 * Server only (node:crypto); pure, so it is unit-tested.
 */

export type SealPurpose = "admin-session" | "admin-login";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function deriveKey(secret: string, purpose: SealPurpose): Uint8Array {
  const salt = createHash("sha256").update("oceano-admin-auth-v1").digest();
  return new Uint8Array(
    hkdfSync("sha256", encoder.encode(secret), salt, `oa:${purpose}`, 32),
  );
}

export async function seal<T extends { exp: number }>(
  value: T,
  secret: string,
  purpose: SealPurpose,
): Promise<string> {
  const plaintext = deflateRawSync(encoder.encode(JSON.stringify(value)));
  return new CompactEncrypt(new Uint8Array(plaintext))
    .setProtectedHeader({ alg: "dir", enc: "A256GCM", cty: purpose })
    .encrypt(deriveKey(secret, purpose));
}

/** `null` for anything that is not a valid, unexpired value sealed for this purpose. */
export async function unseal<T extends { exp: number }>(
  token: string | undefined,
  secret: string,
  purpose: SealPurpose,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): Promise<T | null> {
  if (!token) return null;
  try {
    const { plaintext, protectedHeader } = await compactDecrypt(
      token,
      deriveKey(secret, purpose),
      {
        keyManagementAlgorithms: ["dir"],
        contentEncryptionAlgorithms: ["A256GCM"],
      },
    );
    if (protectedHeader.cty !== purpose) return null;
    const value = JSON.parse(decoder.decode(inflateRawSync(plaintext))) as T;
    if (typeof value?.exp !== "number" || value.exp <= nowSeconds) return null;
    return value;
  } catch {
    return null;
  }
}

/** One browser cookie holds ~4096 bytes including its name and attributes. */
export const COOKIE_CHUNK_SIZE = 3800;
export const MAX_COOKIE_CHUNKS = 3;

/** `oa_session`, `oa_session.1`, `oa_session.2`. */
export const chunkName = (base: string, index: number) =>
  index === 0 ? base : `${base}.${index}`;

/** Splits a sealed value across cookies when it would not fit in one. */
export function splitIntoChunks(
  value: string,
  size: number = COOKIE_CHUNK_SIZE,
): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < value.length; i += size)
    chunks.push(value.slice(i, i + size));
  if (chunks.length > MAX_COOKIE_CHUNKS)
    throw new Error(`Sealed value too large: ${value.length} bytes`);
  return chunks;
}

/** Reassembles chunks in order; stops at the first missing one. */
export function joinChunks(
  base: string,
  read: (name: string) => string | undefined,
): string | undefined {
  let value = "";
  for (let i = 0; i < MAX_COOKIE_CHUNKS; i++) {
    const part = read(chunkName(base, i));
    if (part === undefined) break;
    value += part;
  }
  return value || undefined;
}
