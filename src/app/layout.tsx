import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { BottomNav } from "@/components/bottom-nav";
import { PwaRegister } from "@/components/pwa-register";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kidnap",
  description: "One tap to adventure.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Kidnap",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#050507",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-black pb-20 antialiased`}
      >
        {children}
        <BottomNav />
        <PwaRegister />
      </body>
    </html>
  );
}
