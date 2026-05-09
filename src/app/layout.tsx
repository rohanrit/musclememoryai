import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VibeCode — Distributed AI Coding IDE",
  description: "A free, open-source IDE that uses P2P networking to distribute AI computation across a swarm of peers. Code smarter with the power of the swarm.",
  keywords: ["IDE", "AI", "P2P", "distributed computing", "vibe coding", "open source"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable} dark`}>
      <body className="h-full overflow-hidden bg-[#09090b] text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
