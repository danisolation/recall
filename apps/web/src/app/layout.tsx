import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "DANISOLATION Recall",
  description: "A modern flashcard and learning platform",
  icons: { icon: "/favicon.svg" },
};

// The paper tone as the browser chrome color (ADR-013).
export const viewport: Viewport = {
  themeColor: "#FAF7EC",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
