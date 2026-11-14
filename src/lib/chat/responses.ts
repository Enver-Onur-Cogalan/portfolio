import { projects, skillCategories, experiences, socialLinks, aboutPrinciples } from '@/data/portfolio';
import { translate, type Language } from '@/i18n/translations';
import { entitySuggestion, type Answer } from './knowledge';

/** Sayfadaki bölüm kimlikleri: bot cevabı hangi bölüme kaydıracağını söyler. */
export type SectionId = 'hakkimda' | 'yetenekler' | 'projeler' | 'deneyimler' | 'iletisim';

const t = translate;
const L = (lang: Language, tr: string, en: string) => (lang === 'tr' ? tr : en);

// ─── Öneri düğmeleri ─────────────────────────────────────────
// `query`, düğmeye basılınca bota gönderilen metin. Projeler ve
// "weatherapp:tech" gibi varlık soruları veriden üretiliyor.

export interface Topic {
  label: Record<Language, string>;
  query: string;
}

const staticTopics: Record<string, Topic> = {
  hakkinda: { label: { tr: 'Hakkında', en: 'About' }, query: 'kendini tanıt' },
  projeler: { label: { tr: 'Projeler', en: 'Projects' }, query: 'projeler' },
  yetenekler: { label: { tr: 'Yetenekler', en: 'Skills' }, query: 'yetenekler' },
  deneyim: { label: { tr: 'Deneyimler', en: 'Experience' }, query: 'deneyim' },
  egitim: { label: { tr: 'Eğitim', en: 'Education' }, query: 'eğitim' },
  iletisim: { label: { tr: 'İletişim', en: 'Contact' }, query: 'iletişim' },
  ai: { label: { tr: 'AI tarafı', en: 'AI work' }, query: 'yapay zeka' },
  mobil: { label: { tr: 'Mobil tarafı', en: 'Mobile work' }, query: 'react native' },
  biyoloji: { label: { tr: 'Biyolojiden yazılıma', en: 'Biology to software' }, query: 'biyoloji' },
  konum: { label: { tr: 'Nerede yaşıyor?', en: 'Where is he?' }, query: 'nerede' },
  hobi: { label: { tr: 'Boş zamanları', en: 'Free time' }, query: 'hobi' },
  motivasyon: { label: { tr: 'Felsefesi', en: 'Philosophy' }, query: 'felsefe' },
  musaitlik: { label: { tr: 'Müsaitlik', en: 'Availability' }, query: 'müsait mi' },
  neden: { label: { tr: 'Neden Onur?', en: 'Why Onur?' }, query: 'neden seni işe alayım' },
  zorluk: { label: { tr: 'En zor problem', en: 'Hardest problem' }, query: 'en zor problem' },
  calisma: { label: { tr: 'Nasıl çalışır?', en: 'How he works' }, query: 'çalışma tarzı' },
  cv: { label: { tr: 'CV', en: 'Resume' }, query: 'cv' },
  nollm: { label: { tr: 'Neden LLM yok?', en: 'Why no LLM?' }, query: 'neden llm yok' },
};

// Her proje ve iş deneyimi kendi adıyla bir öneri düğmesi olabiliyor
const entityTopics: Record<string, Topic> = Object.fromEntries(
  [...projects.map((p) => [p.id, p.title]), ...experiences.filter((e) => e.type === 'work').map((e) => [e.id, e.title])].map(
    ([id, title]) => [id, { label: { tr: title, en: title }, query: title }]
  )
);

export const topicCatalog: Record<string, Topic> = { ...staticTopics, ...entityTopics };

/** Bir öneri anahtarını düğmeye çevirir; tanınmıyorsa null */
export function suggestionFor(key: string, lang: Language): { id: string; label: string; query: string } | null {
  if (key.includes(':')) {
    const s = entitySuggestion(key, lang);
    return s ? { id: key, ...s } : null;
  }
  const topic = topicCatalog[key];
  return topic ? { id: key, label: topic.label[lang], query: topic.query } : null;
}

