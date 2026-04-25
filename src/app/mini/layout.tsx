import type { ReactNode } from "react";
import { MiniProviders } from "@/components/mini/mini-providers";

export default function MiniLayout({ children }: { children: ReactNode }) {
  return <MiniProviders>{children}</MiniProviders>;
}
