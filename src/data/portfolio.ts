/*
  ─── Renk hatları ────────────────────────────────────────────────
  Sitedeki her renk bir hattı temsil eder; dekoratif renk yok.
  Değerler `globals.css`'teki token'lara işaret eder, böylece tema
  değişiminde tek yerden yönetilir.

    ai      → yeşil     (yapay zeka)
    mobile  → lacivert  (mobil)
    web     → mavi      (arayüz)
    data    → kırmızı   (backend & veri)
    infra   → kehribar  (altyapı)
    neutral → renksiz
*/
export type Track = 'ai' | 'mobile' | 'web' | 'data' | 'infra' | 'neutral';

export const trackColor: Record<Track, string> = {
  ai: 'var(--accent)',
  mobile: 'var(--navy)',
  web: 'var(--secondary)',
  data: 'var(--crimson)',
  infra: 'var(--tertiary)',
  neutral: 'var(--muted)',
};

/** `color-mix` sarmalayıcısı — `${hex}20` biçimindeki alfa ekleri yerine. */
export function tint(color: string, percent: number): string {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}

export const socialLinks = {
  medium: 'https://medium.com/@onurcogalan_96763',
  github: 'https://github.com/Enver-Onur-Cogalan',
  linkedin: 'https://www.linkedin.com/in/onurcogalan/',
  email: 'eonurcogalan@gmail.com',
};

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  github: string;
}

export const projects: Project[] = [
  {
    id: 'portfolio',
    title: 'Portfolio',
    description:
      'Modern animasyonlar ve interaktif sohbet botu ile kişisel portfolyo websitesi. Hakkımda, projeler, deneyimler ve iletişim bölümlerini içeren Next.js uygulaması.',
    technologies: ['Next.js', 'React', 'TypeScript', 'TailwindCSS', 'GSAP'],
    github: 'https://github.com/Enver-Onur-Cogalan/portfolio',
  },
  {
    id: 'jarvis',
    title: 'Jarvis',
    description:
      'Jarvis Assistant, günlük işlerinizi kolaylaştırmak ve sesli komutlarla mobil cihazınızla etkileşim kurmanıza olanak sağlamak üzere tasarlanmış akıllı bir kişisel asistandır.',
    technologies: ['React Native (Expo)', 'TypeScript', 'Groq (Llama 3.x)', 'ElevenLabs API', 'Expo Speech'],
    github: 'https://github.com/Enver-Onur-Cogalan/Jarvis',
  },
  {
    id: 'chatapp',
    title: 'ChatApp',
    description:
      'ChatApp, React Native CLI ve Socket.IO ile geliştirilmiş, gerçek zamanlı bire bir ve grup sohbet uygulamasıdır.',
    technologies: ['React Native CLI', 'TypeScript', 'MobX', 'Node.js', 'MongoDB', 'Socket.IO'],
    github: 'https://github.com/Enver-Onur-Cogalan/chatApp',
  },
  {
    id: 'movieapp',
    title: 'MovieApp',
    description:
      'React Native ile geliştirilmiş film izleme uygulaması.',
    technologies: ['React Native CLI', 'JavaScript', 'Firebase'],
    github: 'https://github.com/Enver-Onur-Cogalan/MovieAppRN',
  },
];

// ─── Deneyim Modeli ──────────────────────────────────────────
// `id`  → çeviri anahtarlarının kökü (experience.<id>.*)
// `caseStudy` → uzun anlatımlı deneyimler için Problem/Yaklaşım/Sonuç blokları
// `metrics`   → kartta öne çıkan sayısal sonuçlar
export type ExperienceType = 'education' | 'work';

export interface ExperienceMetric {
  /** Öne çıkan değer, ör. '%40' */
  value: string;
  /** Çeviri anahtarı soneki: experience.<id>.metric.<key> */
  key: string;
}

export interface Experience {
  id: string;
  /** Dönem etiketinin çeviri anahtarı */
  periodKey: string;
  /** Çeviri bulunamazsa kullanılacak Türkçe dönem metni */
  period: string;
  title: string;
  subtitle: string;
  description: string;
  type: ExperienceType;
  /** Başlığın altında duran tek cümlelik iş tanımı */
  headline?: string;
  /** Problem / Yaklaşım / Sonuç bloklarının çeviri anahtarı sonekleri */
  caseStudy?: string[];
  metrics?: ExperienceMetric[];
  tech?: string[];
}

