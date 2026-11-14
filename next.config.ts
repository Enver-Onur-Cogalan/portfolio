import type { NextConfig } from "next";

/*
  Güvenlik başlıkları.

  İçerik Güvenlik Politikası (CSP) "yalnızca kendi adresimiz" diyor:
  fontlar next/font ile buradan sunuluyor, video, müzik, PDF ve görseller
  aynı adresten geliyor, dışarıdan yüklenen bir betik yok.

  'unsafe-inline' (betik): tema ve dili sayfa boyanmadan önce uygulayan
  küçük satır içi betikler için gerekli. Nonce kullanmak her sayfayı
  dinamik oluşturmaya zorlardı; Next'in nonce'suz kurulum önerisi bu.
  'unsafe-inline' (stil): bileşenlerde satır içi stiller var.

  Vercel önizleme adreslerinde Vercel'in geri bildirim araç çubuğu
  çalışsın diye yalnızca orada vercel.live izinli; canlı sitede yok.
  HSTS'yi Vercel zaten gönderiyor.
*/
const isDev = process.env.NODE_ENV === "development";
const isPreview = process.env.VERCEL_ENV === "preview";

const vercelLive = isPreview ? " https://vercel.live" : "";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}${vercelLive}`,
  `style-src 'self' 'unsafe-inline'${vercelLive}`,
  `img-src 'self' data: blob:${isPreview ? " https://vercel.live https://vercel.com" : ""}`,
  `font-src 'self'${isPreview ? " https://vercel.live https://assets.vercel.com" : ""}`,
  "media-src 'self'",
  `connect-src 'self'${isPreview ? " https://vercel.live wss://ws-us3.pusher.com" : ""}`,
  // CV önizlemesi kendi adresimizdeki PDF'i iframe'de gösteriyor
  `frame-src 'self'${vercelLive}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // Yalnızca kendi sayfamız çerçeveye alabilir: CV önizlemesi kendi
  // PDF'imizi iframe'de gösteriyor; 'none' onu da engelliyordu
  "frame-ancestors 'self'",
  // Yalnızca Vercel'de (HTTPS): yerel http sunucusunda Safari bu kuralla
  // her isteği https'e yükseltip videoyu ve PDF'i yükleyemiyordu
  ...(process.env.VERCEL ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Başka bir site bu sayfayı çerçeve içine alamasın (tıklama hırsızlığı);
  // eski tarayıcılar için frame-ancestors'un karşılığı
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Tarayıcı dosya türünü tahmin etmesin, bildirilen türe uysun
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Site bunların hiçbirini kullanmıyor
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
