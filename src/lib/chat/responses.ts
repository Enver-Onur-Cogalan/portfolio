import { projects, skillCategories, experiences, socialLinks } from '@/data/portfolio';
import { translate, type Language } from '@/i18n/translations';

/** Sayfadaki bölüm kimlikleri — bot yanıtı hangi bölüme kaydıracağını söyler. */
export type SectionId = 'hakkimda' | 'yetenekler' | 'projeler' | 'deneyimler' | 'iletisim';

export interface ResponseItem {
  /** Bağlam takibi için konu etiketi */
  topic?: string;
  keywords: string[];
  response: Record<Language, string>;
  showOptions?: boolean;
  autoScrollDelay?: number;
  sectionId?: SectionId;
  /** Bu yanıttan sonra önerilecek konular (topicCatalog anahtarları) */
  suggests?: string[];
}

// ─── Konu Kataloğu ───────────────────────────────────────────
// Öneri düğmeleri ve ziyaretçi yolları buradan beslenir. `query`,
// düğmeye basıldığında bota gönderilen metindir; eşleştirici hem
// Türkçe hem İngilizce anahtar kelimeleri tanıdığı için tek değer yeterli.
export interface Topic {
  label: Record<Language, string>;
  query: string;
}

export const topicCatalog: Record<string, Topic> = {
  hakkinda: { label: { tr: 'Hakkında', en: 'About' }, query: 'kendini tanıt' },
  projeler: { label: { tr: 'Projeler', en: 'Projects' }, query: 'projeler' },
  yetenekler: { label: { tr: 'Yetenekler', en: 'Skills' }, query: 'yetenekler' },
  deneyim: { label: { tr: 'Deneyimler', en: 'Experience' }, query: 'deneyim' },
  egitim: { label: { tr: 'Eğitim', en: 'Education' }, query: 'eğitim' },
  iletisim: { label: { tr: 'İletişim', en: 'Contact' }, query: 'iletişim' },
  ai: { label: { tr: 'AI tarafı', en: 'AI work' }, query: 'yapay zeka' },
  mobil: { label: { tr: 'Mobil tarafı', en: 'Mobile work' }, query: 'react native' },
  jarvis: { label: { tr: 'Jarvis', en: 'Jarvis' }, query: 'jarvis' },
  unimall: { label: { tr: 'Unimall vakası', en: 'Unimall case' }, query: 'unimall' },
  biyoloji: { label: { tr: 'Biyolojiden yazılıma', en: 'Biology to software' }, query: 'biyoloji' },
  konum: { label: { tr: 'Nerede yaşıyor?', en: 'Where is he?' }, query: 'nerede' },
  hobi: { label: { tr: 'Boş zamanları', en: 'Free time' }, query: 'hobi' },
  motivasyon: { label: { tr: 'Felsefesi', en: 'Philosophy' }, query: 'felsefe' },
  musaitlik: { label: { tr: 'Müsaitlik', en: 'Availability' }, query: 'müsait mi' },
  neden: { label: { tr: 'Neden Onur?', en: 'Why Onur?' }, query: 'neden seni işe alayım' },
  zorluk: { label: { tr: 'En zor problem', en: 'Hardest problem' }, query: 'en zor problem' },
  calisma: { label: { tr: 'Nasıl çalışır?', en: 'How he works' }, query: 'nasıl çalışıyor' },
  cv: { label: { tr: 'CV', en: 'Resume' }, query: 'cv' },
};

/** Ziyaretçinin geliş amacına göre ilk öneri seti */
export type VisitorPath = 'hiring' | 'technical' | 'browsing';

export const pathTopics: Record<VisitorPath, string[]> = {
  hiring: ['deneyim', 'neden', 'musaitlik', 'cv', 'iletisim'],
  technical: ['unimall', 'ai', 'projeler', 'yetenekler', 'zorluk'],
  browsing: ['hakkinda', 'biyoloji', 'projeler', 'hobi', 'motivasyon'],
};

export interface QuickReplyOption {
  id: string;
  label: Record<Language, string>;
  title: string;
  response: Record<Language, string>;
  autoScrollDelay?: number;
  sectionId?: SectionId;
}

// ─── Veriden metin üreten yardımcılar ────────────────────────
// Bu listeler eskiden İngilizce için elle yazılıydı; yeni bir proje veya
// deneyim eklendiğinde bot bunları görmüyordu. Artık tek kaynak veri +
// çeviri sözlüğü.

