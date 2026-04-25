"use client";

import type { ReactNode } from "react";
import { MiniKitProvider } from "@worldcoin/minikit-js/minikit-provider";

export function MiniProviders({ children }: { children: ReactNode }) {
  return <MiniKitProvider>{children}</MiniKitProvider>;
}
