import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PokéNavi",
  description: "PokéNavi - Your Pokémon Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Update the favicon and icons */}
        <link rel="icon" href="/poke-radar-192.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/poke-radar-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/poke-radar-512.png" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="description" content="PokéNavi - Your Pokémon Assistant" />
        <title>PokéNavi</title>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
