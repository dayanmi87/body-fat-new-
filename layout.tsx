import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Body Fat Visualizer",
  description: "Mobile-first app to estimate visual body-fat range and create simulated before/after body composition edits."
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he">
      <body>{children}</body>
    </html>
  );
}