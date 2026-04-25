import { NextResponse } from "next/server";
import { verifySiweMessage } from "@worldcoin/minikit-js/siwe";
import type { WalletAuthResult } from "@worldcoin/minikit-js/commands";
import { clearMiniNonceCookie, getMiniNonceCookie, issueMiniSessionCookie } from "@/lib/mini-auth";

function normalizeAddress(input: string | null | undefined) {
  const value = String(input || "").trim().toLowerCase();
  return /^0x[a-f0-9]{40}$/.test(value) ? value : null;
}

function walletEmailFromAddress(address: string) {
  return `wallet-${address}@mini.civitas.local`;
}

function walletDisplayName(address: string) {
  return `World ${address.slice(0, 6)}...${address.slice(-4)}`;
}

export async function POST(request: Request) {
  try {
    const nonce = await getMiniNonceCookie();
    if (!nonce) {
      return NextResponse.json(
        {
          error: "SIWE nonce missing or expired.",
          actionableHint: "Call /api/nonce and retry wallet auth."
        },
        { status: 400 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      walletAuthResult?: WalletAuthResult;
    };
    const walletAuthResult = body.walletAuthResult;
    if (!walletAuthResult?.address || !walletAuthResult?.message || !walletAuthResult?.signature) {
      return NextResponse.json({ error: "Invalid wallet auth payload." }, { status: 400 });
    }

    const verification = await verifySiweMessage(walletAuthResult, nonce);
    if (!verification.isValid) {
      await clearMiniNonceCookie();
      return NextResponse.json(
        {
          error: "Invalid SIWE signature.",
          actionableHint: "Retry sign-in from World App MiniKit walletAuth."
        },
        { status: 400 }
      );
    }

    const walletAddress = normalizeAddress(walletAuthResult.address);
    if (!walletAddress) {
      return NextResponse.json({ error: "Invalid wallet address." }, { status: 400 });
    }

    const email = walletEmailFromAddress(walletAddress);
    const name = walletDisplayName(walletAddress);

    await issueMiniSessionCookie({
      sub: walletAddress,
      email,
      name,
      walletAddress
    });
    await clearMiniNonceCookie();

    return NextResponse.json({
      success: true,
      user: {
        id: walletAddress,
        email,
        name,
        walletAddress
      }
    });
  } catch (error) {
    console.error("[complete-siwe] failed", error);
    return NextResponse.json({ error: "Unable to complete SIWE auth." }, { status: 500 });
  }
}
