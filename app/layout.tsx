"use client";

import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Invoicing App",
  description: "Professional invoicing for tradies",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <SessionProvider>
        <body className="antialiased">{children}</body>
      </SessionProvider>
    </html>
  );
}