/** Ziyaretçinin geliş amacına göre ilk öneri seti */
export type VisitorPath = 'hiring' | 'technical' | 'browsing';

export const pathTopics: Record<VisitorPath, string[]> = {
  hiring: ['deneyim', 'neden', 'musaitlik', 'cv', 'iletisim'],
  technical: [...projects.map((p) => p.id), 'nollm', 'yetenekler'],
  browsing: ['hakkinda', 'biyoloji', 'projeler', 'hobi', 'motivasyon'],
};

// ─── Hızlı yanıtlar (kullanıcının yazdığı metinler) ─────────
export interface QuickReplyOption {
  id: string;
  label: Record<Language, string>;
  title: string;
  response: Record<Language, string>;
  autoScrollDelay?: number;
  sectionId?: SectionId;
}

export const quickReplies: QuickReplyOption[] = [
  {
    id: '1',
    sectionId: 'hakkimda',
    label: { tr: 'Hakkımda', en: 'About Me' },
    title: '1',
    response: {
      tr: `Adım Onur, işim ise karmaşık sorunları basit kodlarla çözmek. Her gün bir önceki versiyonuma güncelleme atan bir geliştiriciyim diyebiliriz.\n\nDaha detaylı bilgi için ilgili kısma yönlendiriyorum!`,
      en: `My name is Onur, and my job is solving complex problems with simple code. You could say I'm a developer who pushes updates to the previous version of myself every day.\n\nScrolling you to the relevant section for more details!`,
    },
    autoScrollDelay: 2000,
  },
  {
    id: '2',
    sectionId: 'hakkimda',
    label: { tr: 'Yetenekler', en: 'Skills' },
    title: '2',
    response: {
      tr: `Neler yapabildiğimi merak ediyorsan, seni şöyle bir aşağıya doğru alalım.\n\nSayfayı senin için kaydırıyorum.😉`,
      en: `Curious about what I can do? Let me take you down to see.\n\nScrolling the page for you.😉`,
    },
    autoScrollDelay: 2000,
  },
  {
    id: '3',
    sectionId: 'deneyimler',
    label: { tr: 'Deneyimler', en: 'Experience' },
    title: '3',
    response: {
      tr: `Burada sadece CV yok kanki; yarısı başarı, yarısı 'bu kod niye çalışmıyor' diye dökülen saçlarım!\n\nBiyolojiden yazılıma nasıl evrildiğimi görmek için aşağı süzülüyoruz, sıkı tutun.😜`,
      en: `This isn't just a CV — half of it is success, and the other half is pulling my hair out asking 'why doesn't this code work?!'\n\nLet's scroll down to see how I evolved from biology to software. Hold tight!😜`,
    },
    autoScrollDelay: 2000,
  },
  {
    id: '4',
    sectionId: 'projeler',
    label: { tr: 'Projeler', en: 'Projects' },
    title: '4',
    response: {
      tr: `Zamanımın ve enerjimin büyük bir kısmını, fikirleri çalışan sistemlere dönüştürmek için harcıyorum. Aşağıda, sadece kod satırlarını değil, üzerine kafa yorduğum çözümleri göreceksin.\n\nHadi, üretim sürecimin sonuçlarına birlikte bakalım.🧐`,
      en: `I spend most of my time and energy turning ideas into working systems. Below, you'll see not just code, but solutions I've carefully thought through.\n\nLet's take a look at the results together.🧐`,
    },
    autoScrollDelay: 2000,
  },
  {
    id: '5',
    sectionId: 'iletisim',
    label: { tr: 'İletişim', en: 'Contact' },
    title: '5',
    response: {
      tr: `Kapımız her zaman açık! Yeni fikirler veya sadece bir selam için bana ulaşmaktan sakın çekinme; ben bir mesaj uzağındayım, bekliyorum. ✌️:\n\nİlgili kısma hemen gönderiyorum...`,
      en: `My door is always open! Don't hesitate to reach out for new ideas or just to say hi — I'm just a message away. ✌️\n\nScrolling you to the contact section...`,
    },
    autoScrollDelay: 2000,
  },
];