function listProjects(lang: Language): string {
  return projects
    .map((p) => `• ${p.title}: ${translate(lang, `projects.${p.id}.desc`)}`)
    .join('\n\n');
}

function listExperiences(lang: Language, type: 'work' | 'education'): string {
  return experiences
    .filter((e) => e.type === type)
    .map((e) => {
      const period = translate(lang, e.periodKey);
      const desc = translate(lang, `experience.${e.id}.desc`);
      return `• ${e.title} (${period})\n  ${desc}`;
    })
    .join('\n\n');
}

function listTech(lang: Language): string {
  return skillCategories
    .map((c) => `${translate(lang, c.titleKey)}\n  ${c.skills.join(' · ')}`)
    .join('\n\n');
}

/** Vaka çalışması olan bir deneyimi başlık + metrik + sonuç olarak anlatır. */
function describeCaseStudy(lang: Language, id: string): string {
  const exp = experiences.find((e) => e.id === id);
  if (!exp) return '';

  const parts = [
    `${exp.title} — ${translate(lang, `experience.${id}.headline`)}`,
    `${translate(lang, `experience.${id}.subtitle`)} · ${translate(lang, exp.periodKey)}`,
    '',
    translate(lang, `experience.${id}.desc`),
  ];

  if (exp.metrics?.length) {
    parts.push(
      '',
      exp.metrics
        .map((m) => `• ${m.value} — ${translate(lang, `experience.${id}.metric.${m.key}`)}`)
        .join('\n')
    );
  }

  if (exp.tech?.length) {
    parts.push('', `${lang === 'tr' ? 'Kullanılan teknolojiler' : 'Tech used'}: ${exp.tech.join(', ')}`);
  }

  return parts.join('\n');
}

