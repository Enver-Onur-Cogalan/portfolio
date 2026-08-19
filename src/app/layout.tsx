import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Header from "@/components/layout/Header";
import MusicPlayer from "@/components/ui/MusicPlayer";
import ChatWidget from "@/components/chat/ChatWidget";
import { socialLinks, techStack } from "@/data/portfolio";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://portfolio-sand-two-79.vercel.app";
const TITLE = "Enver Onur Çoğalan | AI Engineer & Mobile Developer";
const DESCRIPTION =
  "Biyoloji disipliniyle yetişmiş, AI mühendisliği ve React Native geliştirme üzerine çalışan bir yazılım geliştiricisi. Projeler, deneyimler ve iletişim.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // maximumScale / userScalable bilinçli olarak ayarlanmıyor: kullanıcının
  // sayfayı yakınlaştırmasını engellemek bir erişilebilirlik ihlali.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAF8" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "Enver Onur Çoğalan Portfolio",
  authors: [{ name: "Enver Onur Çoğalan", url: SITE_URL }],
  creator: "Enver Onur Çoğalan",
  keywords: [
    "Enver Onur Çoğalan",
    "AI Engineer",
    "Mobile Developer",
    "React Native",
    "Next.js",
    "LLM",
    "STT",
    "TTS",
    "portfolio",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    alternateLocale: ["en_US"],
    url: SITE_URL,
    siteName: "Enver Onur Çoğalan",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

// Arama motorlarına kişi bilgisini yapılandırılmış olarak verir.
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Enver Onur Çoğalan",
  url: SITE_URL,
  email: `mailto:${socialLinks.email}`,
  jobTitle: "AI Engineer & Mobile Developer",
  description: DESCRIPTION,
  knowsAbout: techStack,
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Ege Üniversitesi",
  },
  sameAs: [socialLinks.github, socialLinks.linkedin, socialLinks.medium],
};

// React çalışmadan önce tema sınıfını uygular; koyu tema tercih eden
// ziyaretçinin beyaz bir flaş görmesini engeller.
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}>
        <ThemeProvider>
          <LanguageProvider>
            <a
              href="#hakkimda"
              className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[var(--accent)] focus:text-black focus:font-medium"
            >
              İçeriğe geç
            </a>
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
