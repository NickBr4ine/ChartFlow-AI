import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChartFlow AI",
  description: "Educational crypto market analysis dashboard"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
