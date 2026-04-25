import { NextResponse } from "next/server";
import { getMiniSession } from "@/lib/mini-auth";

export async function GET() {
  const session = await getMiniSession();
  if (!session) return NextResponse.json({ user: null });

  return NextResponse.json({
    user: {
      id: session.userId,
      email: session.email,
      name: session.name,
      walletAddress: session.walletAddress
    }
  });
}
