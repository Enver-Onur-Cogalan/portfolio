import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import Header from "@/components/layout/Header";
import MusicPlayer from "@/components/ui/MusicPlayer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Onur Coşkun | AI Researcher & Mobile Developer",
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
          <Header />
          <main>{children}</main>
          <MusicPlayer />
        </ThemeProvider>
      </body>
    </html>
  );
}
