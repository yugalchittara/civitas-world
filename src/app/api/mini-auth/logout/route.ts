import { NextResponse } from "next/server";
import { clearMiniSessionCookie } from "@/lib/mini-auth";
import { assertSameOriginMutation } from "@/lib/csrf";

export async function POST(request: Request) {
  try {
    assertSameOriginMutation(request);
    await clearMiniSessionCookie();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
