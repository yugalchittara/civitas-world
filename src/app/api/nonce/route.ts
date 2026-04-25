import { NextResponse } from "next/server";
import { createSiweNonce, setMiniNonceCookie } from "@/lib/mini-auth";

export async function GET() {
  const nonce = createSiweNonce();
  await setMiniNonceCookie(nonce);
  return NextResponse.json({ nonce });
}
