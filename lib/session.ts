// Signed session cookie (works in middleware and on the server).
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "rdc_session";
export const SESSION_MAX_AGE = 60 * 60 * 12; // 12 hours

export type SessionPayload = {
  userId: string;
  role: "ADMIN" | "DOCTOR" | "RECEPTION";
  name: string;
};

// On your own computer a built-in secret is used if AUTH_SECRET is missing.
// On Vercel, AUTH_SECRET must be set (32+ characters), or sign-in is refused.
const LOCAL_DEV_SECRET = "ruwa-dental-local-only-secret-not-for-production-use";

export function authSecretMissing() {
  const s = process.env.AUTH_SECRET;
  return !s || s.length < 32;
}

function key() {
  if (authSecretMissing()) {
    if (process.env.VERCEL) throw new Error("AUTH_SECRET must be set (32+ characters)");
    return new TextEncoder().encode(LOCAL_DEV_SECRET);
  }
  return new TextEncoder().encode(process.env.AUTH_SECRET!);
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(key());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
