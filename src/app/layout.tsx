import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Civitas World Demo",
  description: "Standalone World App and World ID demo for Civitas."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