export const experiences: Experience[] = [
  {
    id: 'ege',
    periodKey: 'exp.period.2020-2024',
    period: '2020 - 2024',
    title: 'Ege Üniversitesi',
    subtitle: 'Biyoloji Bölümü',
    description: 'Not ortalaması: 3.05/4',
    type: 'education',
  },
  {
    id: 'patika',
    periodKey: 'exp.period.2025',
    period: '2025',
    title: 'Patika+ React Native Bootcamp',
    subtitle: 'Bootcamp',
    description:
      'Seçkin ve yoğun içerikli bir yazılım bootcamp\'ini başarıyla tamamladım. React Native, JavaScript ve Git teknolojilerine odaklanarak, gerçek dünya problemlerine çözüm sağlayan mobil uygulama projeleri geliştirdim.',
    type: 'education',
  },
  {
    id: 'appisode',
    periodKey: 'exp.period.aug-sep-2025',
    period: 'Ağustos 2025 - Eylül 2025',
    title: 'Appisode',
    subtitle: 'Freelance React Native FullStack Developer',
    description:
      'London, UK (Remote). React Native tabanlı Expo framework\'ü kullanarak mobil uygulama geliştirme üzerinde çalıştım. Yeni özellikler geliştirdim, UI/UX iyileştirmeleri ve performans optimizasyonları yaptım.',
    type: 'work',
  },
  {
    id: 'envagro',
    periodKey: 'exp.period.dec2025-jun2026',
    period: 'Aralık 2025 - Haziran 2026',
    title: 'Envagro',
    subtitle: 'AI Researcher',
    headline: 'Konuşma ve Dil Modellerinin Ürüne Dönüşümü',
    description:
      'Konuşmaya dayalı yapay zekâ özellikleri için model seçimini sezgiden çıkarıp ölçüme dayandırdım. STT, TTS ve LLM modellerini aynı koşullarda benchmark edip seçilenleri ölçeklenebilir API\'lerle prototipten canlı ürüne taşıdım.',
    caseStudy: ['context', 'approach', 'result'],
    tech: ['STT', 'TTS', 'LLM', 'Benchmarking', 'API Design'],
    type: 'work',
  },
  {
    id: 'unimall',
    periodKey: 'exp.period.jun-aug-2026',
    period: 'Haziran 2026 - Ağustos 2026',
    title: 'Unimall',
    subtitle: 'AI Engineer',
    headline: '22 Milyon Kayıtlık E-ticaret Operasyonunun Otomasyonu',
    description:
      'Üç satış kanalına yayılmış 22 milyondan fazla ürün kaydının yönetildiği e-ticaret operasyonunu uçtan uca otomatikleştirdim. Cronjob ve webhook tabanlı senkronizasyon mimarisi, ilan metni üreten AI agent, OCR destekli veri girişi ve agentic destek chatbotu geliştirip üç ayrı paneli tek arayüzde topladım. OCR entegrasyonu tek başına operasyonel maliyette %40 tasarruf sağladı.',
    caseStudy: ['problem', 'approach', 'result'],
    metrics: [
      { value: '22M+', key: 'records' },
      { value: '%40', key: 'cost' },
      { value: '3 → 1', key: 'panels' },
    ],
    tech: ['AI Agents', 'OCR', 'Webhooks', 'Cronjob', 'Python', 'RAG'],
    type: 'work',
  },
];

// ─── Teknik Yetenekler ───────────────────────────────────────
// Kalemler alan bazında gruplanır. Teknik terimler dilden bağımsız
// olduğu için çevrilmez; yalnızca kategori başlıkları çevirilir.
export interface SkillCategory {
  id: string;
  titleKey: string;
  /** Kategorinin ait olduğu renk hattı */
  track: Track;
  skills: string[];
  /** Izgarada iki sütunu birden kaplar */
  fullWidth?: boolean;
}

export const skillCategories: SkillCategory[] = [
  {
    id: 'ai',
    titleKey: 'skills.category.ai',
    track: 'ai',
    skills: [
      'LLM',
      'RAG',
      'AI Agents',
      'LangChain',
      'LangGraph',
      'Azure OpenAI',
      'OCR',
      'STT / TTS',
      'Prompt Engineering',
      'Model Benchmarking',
    ],
  },
  {
    id: 'mobile',
    titleKey: 'skills.category.mobile',
    track: 'mobile',
    skills: ['React Native', 'Expo', 'React Native CLI', 'TypeScript'],
  },
  {
    id: 'web',
    titleKey: 'skills.category.web',
    track: 'web',
    skills: ['React', 'Next.js', 'Tailwind CSS', 'GSAP', 'Streamlit'],
  },
  {
    id: 'backend',
    titleKey: 'skills.category.backend',
    track: 'data',
    skills: [
      'Node.js',
      'Python',
      'API Design',
      'Socket.IO',
      'PostgreSQL',
      'MongoDB',
      'Redis',
      'Supabase',
      'Firebase',
    ],
  },
  {
    // Temel araçlar tek satırlık bir şerit olarak altta durur
    id: 'infra',
    titleKey: 'skills.category.infra',
    track: 'infra',
    fullWidth: true,
    skills: [
      'Docker',
      'Microsoft Azure',
      'Azure Blob Storage',
      'Signed URL / SAS',
      'Railway',
      'Git',
      'Webhooks & Cronjob',
    ],
  },
];

/** Düz liste — JSON-LD `knowsAbout` ve sohbet botu için. */
export const techStack: string[] = skillCategories.flatMap((c) => c.skills);

export interface AboutStat {
  value: string;
  labelKey: string;
  /** İkon eşlemesinin anahtarı (About.tsx) */
  icon: 'brain' | 'code' | 'coffee';
}

export const aboutStats: AboutStat[] = [
  { value: '1+', labelKey: 'about.stat.experience', icon: 'brain' },
  { value: '17', labelKey: 'about.stat.projects', icon: 'code' },
  { value: '∞', labelKey: 'about.stat.coffee', icon: 'coffee' },
];

export interface AboutPrinciple {
  titleKey: string;
  quoteKey: string;
}

export const aboutPrinciples: AboutPrinciple[] = [
  { titleKey: 'about.principle1.title', quoteKey: 'about.principle1.quote' },
  { titleKey: 'about.principle2.title', quoteKey: 'about.principle2.quote' },
  { titleKey: 'about.principle3.title', quoteKey: 'about.principle3.quote' },
];