// ─── Quick Replies (kullanıcının yazdığı yanıtlara dokunulmadı, EN eklendi) ───
const quickReplies: QuickReplyOption[] = [
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

// ─── Bio ─────────────────────────────────────────────────────
// Bölümdeki tam metin beş paragraf; sohbet balonunda okunması zor
// olduğu için bot kısa sürümü kullanıyor.
const bio = (lang: Language) => translate(lang, 'about.bioShort');

// ─── Direct Responses ────────────────────────────────────────
export const directResponses: ResponseItem[] = [
  // Selamlaşma
  {
    topic: 'selamlama',
    keywords: ['merhaba', 'selam', 'hi', 'hey', 'selamün aleyküm', 'good morning', 'good afternoon', 'good evening', 'günaydın', 'iyi geceler', 'sa', 'slm', 'hello'],
    response: {
      tr: 'Selam! Onur\'un portfolyosuna hoş geldin. Burada onun hakkında her şeyi öğrenebilirsin — projelerinden yeteneklerine, deneyimlerinden iletişim bilgilerine kadar. Ne merak ediyorsun?',
      en: 'Hello! Welcome to Onur\'s portfolio. You can learn everything about him here — from projects to skills, experience to contact info. What are you curious about?',
    },
    showOptions: true,
    suggests: ['hakkinda', 'projeler', 'deneyim', 'iletisim'],
  },
  {
    topic: 'selamlama',
    keywords: ['nasılsın', 'nasıl', 'iyi misin', 'ne haber', 'naber', 'nbr', 'nasilsin', 'how are you'],
    response: {
      tr: 'Gayet iyiyim, sorduğun için sağ ol! Ben bir bot olsam da moralim her zaman yerinde. Sana nasıl yardımcı olabilirim?',
      en: 'I\'m doing great, thanks for asking! Even though I\'m a bot, my morale is always high. How can I help you?',
    },
    suggests: ['hakkinda', 'projeler', 'deneyim', 'iletisim'],
  },
  // Kimlik
  {
    topic: 'hakkinda',
    sectionId: 'hakkimda',
    keywords: ['kimsin', 'sen kim', 'kimdir', 'hakkında', 'who are you', 'tell me about yourself', 'tanışalım', 'kendini tanıt'],
    response: {
      tr: `${bio('tr')}\n\nKısacası: Karmaşıklığı sadeleştirmeyi seven, AI ve mobil teknolojileri birleştirerek anlamlı ürünler ortaya koyan bir geliştirici. Başka merak ettiğin bir şey var mı?`,
      en: `${bio('en')}\n\nIn short: A developer who loves simplifying complexity and creating meaningful products by combining AI and mobile technologies. Anything else you'd like to know?`,
    },
    suggests: ['biyoloji', 'projeler', 'yetenekler'],
  },
  {
    topic: 'meslek',
    sectionId: 'hakkimda',
    keywords: ['ne yapıyorsun', 'ne iş yapıyorsun', 'mesleğin', 'profession', 'occupation', 'job', 'ne is', 'neyle uğraşıyorsun', 'what do you do'],
    response: {
      tr: 'Onur şu anda AI Engineer & Mobile Developer olarak çalışıyor. React Native ile mobil uygulamalar geliştirirken, LLM, STT ve TTS modellerini üretime taşıyan sistemler kuruyor. İki dünyayı birleştiren bir profil diyebiliriz!',
      en: 'Onur currently works as an AI Engineer & Mobile Developer. He builds mobile apps with React Native while shipping systems that bring LLM, STT and TTS models into production. A profile that bridges two worlds!',
    },
    suggests: ['unimall', 'ai', 'deneyim'],
  },
  {
    topic: 'kimlik',
    keywords: ['adın', 'ismin', 'ismin ne', 'senin adın', 'what is your name', 'bot musun', 'your name'],
    response: {
      tr: 'Ben Onur\'un portfolyo chatbotuyum! LLM falan yok bende, ama Onur hakkında bildiklerimi seninle paylaşmaktan mutluluk duyarım. Sor bakalım!',
      en: 'I\'m Onur\'s portfolio chatbot! No LLM here, but I\'m happy to share what I know about Onur. Go ahead and ask!',
    },
    suggests: ['hakkinda', 'projeler', 'yardim'],
  },
  // Bilgi isteme
  {
    topic: 'bilgi',
    keywords: ['bilgi', 'ver', 'bana bilgi', 'söyle', 'daha fazla', 'detay', 'detaylı bilgi', 'anlat', 'anlatır mısın', 'more info', 'tell me more'],
    response: {
      tr: 'Tabii ki! Hangi konu ilgini çekiyor? Aşağıdakilerden birini seç, seni hemen bilgilendirelim.',
      en: 'Of course! What topic interests you? Pick one below and I\'ll fill you in right away.',
    },
    showOptions: true,
    suggests: ['hakkinda', 'projeler', 'deneyim', 'yetenekler'],
  },
  {
    topic: 'hakkinda',
    sectionId: 'hakkimda',
    keywords: ['hakkımda bilgi', 'about me', 'kendinden bahset', 'biraz anlat'],
    response: {
      tr: `${bio('tr')}\n\nDaha fazla detay ister misin? Yetenekleri, projeleri veya deneyimleri sorabilirsin!`,
      en: `${bio('en')}\n\nWant more details? You can ask about skills, projects, or experience!`,
    },
    showOptions: true,
  },
  // İletişim
  {
    topic: 'iletisim',
    sectionId: 'iletisim',
    keywords: ['iletişim', 'contact', 'email', 'mail', 'telefon', 'telefon numarası', 'ulaş', 'ulas', 'iletisim', 'nasıl ulaşırım', 'bağlantı', 'reach'],
    response: {
      tr: `Onur'a ulaşabileceğin kanallar:\n\n📧 E-posta: ${socialLinks.email}\n💻 GitHub: ${socialLinks.github}\n💼 LinkedIn: ${socialLinks.linkedin}\n📝 Medium: ${socialLinks.medium}\n\nHer zaman bir mesaj uzağında!`,
      en: `Here's how you can reach Onur:\n\n📧 Email: ${socialLinks.email}\n💻 GitHub: ${socialLinks.github}\n💼 LinkedIn: ${socialLinks.linkedin}\n📝 Medium: ${socialLinks.medium}\n\nAlways just a message away!`,
    },
    suggests: ['musaitlik', 'cv', 'projeler'],
  },
  // Projeler
  {
    topic: 'projeler',
    sectionId: 'projeler',
    keywords: ['proje', 'projelerin', 'çalışmaların', 'yaptığın iş', 'projects', 'portfolio', 'neler yaptın', 'github'],
    response: {
      tr: `İşte Onur'un öne çıkan projeleri:\n\n${listProjects('tr')}\n\nDaha fazlası için GitHub: ${socialLinks.github}`,
      en: `Here are Onur's featured projects:\n\n${listProjects('en')}\n\nMore on GitHub: ${socialLinks.github}`,
    },
    suggests: ['unimall', 'jarvis', 'yetenekler'],
  },
  // Yetenekler
  {
    topic: 'yetenekler',
    sectionId: 'yetenekler',
    keywords: ['yetenek', 'yeteneklerin', 'teknoloji', 'teknolojilerin', 'stack', 'skills', 'bilgin', 'tech stack', 'ne biliyorsun'],
    response: {
      tr: `Onur'un teknoloji araç kutusu:\n\n${listTech('tr')}\n\nAI mühendisliği ve mobil geliştirmeyi birleştiren bir profil. Öğrenme hızı da cabası!`,
      en: `Onur's tech toolbox:\n\n${listTech('en')}\n\nA profile that combines AI engineering with mobile development. Fast learner too!`,
    },
    suggests: ['ai', 'mobil', 'projeler'],
  },
  // Deneyim
  {
    topic: 'deneyim',
    sectionId: 'deneyimler',
    keywords: ['deneyim', 'deneyimlerin', 'iş', 'career', 'work', 'iş deneyimi', 'tecrübe', 'çalıştığın yerler', 'experience'],
    response: {
      tr: `Onur'un kariyer yolculuğu:\n\n${listExperiences('tr', 'work')}\n\nHer adımda yeni şeyler öğrenerek büyümeye devam ediyor!`,
      en: `Onur's career journey:\n\n${listExperiences('en', 'work')}\n\nContinuously growing and learning at every step!`,
    },
    suggests: ['unimall', 'neden', 'egitim'],
  },
  // Eğitim
  {
    topic: 'egitim',
    sectionId: 'deneyimler',
    keywords: ['eğitim', 'egitim', 'okul', 'üniversite', 'education', 'school', 'university', 'bootcamp', 'patika', 'mezun'],
    response: {
      tr: `Onur'un eğitim serüveni:\n\n${listExperiences('tr', 'education')}\n\nBiyolojiden yazılıma geçiş, ona farklı bir bakış açısı ve analitik düşünme becerisi kazandırmış.`,
      en: `Onur's education journey:\n\n${listExperiences('en', 'education')}\n\nThe transition from biology to software gave him a unique analytical perspective.`,
    },
    suggests: ['biyoloji', 'deneyim', 'yetenekler'],
  },
  // Konum
  {
    topic: 'konum',
    keywords: ['nerede', 'nerelisin', 'lokasyon', 'location', 'city', 'şehir', 'ülke', 'istanbul', 'türkiye', 'turkey', 'where are you', 'nereden', 'where'],
    response: {
      tr: 'Onur Türkiye\'den çalışıyor ve remote olarak dünya genelinde projelere katkıda bulunuyor. Daha önce Londra merkezli bir şirketle de remote çalıştı. Fiziksel sınırlar onu durduramaz!',
      en: 'Onur works from Turkey and contributes to projects worldwide remotely. He previously worked remotely with a London-based company. Physical borders can\'t stop him!',
    },
    suggests: ['musaitlik', 'iletisim'],
  },
  // AI
  {
    topic: 'ai',
    sectionId: 'deneyimler',
    keywords: ['ai', 'yapay zeka', 'yapay', 'zeka', 'artificial intelligence', 'machine learning', 'ml', 'llm', 'stt', 'tts', 'model', 'envagro', 'benchmark', 'araştırma', 'research'],
    response: {
      tr: 'AI, Onur\'un en büyük tutkularından biri! Şu anda STT (konuşmayı metne çevirme), TTS (metni sese çevirme) ve LLM (büyük dil modelleri) üzerine derinlemesine araştırmalar yapıyor. Açık kaynak ve ticari modelleri karşılaştırıp benchmark çalışmaları yürütüyor.',
      en: 'AI is one of Onur\'s biggest passions! He\'s currently conducting deep research on STT (Speech-to-Text), TTS (Text-to-Speech), and LLM (Large Language Models). He compares open-source and commercial models and runs benchmark studies.',
    },
    suggests: ['unimall', 'zorluk', 'yetenekler'],
  },
  // Mobil
  {
    topic: 'mobil',
    sectionId: 'projeler',
    keywords: ['react native', 'mobile', 'mobil', 'uygulama', 'app', 'expo', 'react'],
    response: {
      tr: 'Mobil geliştirme Onur\'un uzmanlık alanı! Jarvis (sesli asistan), ChatApp (gerçek zamanlı sohbet) ve MovieApp gibi projelerinde React Native ve Expo kullandı. Kullanıcı dostu ve performanslı uygulamalar üretmeye bayılıyor.',
      en: 'Mobile development is Onur\'s specialty! He used React Native and Expo in projects like Jarvis (voice assistant), ChatApp (real-time chat), and MovieApp. He loves building user-friendly, high-performance apps.',
    },
    suggests: ['jarvis', 'projeler', 'yetenekler'],
  },
  // Jarvis
  {
    topic: 'jarvis',
    sectionId: 'projeler',
    keywords: ['jarvis', 'asistan', 'sesli asistan', 'voice assistant'],
    response: {
      tr: `Jarvis, Onur'un en kapsamlı projelerinden biri! Sesli komutlarla mobil cihazınızla etkileşim kurmanızı sağlayan akıllı bir kişisel asistan. React Native (Expo), TypeScript, Groq (Llama 3.x), ElevenLabs API kullanılarak geliştirildi.\n\nGitHub: ${socialLinks.github}`,
      en: `Jarvis is one of Onur's most comprehensive projects! A smart personal assistant that lets you interact with your mobile device via voice commands. Built with React Native (Expo), TypeScript, Groq (Llama 3.x), and ElevenLabs API.\n\nGitHub: ${socialLinks.github}`,
    },
    suggests: ['projeler', 'mobil', 'ai'],
  },
  // Biyoloji
  {
    topic: 'biyoloji',
    sectionId: 'deneyimler',
    keywords: ['biyoloji', 'biology', 'ege üniversitesi', 'ege', 'kariyer değişikliği', 'neden yazılım'],
    response: {
      tr: 'Onur, Ege Üniversitesi Biyoloji bölümünden 3.05/4 ortalamayla mezun oldu. Biyolojideki analitik düşünme ve problem çözme becerileri, yazılım dünyasında ona büyük avantaj sağlıyor. Hücrelerin mükemmel düzenini kodlarına taşımayı hedefliyor!',
      en: 'Onur graduated from Ege University\'s Biology department with a 3.05/4 GPA. His analytical thinking and problem-solving skills from biology give him a huge advantage in software. He aims to bring the perfect order of cells into his code!',
    },
    suggests: ['egitim', 'calisma', 'motivasyon'],
  },
  // Hobi
  {
    topic: 'hobi',
    keywords: ['hobi', 'ilgi', 'boş zaman', 'hobby', 'interest', 'ne yaparsın', 'serbest zaman'],
    response: {
      tr: 'Onur boş zamanlarında da kod yazıyor dersek yanlış olmaz! Bunun dışında AI araştırmaları, Medium\'da yazı yazmak ve yeni teknolojileri keşfetmek en sevdiği aktiviteler arasında. Kahve tüketimi de sınırsız!',
      en: 'It wouldn\'t be wrong to say Onur codes in his free time too! Besides that, AI research, writing on Medium, and exploring new technologies are among his favorite activities. Coffee consumption: unlimited!',
    },
    suggests: ['motivasyon', 'hakkinda', 'projeler'],
  },
  // Motivasyon
  {
    topic: 'motivasyon',
    keywords: ['motivasyon', 'felsefe', 'prensip', 'ilke', 'motto', 'neden kod', 'niye yazılım', 'philosophy', 'motivation'],
    response: {
      tr: 'Onur\'un felsefesi üç temel üzerine kurulu:\n\n• "Karmaşıklığı sadeleştirmek bir tercih değil, bir sanat biçimidir."\n• "En iyi kod, yazılmasına gerek kalmayan koddur."\n• "Hücrelerin mükemmel düzenini, yazdığım her satıra taşımayı hedefliyorum."\n\nBiyoloji ve yazılımı birleştiren güzel bir bakış açısı!',
      en: 'Onur\'s philosophy is built on three pillars:\n\n• "Simplifying complexity is not a choice, it\'s an art form."\n• "The best code is the code that never needs to be written."\n• "I aim to bring the perfect order of cells into every line I write."\n\nA beautiful perspective combining biology and software!',
    },
    suggests: ['calisma', 'biyoloji', 'hakkinda'],
  },
  // Teşekkür
  {
    topic: 'tesekkur',
    keywords: ['teşekkür', 'tesekkur', 'thanks', 'thank you', 'sağol', 'saol', 'eyvallah', 'tşk', 'eyv'],
    response: {
      tr: 'Rica ederim, ne demek! Başka merak ettiğin bir şey olursa çekinmeden sor. Buradayım!',
      en: 'You\'re welcome! If you have any other questions, don\'t hesitate to ask. I\'m here!',
    },
    suggests: ['projeler', 'iletisim'],
  },
  // Veda
  {
    topic: 'veda',
    keywords: ['görüşürüz', 'hoşça kal', 'hoşçakal', 'bye', 'goodbye', 'see you', 'gittim', 'bb', 'güle güle'],
    response: {
      tr: 'Görüşmek üzere! Umarım faydalı olabilmişimdir. Tekrar uğramak istersen buradayım, kapı her zaman açık!',
      en: 'See you later! I hope I\'ve been helpful. Come back anytime — the door is always open!',
    },
    suggests: ['iletisim', 'projeler'],
  },
  // Unimall vaka çalışması
  {
    topic: 'unimall',
    sectionId: 'deneyimler',
    keywords: ['unimall', 'e-ticaret', 'eticaret', 'ocr', 'otomasyon', 'e-commerce', 'automation', 'agent', 'ai agent', '22 milyon'],
    response: {
      tr: `${describeCaseStudy('tr', 'unimall')}\n\nDetaylı anlatımı deneyimler bölümünde bulabilirsin!`,
      en: `${describeCaseStudy('en', 'unimall')}\n\nYou can find the full write-up in the experience section!`,
    },
    suggests: ['zorluk', 'ai', 'deneyim'],
  },
  // ─── İşe alım odaklı konular ──────────────────────────────
  {
    topic: 'musaitlik',
    sectionId: 'iletisim',
    keywords: ['müsait', 'musait', 'uygun musun', 'iş arıyor', 'is ariyor', 'açık mısın', 'çalışma şekli', 'remote', 'uzaktan', 'hibrit', 'ofis', 'availability', 'available', 'open to work', 'work setup', 'freelance', 'maaş', 'maas', 'ücret', 'ucret', 'salary', 'rate', 'beklenti'],
    response: {
      tr: `Müsaitlik ve çalışma şekli dönemsel değiştiği için en doğru cevabı Onur'un kendisi verir: ${socialLinks.email}\n\nGeçmişe bakarsan uzaktan çalışma düzeni ona tanıdık — Appisode'da Londra merkezli bir ekiple tamamen remote çalıştı.`,
      en: `Availability and working setup change over time, so the most accurate answer comes from Onur himself: ${socialLinks.email}\n\nFor context, remote work is familiar territory — at Appisode he worked fully remotely with a London-based team.`,
    },
    suggests: ['iletisim', 'deneyim', 'cv'],
  },
  {
    topic: 'neden',
    sectionId: 'deneyimler',
    keywords: ['neden seni', 'neden onur', 'neden işe', 'neden ise', 'ne katar', 'artısı', 'farkı ne', 'hire', 'why hire', 'why you', 'what makes', 'strengths', 'güçlü yön', 'işe alım', 'ise alim'],
    response: {
      tr: `Üç şey öne çıkıyor:\n\n• **Sistem düşünüyor.** Biyolojiden geldiği için problemi tek tek özellik olarak değil, birbirine bağlı bir bütün olarak ele alıyor.\n• **Ölçüyor, tahmin etmiyor.** Envagro'da model seçimini sezgiden çıkarıp benchmark'a bağladı.\n• **Ürün tarafını biliyor.** Mobil geçmişi sayesinde "çalışıyor" ile "kullanılabilir" arasındaki farkı önemsiyor.\n\nSomut karşılığı: son projesinde 22 milyon kayıtlı bir operasyonu otomatikleştirdi, operasyonel maliyet %40 düştü.`,
      en: `Three things stand out:\n\n• **He thinks in systems.** Coming from biology, he treats a problem as an interconnected whole rather than a list of features.\n• **He measures instead of guessing.** At Envagro he moved model selection from intuition to benchmarks.\n• **He knows the product side.** His mobile background means he cares about the gap between "it works" and "it's usable".\n\nConcretely: on his last project he automated an operation holding 22 million records and cut operational cost by 40%.`,
    },
    suggests: ['unimall', 'deneyim', 'iletisim'],
  },
  {
    topic: 'zorluk',
    sectionId: 'deneyimler',
    keywords: ['en zor', 'zorlandığın', 'zorlandigin', 'zor problem', 'challenge', 'hardest', 'difficult', 'toughest', 'zorluk'],
    response: {
      tr: `Unimall'daki ölçek problemi: üç ayrı satış kanalında 22 milyondan fazla ürün kaydı ve neredeyse tamamen manuel yürüyen bir süreç.\n\nZor kısım tek bir şeyi otomatikleştirmek değil, hangi katmanın önce çözüleceğine karar vermekti. Süreci üçe ayırdı: veri senkronizasyonu, içerik üretimi, müşteri iletişimi. OCR entegrasyonu tek başına operasyonel maliyette %40 tasarruf getirdi.`,
      en: `The scale problem at Unimall: over 22 million product records across three separate sales channels, with almost everything running manually.\n\nThe hard part wasn't automating one thing — it was deciding which layer to solve first. He split the process into three: data synchronization, content generation, customer communication. The OCR integration alone delivered a 40% saving in operational costs.`,
    },
    suggests: ['unimall', 'ai', 'calisma'],
  },
  {
    topic: 'calisma',
    sectionId: 'hakkimda',
    keywords: ['nasıl çalış', 'nasil calis', 'çalışma tarzı', 'calisma tarzi', 'yaklaşımı', 'yaklasimi', 'metodoloji', 'how do you work', 'work style', 'approach', 'process'],
    response: {
      tr: `Üç prensibi var:\n\n• "Karmaşıklığı sadeleştirmek bir tercih değil, bir sanat biçimidir."\n• "En iyi kod, yazılmasına gerek kalmayan koddur."\n• "Hücrelerin mükemmel düzenini, yazdığım her satıra taşımayı hedefliyorum."\n\nPratikte şuna dönüşüyor: önce ölçer, sonra karar verir. Envagro'da onlarca modeli aynı koşullarda karşılaştırıp seçimi ölçülebilir bir karara dönüştürmesi bunun örneği.`,
      en: `He works on three principles:\n\n• "Simplifying complexity is not a choice, it's an art form."\n• "The best code is the code that never needs to be written."\n• "I aim to bring the perfect order of cells into every line I write."\n\nIn practice: measure first, decide after. At Envagro he compared dozens of models under identical conditions, turning selection into a measurable decision.`,
    },
    suggests: ['zorluk', 'motivasyon', 'yetenekler'],
  },
  {
    topic: 'cv',
    sectionId: 'iletisim',
    keywords: ['cv', 'özgeçmiş', 'ozgecmis', 'resume', 'curriculum', 'pdf indir', 'download cv'],
    response: {
      tr: `CV sayfada hazır — iletişim bölümündeki klasöre tıklayınca hem indirebilir hem de siteden çıkmadan önizleyebilirsin.\n\nDaha ayrıntısı için deneyimler bölümü Unimall ve Envagro'yu problem, yaklaşım ve sonuç kırılımıyla anlatıyor.`,
      en: `The resume is right here — open the folder in the contact section to download it or preview it without leaving the site.\n\nFor more depth, the experience section breaks down Unimall and Envagro into problem, approach and result.`,
    },
    suggests: ['deneyim', 'iletisim', 'neden'],
  },
  // Yardım
  {
    topic: 'yardim',
    keywords: ['yardım', 'help', 'ne yapabilirsin', 'neler biliyorsun', 'komutlar', 'özellikler', 'nasıl kullanılır', 'what can you do'],
    response: {
      tr: 'Sana Onur hakkında birçok konuda bilgi verebilirim! Hakkında bilgi, yetenekleri, projeleri, iş deneyimleri, eğitimi, iletişim bilgileri, AI araştırmaları ve daha fazlası. Aşağıdaki seçeneklerden başlayabilirsin.',
      en: 'I can tell you about Onur on many topics! About him, skills, projects, work experience, education, contact info, AI research, and more. You can start with the options below.',
    },
    showOptions: true,
    suggests: ['neden', 'unimall', 'yetenekler', 'iletisim'],
  },
];

export function getQuickReplyById(id: string): QuickReplyOption | undefined {
  return quickReplies.find(qr => qr.id === id);
}

export { quickReplies };
