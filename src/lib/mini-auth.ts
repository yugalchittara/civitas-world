import { randomBytes } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const MINI_NONCE_COOKIE = "civitas_mini_nonce";
const MINI_SESSION_COOKIE = "civitas_mini_session";
const MINI_NONCE_TTL_SECONDS = 10 * 60;
const MINI_SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

type MiniSessionClaims = {
  sub: string;
  email: string;
  name: string;
  walletAddress: string;
};

function getJwtSecret() {
  const secret = String(process.env.NEXTAUTH_SECRET || "").trim();
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is required for mini app auth.");
  }
  return new TextEncoder().encode(secret);
}

export function createSiweNonce() {
  return randomBytes(16).toString("hex");
}

export async function setMiniNonceCookie(nonce: string) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: MINI_NONCE_COOKIE,
    value: nonce,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MINI_NONCE_TTL_SECONDS
  });
}

export async function getMiniNonceCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(MINI_NONCE_COOKIE)?.value || null;
}

export async function clearMiniNonceCookie() {
  const cookieStore = await cookies();
  cookieStore.set({
    name: MINI_NONCE_COOKIE,
    value: "",
    path: "/",
    maxAge: 0
  });
}

export async function issueMiniSessionCookie(claims: MiniSessionClaims) {
  const token = await new SignJWT({
    email: claims.email,
    name: claims.name,
    walletAddress: claims.walletAddress
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(`${MINI_SESSION_TTL_SECONDS}s`)
    .sign(getJwtSecret());

  const cookieStore = await cookies();
  cookieStore.set({
    name: MINI_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MINI_SESSION_TTL_SECONDS
  });
}

export async function clearMiniSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set({
    name: MINI_SESSION_COOKIE,
    value: "",
    path: "/",
    maxAge: 0
  });
}

export async function getMiniSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(MINI_SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const verified = await jwtVerify(token, getJwtSecret());
    const payload = verified.payload as {
      sub?: string;
      email?: string;
      name?: string;
      walletAddress?: string;
    };

    if (!payload.sub || !payload.email || !payload.walletAddress) return null;

    return {
      userId: payload.sub,
      email: payload.email,
      name: payload.name || payload.email,
      walletAddress: payload.walletAddress
    };
  } catch {
    return null;
  }
}
