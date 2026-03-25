import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Invoicing App",
  description: "Create and manage invoices for your business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