export function getQuickReplyById(id: string): QuickReplyOption | undefined {
  return quickReplies.find((qr) => qr.id === id);
}

// ─── Veriden metin üreten yardımcılar ────────────────────────

const work = experiences.filter((e) => e.type === 'work');
const latestWork = work[work.length - 1];
const projectNames = projects.map((p) => p.title);

function listNames(lang: Language, names: string[]): string {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} ${L(lang, 've', 'and')} ${names[names.length - 1]}`;
}

/** "Yeni fırsatlara açık" → cümle içinde küçük harfle */
function status(lang: Language): string {
  const value = t(lang, 'hero.status');
  const first = lang === 'tr' ? value.charAt(0).toLocaleLowerCase('tr') : value.charAt(0).toLowerCase();
  return first + value.slice(1);
}

function listProjects(lang: Language): string {
  return projects
    .map((p) => {
      const headline = p.headline ? t(lang, `projects.${p.id}.headline`) : '';
      return `• ${p.title}${headline ? `: ${headline}` : ''}`;
    })
    .join('\n');
}

function listExperiences(lang: Language, type: 'work' | 'education'): string {
  // En yeni üstte
  return [...experiences]
    .filter((e) => e.type === type)
    .reverse()
    .map((e) => `• ${e.title} · ${t(lang, `experience.${e.id}.subtitle`)} (${t(lang, e.periodKey)})`)
    .join('\n');
}

function listTech(lang: Language): string {
  return skillCategories.map((c) => `${t(lang, c.titleKey)}\n  ${c.skills.join(' · ')}`).join('\n\n');
}

function principles(lang: Language): string {
  return aboutPrinciples.map((p) => `• "${t(lang, p.quoteKey)}"`).join('\n');
}

function socials(lang: Language): string {
  return [
    `📧 ${L(lang, 'E-posta', 'Email')}: ${socialLinks.email}`,
    `💻 GitHub: ${socialLinks.github}`,
    `💼 LinkedIn: ${socialLinks.linkedin}`,
    `📝 Medium: ${socialLinks.medium}`,
  ].join('\n');
}

// ─── Genel niyetlerin cevapları ──────────────────────────────

export const generalAnswers: Record<string, (lang: Language) => Answer> = {
  greet: (lang) => ({
    text: L(
      lang,
      "Selam! Onur'un portfolyosuna hoş geldin. Projelerinden deneyimlerine, iletişimden müsaitliğine kadar sorabilirsin. Ne merak ediyorsun?",
      "Hello! Welcome to Onur's portfolio. Ask about his projects, experience, contact details or availability. What are you curious about?"
    ),
    suggests: ['hakkinda', 'projeler', 'deneyim', 'iletisim'],
  }),

  howareyou: (lang) => ({
    text: L(
      lang,
      'Gayet iyiyim, sorduğun için sağ ol! Bot olsam da moralim hep yerinde; çalışma maliyetim de sıfıra yakın. Sana nasıl yardımcı olabilirim?',
      "Doing great, thanks for asking! I'm a bot, but my morale is always high, and my running costs are close to zero. How can I help?"
    ),
    suggests: ['hakkinda', 'projeler', 'nollm'],
  }),

  identity: (lang) => ({
    text: L(
      lang,
      "Ben Onur'un portfolyo botuyum. İçimde LLM yok, bilerek: sana Onur hakkında bildiklerimi anında ve hiç uydurmadan anlatmak için kurallarla çalışıyorum. Sor bakalım!",
      "I'm Onur's portfolio bot. There's no LLM inside me, on purpose: I run on rules so I can tell you what I know about Onur instantly and without making anything up. Go ahead and ask!"
    ),
    suggests: ['nollm', 'hakkinda', 'projeler'],
  }),

  whynollm: (lang) => ({
    text: L(
      lang,
      `Bilerek LLM yok. Bu sitede sorulabilecek soruların cevabı belli: projeler, deneyimler, iletişim. Kural tabanlı bir eşleştirici bunları anında, ücretsiz ve hiç uydurmadan cevaplıyor; bir model aynı işi her soruda token ödeyerek ve arada bir yanlış bilgiyle yapardı.\n\nOnur'un yaklaşımı bu: her probleme model atmak yerine önce maliyetine ve riskine bakmak. Model gereken yerde kullanıyor; WeatherApp'te yerel bir model, yedi doğrulama kapısının arkasında çalışıyor.`,
      `No LLM, on purpose. The questions this site gets have known answers: projects, experience, contact. A rule-based matcher answers them instantly, for free and without ever making things up; a model would do the same job paying for tokens on every question, and get it wrong now and then.\n\nThat's Onur's approach: look at the cost and the risk before throwing a model at a problem. He uses one where it earns its place; in WeatherApp a local model runs behind seven validation gates.`
    ),
    suggests: ['weatherapp', 'ai', 'projeler'],
  }),

  help: (lang) => ({
    text: L(
      lang,
      `Onur hakkında şunları sorabilirsin: projeleri (${listNames(lang, projectNames)}), deneyimleri, yetenekleri, eğitimi, müsaitliği ve iletişim bilgileri. Bir projenin linkini, teknolojilerini ya da sonucunu da sorabilirsin; "WeatherApp'in linki" gibi.`,
      `You can ask about Onur's projects (${listNames(lang, projectNames)}), experience, skills, education, availability and contact details. You can also ask for a project's link, tech or results, like "WeatherApp's link".`
    ),
    suggests: ['projeler', 'deneyim', 'musaitlik', 'iletisim'],
  }),

  about: (lang) => ({
    text: `${t(lang, 'about.bioShort')}\n\n${L(lang, 'Başka merak ettiğin bir şey var mı?', 'Anything else you would like to know?')}`,
    sectionId: 'hakkimda',
    suggests: ['biyoloji', 'projeler', 'yetenekler'],
  }),

  profession: (lang) => ({
    text: L(
      lang,
      `Onur bir AI Engineer & Mobile Developer. React Native ile mobil uygulamalar geliştiriyor; LLM, STT ve TTS modellerini ölçerek seçip ürüne taşıyor. Son olarak ${latestWork.title}'da ${t(lang, `experience.${latestWork.id}.subtitle`)} olarak çalıştı; şu an ${status(lang)}.`,
      `Onur is an AI Engineer & Mobile Developer. He builds mobile apps with React Native and takes LLM, STT and TTS models to production after measuring which one fits. Most recently he was ${t(lang, `experience.${latestWork.id}.subtitle`)} at ${latestWork.title}; right now he's ${status(lang)}.`
    ),
    sectionId: 'hakkimda',
    suggests: [latestWork.id, 'musaitlik', 'deneyim'],
  }),

  education: (lang) => ({
    text: L(
      lang,
      `Onur'un eğitimi:\n\n${listExperiences(lang, 'education')}\n\nBiyolojiden yazılıma geçiş ona farklı bir bakış açısı kazandırmış.`,
      `Onur's education:\n\n${listExperiences(lang, 'education')}\n\nMoving from biology to software gave him a different angle on problems.`
    ),
    sectionId: 'deneyimler',
    suggests: ['biyoloji', 'deneyim', 'yetenekler'],
  }),

  biology: (lang) => ({
    text: L(
      lang,
      'Onur Ege Üniversitesi Biyoloji bölümünden 3.05/4 ortalamayla mezun oldu; laboratuvarda değil, kodun içinde buldu kendini. Biyolojiden kalan alışkanlık: problemi tek tek parçalar olarak değil, birbirine bağlı bir sistem olarak görmek. Sitenin girişindeki mikroskop da oradan geliyor.',
      'Onur graduated in Biology from Ege University with a 3.05/4 GPA, and found himself in code rather than in the lab. The habit biology left him: seeing a problem as a connected system rather than a list of parts. The microscope at the top of this site comes from there.'
    ),
    sectionId: 'deneyimler',
    suggests: ['egitim', 'calisma', 'motivasyon'],
  }),

  location: (lang) => ({
    text: L(
      lang,
      `${t(lang, 'hero.location')}. Onur İzmir'de yaşıyor ve uzaktan çalışmaya alışık: Appisode'da Londra merkezli bir ekiple tamamen remote çalıştı.`,
      `${t(lang, 'hero.location')}. Onur lives in İzmir and is used to working remotely: at Appisode he worked fully remote with a London-based team.`
    ),
    suggests: ['musaitlik', 'iletisim'],
  }),

  hobby: (lang) => ({
    text: L(
      lang,
      'Hakkımda bölümündeki çizgi şeridi bunun özeti: laboratuvar, klavye, kahve molası, motosiklet ve oyun. Kod yazmadığı zamanlarda büyük ihtimalle motosikletin üstünde ya da bir oyunun başında; kahve ise her sahnede sabit.',
      "The line-art strip in the About section sums it up: lab bench, keyboard, coffee break, motorbike and games. When he isn't coding he's probably on the motorbike or in a game; the coffee is in every scene."
    ),
    sectionId: 'hakkimda',
    suggests: ['motivasyon', 'hakkinda', 'projeler'],
  }),

  philosophy: (lang) => ({
    text: L(lang, `Onur'un üç ilkesi:\n\n${principles(lang)}`, `Onur's three principles:\n\n${principles(lang)}`),
    sectionId: 'hakkimda',
    suggests: ['calisma', 'biyoloji', 'nollm'],
  }),

  workstyle: (lang) => ({
    text: L(
      lang,
      `Kısaca: önce ölçer, sonra karar verir. Envagro'da onlarca STT, TTS ve LLM modelini aynı koşullarda karşılaştırıp seçimi ölçülebilir bir karara dönüştürdü; WeatherApp'te de modelin hiçbir sayıyı hesaplamasına izin vermeyip hesabı test edilmiş koda bıraktı.\n\nİlkeleri:\n${principles(lang)}`,
      `In short: measure first, decide after. At Envagro he compared dozens of STT, TTS and LLM models under identical conditions and turned model choice into a measurable decision; in WeatherApp the model is never allowed to compute a number, the maths stays in tested code.\n\nHis principles:\n${principles(lang)}`
    ),
    suggests: ['zorluk', 'nollm', 'envagro'],
  }),

  skills: (lang) => ({
    text: L(lang, `Onur'un araç kutusu:\n\n${listTech(lang)}`, `Onur's toolbox:\n\n${listTech(lang)}`),
    sectionId: 'yetenekler',
    suggests: ['ai', 'mobil', 'projeler'],
  }),

  ai: (lang) => ({
    text: L(
      lang,
      'AI tarafında üç somut iş var:\n\n• Envagro: STT, TTS ve LLM modellerini aynı koşullarda benchmark edip seçilenleri ürüne taşıdı.\n• Unimall: ilan metni üreten bir AI agent, OCR destekli veri girişi ve agentic bir destek botu kurdu.\n• WeatherApp: yerel bir modeli yedi doğrulama kapısının arkasında çalıştırıyor; kullanıcıya ulaşan hatalı yanıt sıfır.',
      'Three concrete pieces of AI work:\n\n• Envagro: benchmarked STT, TTS and LLM models under identical conditions and shipped the chosen ones.\n• Unimall: built an AI agent that writes listings, OCR-backed data entry and an agentic support bot.\n• WeatherApp: runs a local model behind seven validation gates; zero wrong answers reach the user.'
    ),
    sectionId: 'deneyimler',
    suggests: ['unimall', 'envagro', 'weatherapp'],
  }),

  mobile: (lang) => ({
    text: L(
      lang,
      'Mobil geliştirme Onur\'un çıkış noktası! Appisode\'da Londra merkezli bir ekiple React Native (Expo) üzerinde çalıştı; WeatherApp\'in mobil uygulamasında da Skia ve Reanimated ile akıcı bir arayüz kurdu. "Çalışıyor" ile "kullanılabilir" arasındaki farkı önemsiyor.',
      'Mobile development is where Onur started! At Appisode he worked on React Native (Expo) with a London-based team, and WeatherApp\'s mobile app uses Skia and Reanimated for a smooth interface. He cares about the gap between "it works" and "it\'s usable".'
    ),
    sectionId: 'projeler',
    suggests: ['weatherapp', 'appisode', 'yetenekler'],
  }),

  projects: (lang) => ({
    text: L(
      lang,
      `Onur'un projeleri:\n\n${listProjects(lang)}\n\nBirinin adını yazarsan detayına gireyim; linkini, teknolojilerini ya da sonucunu da sorabilirsin.`,
      `Onur's projects:\n\n${listProjects(lang)}\n\nType one's name and I'll go into detail; you can also ask for its link, tech or results.`
    ),
    sectionId: 'projeler',
    suggests: projects.map((p) => p.id),
  }),

  experience: (lang) => ({
    text: L(
      lang,
      `Onur'un iş deneyimi (en yenisi üstte):\n\n${listExperiences(lang, 'work')}\n\nBirinin adını yazarsan detayına gireyim.`,
      `Onur's work experience (latest first):\n\n${listExperiences(lang, 'work')}\n\nType one's name and I'll go into detail.`
    ),
    sectionId: 'deneyimler',
    suggests: [...[...work].reverse().map((e) => e.id).slice(0, 2), 'egitim'],
  }),

  contact: (lang) => ({
    text: L(lang, `Onur'a ulaşabileceğin kanallar:\n\n${socials(lang)}\n\nHer zaman bir mesaj uzağında!`, `Here's how to reach Onur:\n\n${socials(lang)}\n\nAlways just a message away!`),
    sectionId: 'iletisim',
    suggests: ['musaitlik', 'cv', 'projeler'],
  }),

  // Belirli bir proje söylenmeden "github linkin?" sorulunca
  socials: (lang) => ({
    text: L(
      lang,
      `GitHub: ${socialLinks.github}\nLinkedIn: ${socialLinks.linkedin}\n\nBelirli bir projenin kodunu arıyorsan adını yaz: ${listNames(lang, projectNames)}.`,
      `GitHub: ${socialLinks.github}\nLinkedIn: ${socialLinks.linkedin}\n\nLooking for a specific project's code? Type its name: ${listNames(lang, projectNames)}.`
    ),
    sectionId: 'iletisim',
    suggests: projects.map((p) => `${p.id}:link`).slice(0, 3),
  }),

  cv: (lang) => ({
    text: L(
      lang,
      'CV hazır: ilk ekrandaki "CV İndir" düğmesinden ya da iletişim bölümündeki klasörden indirebilirsin. Klasörde siteden çıkmadan önizleme de var.',
      'The resume is ready: download it from the "Download CV" button on the first screen, or from the folder in the contact section, which also has a preview.'
    ),
    sectionId: 'iletisim',
    suggests: ['deneyim', 'musaitlik', 'iletisim'],
  }),

  availability: (lang) => ({
    text: L(
      lang,
      `Kısaca: ${status(lang)} · ${t(lang, 'hero.location')}.\n\nUzaktan çalışma ona tanıdık; Appisode'da Londra merkezli bir ekiple tamamen remote çalıştı. Rol, başlangıç ve ücret gibi detaylar için en hızlı yol: ${socialLinks.email}`,
      `In short: ${status(lang)} · ${t(lang, 'hero.location')}.\n\nRemote work is familiar ground; at Appisode he worked fully remote with a London-based team. For role, start date and salary, the quickest route is: ${socialLinks.email}`
    ),
    sectionId: 'iletisim',
    suggests: ['cv', 'iletisim', 'neden'],
  }),

  hire: (lang) => ({
    text: L(
      lang,
      'Üç şey öne çıkıyor:\n\n• Sistem düşünüyor. Biyolojiden geldiği için problemi parçalar listesi değil, birbirine bağlı bir bütün olarak ele alıyor.\n• Ölçüyor, tahmin etmiyor. Envagro\'da model seçimini sezgiden çıkarıp benchmark\'a bağladı.\n• Ürün tarafını biliyor. Mobil geçmişi sayesinde "çalışıyor" ile "kullanılabilir" arasındaki farkı önemsiyor.\n\nSomut karşılığı: Unimall\'da 22 milyondan fazla ürün kaydı olan bir operasyonu otomatikleştirdi; yalnızca OCR entegrasyonu operasyonel maliyette %40 tasarruf sağladı.',
      'Three things stand out:\n\n• He thinks in systems. Coming from biology, he treats a problem as a connected whole rather than a list of parts.\n• He measures instead of guessing. At Envagro he moved model choice from intuition to benchmarks.\n• He knows the product side. His mobile background makes him care about the gap between "it works" and "it\'s usable".\n\nConcretely: at Unimall he automated an operation with over 22 million product records; the OCR integration alone cut operational cost by 40%.'
    ),
    sectionId: 'deneyimler',
    suggests: ['unimall', 'cv', 'iletisim'],
  }),

  hardest: (lang) => ({
    text: L(
      lang,
      "Unimall'daki ölçek problemi: üç ayrı satış kanalında 22 milyondan fazla ürün kaydı ve neredeyse tamamen manuel yürüyen bir süreç.\n\nZor kısım tek bir şeyi otomatikleştirmek değil, hangi katmanın önce çözüleceğine karar vermekti. Süreci üçe ayırdı: veri senkronizasyonu, içerik üretimi, müşteri iletişimi. OCR entegrasyonu tek başına operasyonel maliyette %40 tasarruf getirdi.",
      "The scale problem at Unimall: over 22 million product records across three sales channels, with almost everything done by hand.\n\nThe hard part wasn't automating one thing, it was deciding which layer to solve first. He split the process into three: data sync, content generation, customer communication. The OCR integration alone cut operational cost by 40%."
    ),
    sectionId: 'deneyimler',
    suggests: ['unimall:approach', 'ai', 'calisma'],
  }),

  thanks: (lang) => ({
    text: L(lang, 'Rica ederim! Başka merak ettiğin bir şey olursa buradayım.', "You're welcome! I'm here if you have more questions."),
    suggests: ['projeler', 'iletisim'],
  }),

  bye: (lang) => ({
    text: L(lang, 'Görüşmek üzere! Umarım faydalı olmuşumdur; kapı her zaman açık.', 'See you! I hope I helped; the door is always open.'),
    suggests: ['iletisim', 'cv'],
  }),

  info: (lang) => ({
    text: L(lang, 'Tabii! Hangi konu ilgini çekiyor?', 'Sure! Which topic interests you?'),
    suggests: ['hakkinda', 'projeler', 'deneyim', 'yetenekler'],
  }),
};

/** Anlaşılamayan mesaj: tahmin varsa "şunu mu demek istedin", yoksa başlangıç konuları */
export function fallbackAnswer(lang: Language, guesses: string[]): Answer {
  if (guesses.length > 0) {
    return {
      text: L(lang, 'Tam olarak anlayamadım. Bunlardan birini mi kastettin?', "I couldn't quite place that. Did you mean one of these?"),
      suggests: guesses,
    };
  }
  return {
    text: L(
      lang,
      'Hmm, bunu bilmiyorum; uydurmak yerine söyleyeyim. Şunları sorabilirsin:',
      "Hmm, I don't know that one, and I'd rather say so than make something up. You can ask about:"
    ),
    suggests: ['hakkinda', 'projeler', 'deneyim', 'iletisim'],
  };
}
