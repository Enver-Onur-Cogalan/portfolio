import type { Language } from '@/i18n/translations';

/*
  CV'ye özel metinler.

  Şirket, unvan, dönem, projeler, teknolojiler ve bağlantılar sitenin
  kendi verisinden (portfolio.ts, translations.ts) geliyor. Burada
  yalnızca CV'nin kendi dili var: kısa özet ve deneyim maddeleri. Sitede
  aynı işler uzun anlatımla duruyor; CV'de birkaç saniyede taranacak
  maddeler gerekiyor.

  PDF'ler: npm run cv → public/cv.pdf (TR) ve public/cv-en.pdf (EN)
*/

type Localized = Record<Language, string>;

export const cvRole: Localized = {
  tr: 'AI Engineer & Mobile Developer',
  en: 'AI Engineer & Mobile Developer',
};

export const cvSummary: Localized = {
  tr: "Mobil geliştirmeden gelen bir AI mühendisiyim. İnsanların gerçekten kullandığı yapay zeka sistemleri kuruyorum: agent'lar, OCR pipeline'ları, konuşma ve dil modeli entegrasyonları. Unimall'da 22 milyondan fazla ürün kaydı olan bir e-ticaret operasyonunu otomatikleştirdim; OCR entegrasyonu tek başına maliyeti %40 düşürdü. Biyolog olarak başladım; o yıllardan kalan alışkanlık, varsayımı ölçümle doğrulamak.",
  en: 'AI engineer with a mobile background. I build AI systems people actually use: agents, OCR pipelines, speech and language model integrations. At Unimall I automated an e-commerce operation of more than 22 million product records; the OCR integration alone cut operating costs by 40%. I started out as a biologist, and the habit stuck: assumptions get verified by measurement.',
};

/** Deneyim maddeleri; anahtarlar portfolio.ts'teki deneyim id'leri */
export const cvBullets: Record<string, Record<Language, string[]>> = {
  unimall: {
    tr: [
      'OCR tabanlı veri işleme pipeline\'ı kurarak operasyonel maliyeti %40 düşürdüm',
      '3 satış kanalındaki 22M+ ürün kaydını cronjob ve webhook mimarisiyle otomatik senkronize ettim',
      'Ürün özelliklerinden ilan metni üreten AI agent\'ı tasarlayıp production\'a aldım',
      'Müşteri desteğini otomatikleştiren agentic chatbot geliştirdim',
      '3 ayrı yönetim panelini tek arayüzde birleştirdim',
    ],
    en: [
      'Built an OCR-based data processing pipeline that cut operating costs by 40%',
      'Kept 22M+ product records in sync across 3 sales channels with a cronjob and webhook architecture',
      'Designed and shipped an AI agent that writes product listings from product attributes',
      'Built an agentic chatbot that automates customer support',
      'Merged 3 separate admin panels into a single interface',
    ],
  },
  envagro: {
    tr: [
      'STT, TTS ve LLM modellerini aynı koşullarda benchmark ederek model seçimini ölçüme dayandırdım',
      'AI servisleri için ölçeklenebilir API\'ler tasarlayıp geliştirdim',
      'Model entegrasyonlarını prototipten production\'a uçtan uca taşıdım',
      'Araştırma bulgularını ürün, yazılım ve tasarım ekipleriyle kullanıcıya ulaşan özelliklere dönüştürdüm',
    ],
    en: [
      'Benchmarked STT, TTS and LLM models under identical conditions, making model selection measurement-driven',
      'Designed and built scalable APIs for AI services',
      'Took model integrations from prototype to production end to end',
      'Turned research findings into user-facing features with product, engineering and design teams',
    ],
  },
  appisode: {
    tr: [
      'React Native ve Expo ile yeni özellikleri uçtan uca geliştirdim',
      'UI/UX iyileştirmeleri ve performans optimizasyonlarıyla uygulamanın akıcılığını artırdım',
      'Yapay zeka ve ödeme sistemi entegrasyonlarını geliştirdim',
      'GitHub Actions ile build ve dağıtımı otomatikleştiren CI/CD pipeline\'ı kurdum',
    ],
    en: [
      'Built new features end to end with React Native and Expo',
      'Made the app smoother through UI/UX improvements and performance optimization',
      'Developed AI and payment system integrations',
      'Set up a GitHub Actions CI/CD pipeline that automates builds and releases',
    ],
  },
};

/** Deneyim yerleri; sitede henüz gösterilmiyor */
export const cvLocation: Record<string, Localized> = {
  unimall: { tr: 'Hong Kong', en: 'Hong Kong' },
  envagro: { tr: 'İstanbul', en: 'Istanbul' },
  appisode: { tr: 'Londra (Remote)', en: 'London (Remote)' },
  ege: { tr: 'İzmir', en: 'Izmir' },
  patika: { tr: 'İstanbul (Online)', en: 'Istanbul (Online)' },
};

/** Proje başına tek satır; başlık, teknolojiler ve bağlantı portfolio.ts'ten */
export const cvProjects: Record<string, Localized> = {
  weatherapp: {
    tr: 'Ne zaman dışarı çıkman gerektiğini söyleyen hava uygulaması; soruları yorumlayan model yerelde çalışıyor.',
    en: 'A weather app that tells you when to go out; the model that interprets questions runs locally.',
  },
  memefile: {
    tr: 'Tepki videoları için masaüstü kütüphanesi: etiketle, tam metin aramayla saniyede bul, Discord\'a sürükle.',
    en: 'A desktop library for reaction videos: tag clips, find them in a second with full-text search, drag into Discord.',
  },
  portfolio: {
    tr: 'Kişisel sitem; bilerek LLM kullanmayan, 250+ vakalık testle korunan iki dilli bir sohbet botu dahil.',
    en: 'My personal site, including a deliberately LLM-free bilingual chatbot guarded by a 250+ case test set.',
  },
};

export const cvEducationTitle: Record<string, Localized> = {
  ege: { tr: 'Ege Üniversitesi', en: 'Ege University' },
};

export const cvEducationNote: Record<string, Localized> = {
  ege: { tr: 'Biyoloji Lisans, GNO 3.05/4.00', en: 'BSc in Biology, GPA 3.05/4.00' },
  patika: { tr: 'React Native, JavaScript, Git', en: 'React Native, JavaScript, Git' },
};

export const cvLanguages: Localized = {
  tr: 'Türkçe (anadil) · İngilizce (B2; okuma C1)',
  en: 'Turkish (native) · English (B2; reading C1)',
};

export const cvLabels: Record<Language, Record<string, string>> = {
  tr: {
    summary: 'Özet',
    experience: 'Deneyim',
    projects: 'Projeler',
    education: 'Eğitim',
    skills: 'Beceriler',
    languages: 'Diller',
    location: 'İzmir, Türkiye · Remote',
  },
  en: {
    summary: 'Summary',
    experience: 'Experience',
    projects: 'Projects',
    education: 'Education',
    skills: 'Skills',
    languages: 'Languages',
    location: 'Izmir, Türkiye · Remote',
  },
};
