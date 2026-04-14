import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Header from "@/components/layout/Header";
import MusicPlayer from "@/components/ui/MusicPlayer";
import ChatWidget from "@/components/chat/ChatWidget";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Enver Onur Çoğalan | AI Researcher & Mobile Developer",
  description:
    "Biyoloji disipliniyle yetişmiş, AI araştırmaları ve React Native geliştirme ile ilgilenen yazılım geliştiricisi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <ThemeProvider>
          <LanguageProvider>
            <Header />
            <main>{children}</main>
            <MusicPlayer />
            <ChatWidget />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
