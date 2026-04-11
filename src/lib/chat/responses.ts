import { projects, techStack, experiences, socialLinks } from '@/data/portfolio';
import type { Language } from '@/context/LanguageContext';

export interface ResponseItem {
  keywords: string[];
  response: Record<Language, string>;
  showOptions?: boolean;
  autoScrollDelay?: number;
}

export interface QuickReplyOption {
  id: string;
  label: Record<Language, string>;
  title: string;
  response: Record<Language, string>;
  autoScrollDelay?: number;
}

// ─── Quick Replies (kullanıcının yazdığı yanıtlara dokunulmadı, EN eklendi) ───
const quickReplies: QuickReplyOption[] = [
  {
    id: '1',
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
    label: { tr: 'İletişim', en: 'Contact' },
    title: '5',
    response: {
      tr: `Kapımız her zaman açık! Yeni fikirler veya sadece bir selam için bana ulaşmaktan sakın çekinme; ben bir mesaj uzağındayım, bekliyorum. ✌️:\n\nİlgili kısma hemen gönderiyorum...`,
      en: `My door is always open! Don't hesitate to reach out for new ideas or just to say hi — I'm just a message away. ✌️\n\nScrolling you to the contact section...`,
    },
    autoScrollDelay: 2000,
  },
];

// ─── Bio helpers ─────────────────────────────────────────────
const bioTr = 'Biyoloji disipliniyle yetişmiş, yazılıma gönül vermiş bir geliştiriciyim. React Native ile akıcı ve samimi kullanıcı deneyimleri tasarlarken, AI Researcher heyecanımla yapay zekayı projelerime değer katan bir yol arkadaşı olarak dahil ediyorum. Karmaşık problemleri basit çözümlere dönüştürmeyi, öğrenmeyi ve paylaşmayı seviyorum. Veriyi kullanıcı dostu hikayelere dönüştürmek için kod yazıyorum.';
const bioEn = 'A developer raised with a biology discipline who fell in love with software. While designing fluid and authentic user experiences with React Native, I integrate AI as a value-adding companion in my projects. I love transforming complex problems into simple solutions, learning, and sharing. I write code to turn data into user-friendly stories.';

// ─── Direct Responses ────────────────────────────────────────
export const directResponses: ResponseItem[] = [
  // Selamlaşma
  {
    keywords: ['merhaba', 'selam', 'hi', 'hey', 'selamün aleyküm', 'good morning', 'good afternoon', 'good evening', 'günaydın', 'iyi geceler', 'sa', 'slm', 'hello'],
    response: {
      tr: 'Selam! Onur\'un portfolyosuna hoş geldin. Burada onun hakkında her şeyi öğrenebilirsin — projelerinden yeteneklerine, deneyimlerinden iletişim bilgilerine kadar. Ne merak ediyorsun?',
      en: 'Hello! Welcome to Onur\'s portfolio. You can learn everything about him here — from projects to skills, experience to contact info. What are you curious about?',
    },
    showOptions: true,
  },
  {
    keywords: ['nasılsın', 'nasıl', 'iyi misin', 'ne haber', 'naber', 'nbr', 'nasilsin', 'how are you'],
    response: {
      tr: 'Gayet iyiyim, sorduğun için sağ ol! Ben bir bot olsam da moralim her zaman yerinde. Sana nasıl yardımcı olabilirim?',
      en: 'I\'m doing great, thanks for asking! Even though I\'m a bot, my morale is always high. How can I help you?',
    },
  },
  // Kimlik
  {
    keywords: ['kimsin', 'sen kim', 'kimdir', 'hakkında', 'who are you', 'tell me about yourself', 'tanışalım', 'kendini tanıt'],
    response: {
      tr: `${bioTr}\n\nKısacası: Karmaşıklığı sadeleştirmeyi seven, AI ve mobil teknolojileri birleştirerek anlamlı ürünler ortaya koyan bir geliştirici. Başka merak ettiğin bir şey var mı?`,
      en: `${bioEn}\n\nIn short: A developer who loves simplifying complexity and creating meaningful products by combining AI and mobile technologies. Anything else you'd like to know?`,
    },
  },
  {
    keywords: ['ne yapıyorsun', 'ne iş yapıyorsun', 'mesleğin', 'profession', 'occupation', 'job', 'ne is', 'neyle uğraşıyorsun', 'what do you do'],
    response: {
      tr: 'Onur şu anda AI Researcher & Mobile Developer olarak çalışıyor. React Native ile mobil uygulamalar geliştirirken, bir yandan da LLM, STT ve TTS modelleri üzerine araştırmalar yapıyor. İki dünyayı birleştiren bir profil diyebiliriz!',
      en: 'Onur currently works as an AI Researcher & Mobile Developer. He builds mobile apps with React Native while also conducting research on LLM, STT, and TTS models. A profile that bridges two worlds!',
    },
  },
  {
    keywords: ['adın', 'ismin', 'ismin ne', 'senin adın', 'what is your name', 'bot musun', 'your name'],
    response: {
      tr: 'Ben Onur\'un portfolyo chatbotuyum! LLM falan yok bende, ama Onur hakkında bildiklerimi seninle paylaşmaktan mutluluk duyarım. Sor bakalım!',
      en: 'I\'m Onur\'s portfolio chatbot! No LLM here, but I\'m happy to share what I know about Onur. Go ahead and ask!',
    },
  },
  // Bilgi isteme
  {
    keywords: ['bilgi', 'ver', 'bana bilgi', 'söyle', 'daha fazla', 'detay', 'detaylı bilgi', 'anlat', 'anlatır mısın', 'more info', 'tell me more'],
    response: {
      tr: 'Tabii ki! Hangi konu ilgini çekiyor? Aşağıdakilerden birini seç, seni hemen bilgilendirelim.',
      en: 'Of course! What topic interests you? Pick one below and I\'ll fill you in right away.',
    },
    showOptions: true,
  },
  {
    keywords: ['hakkımda bilgi', 'cv', 'özgeçmiş', 'about me', 'resume', 'özgeçmis'],
    response: {
      tr: `${bioTr}\n\nDaha fazla detay ister misin? Yetenekleri, projeleri veya deneyimleri sorabilirsin!`,
      en: `${bioEn}\n\nWant more details? You can ask about skills, projects, or experience!`,
    },
    showOptions: true,
  },
  // İletişim
  {
    keywords: ['iletişim', 'contact', 'email', 'mail', 'telefon', 'telefon numarası', 'ulaş', 'ulas', 'iletisim', 'nasıl ulaşırım', 'bağlantı', 'reach'],
    response: {
      tr: `Onur'a ulaşabileceğin kanallar:\n\n📧 E-posta: ${socialLinks.email}\n💻 GitHub: ${socialLinks.github}\n💼 LinkedIn: ${socialLinks.linkedin}\n📝 Medium: ${socialLinks.medium}\n\nHer zaman bir mesaj uzağında!`,
      en: `Here's how you can reach Onur:\n\n📧 Email: ${socialLinks.email}\n💻 GitHub: ${socialLinks.github}\n💼 LinkedIn: ${socialLinks.linkedin}\n📝 Medium: ${socialLinks.medium}\n\nAlways just a message away!`,
    },
  },
  // Projeler
  {
    keywords: ['proje', 'projelerin', 'çalışmaların', 'yaptığın iş', 'projects', 'portfolio', 'neler yaptın', 'github'],
    response: {
      tr: `İşte Onur'un öne çıkan projeleri:\n\n${projects.map(p => `• ${p.title}: ${p.description}`).join('\n\n')}\n\nDaha fazlası için GitHub: ${socialLinks.github}`,
      en: `Here are Onur's featured projects:\n\n• Jarvis: A smart personal assistant designed for voice-controlled mobile interaction.\n• ChatApp: A real-time one-on-one and group chat app built with React Native CLI and Socket.IO.\n• MovieApp: A movie browsing app built with React Native.\n\nMore on GitHub: ${socialLinks.github}`,
    },
  },
  // Yetenekler
  {
    keywords: ['yetenek', 'yeteneklerin', 'teknoloji', 'teknolojilerin', 'stack', 'skills', 'bilgin', 'tech stack', 'ne biliyorsun'],
    response: {
      tr: `Onur'un teknoloji araç kutusu:\n\n${techStack.map(t => `• ${t}`).join('\n')}\n\nMobil geliştirme ve AI araştırmaları konusunda uzmanlaşmış bir profil. Öğrenme hızı da cabası!`,
      en: `Onur's tech toolbox:\n\n${techStack.map(t => `• ${t}`).join('\n')}\n\nA profile specialized in mobile development and AI research. Fast learner too!`,
    },
  },
  // Deneyim
  {
    keywords: ['deneyim', 'deneyimlerin', 'iş', 'career', 'work', 'iş deneyimi', 'tecrübe', 'çalıştığın yerler', 'experience'],
    response: {
      tr: `Onur'un kariyer yolculuğu:\n\n${experiences.filter(e => e.type === 'work').map(e => `• ${e.title} (${e.period})\n  ${e.description}`).join('\n\n')}\n\nHer adımda yeni şeyler öğrenerek büyümeye devam ediyor!`,
      en: `Onur's career journey:\n\n• Appisode (Aug 2025 - Sep 2025)\n  London, UK (Remote). Worked on mobile app development using React Native with Expo framework.\n• AI Researcher & Mobile Developer (Dec 2025 - Present)\n  Conducting research on STT, TTS, and LLM models. Benchmarking open-source and commercial AI models.\n\nContinuously growing and learning at every step!`,
    },
  },
  // Eğitim
  {
    keywords: ['eğitim', 'egitim', 'okul', 'üniversite', 'education', 'school', 'university', 'bootcamp', 'patika', 'mezun'],
    response: {
      tr: `Onur'un eğitim serüveni:\n\n${experiences.filter(e => e.type === 'education').map(e => `• ${e.title} (${e.period})\n  ${e.description}`).join('\n\n')}\n\nBiyolojiden yazılıma geçiş, ona farklı bir bakış açısı ve analitik düşünme becerisi kazandırmış.`,
      en: `Onur's education journey:\n\n• Ege University (2020 - 2024)\n  Biology Department, GPA: 3.05/4\n• Patika+ React Native Bootcamp (2025)\n  Successfully completed an intensive software bootcamp focusing on React Native, JavaScript, and Git.\n\nThe transition from biology to software gave him a unique analytical perspective.`,
    },
  },
  // Konum
  {
    keywords: ['nerede', 'nerelisin', 'lokasyon', 'location', 'city', 'şehir', 'ülke', 'istanbul', 'türkiye', 'turkey', 'where are you', 'nereden', 'where'],
    response: {
      tr: 'Onur Türkiye\'den çalışıyor ve remote olarak dünya genelinde projelere katkıda bulunuyor. Daha önce Londra merkezli bir şirketle de remote çalıştı. Fiziksel sınırlar onu durduramaz!',
      en: 'Onur works from Turkey and contributes to projects worldwide remotely. He previously worked remotely with a London-based company. Physical borders can\'t stop him!',
    },
  },
  // AI
  {
    keywords: ['ai', 'yapay zeka', 'yapay', 'zeka', 'artificial intelligence', 'machine learning', 'ml', 'llm', 'stt', 'tts', 'model'],
    response: {
      tr: 'AI, Onur\'un en büyük tutkularından biri! Şu anda STT (konuşmayı metne çevirme), TTS (metni sese çevirme) ve LLM (büyük dil modelleri) üzerine derinlemesine araştırmalar yapıyor. Açık kaynak ve ticari modelleri karşılaştırıp benchmark çalışmaları yürütüyor.',
      en: 'AI is one of Onur\'s biggest passions! He\'s currently conducting deep research on STT (Speech-to-Text), TTS (Text-to-Speech), and LLM (Large Language Models). He compares open-source and commercial models and runs benchmark studies.',
    },
  },
  // Mobil
  {
    keywords: ['react native', 'mobile', 'mobil', 'uygulama', 'app', 'expo', 'react'],
    response: {
      tr: 'Mobil geliştirme Onur\'un uzmanlık alanı! Jarvis (sesli asistan), ChatApp (gerçek zamanlı sohbet) ve MovieApp gibi projelerinde React Native ve Expo kullandı. Kullanıcı dostu ve performanslı uygulamalar üretmeye bayılıyor.',
      en: 'Mobile development is Onur\'s specialty! He used React Native and Expo in projects like Jarvis (voice assistant), ChatApp (real-time chat), and MovieApp. He loves building user-friendly, high-performance apps.',
    },
  },
  // Jarvis
  {
    keywords: ['jarvis', 'asistan', 'sesli asistan', 'voice assistant'],
    response: {
      tr: `Jarvis, Onur'un en kapsamlı projelerinden biri! Sesli komutlarla mobil cihazınızla etkileşim kurmanızı sağlayan akıllı bir kişisel asistan. React Native (Expo), TypeScript, Groq (Llama 3.x), ElevenLabs API kullanılarak geliştirildi.\n\nGitHub: ${socialLinks.github}`,
      en: `Jarvis is one of Onur's most comprehensive projects! A smart personal assistant that lets you interact with your mobile device via voice commands. Built with React Native (Expo), TypeScript, Groq (Llama 3.x), and ElevenLabs API.\n\nGitHub: ${socialLinks.github}`,
    },
  },
  // Biyoloji
  {
    keywords: ['biyoloji', 'biology', 'ege üniversitesi', 'ege', 'kariyer değişikliği', 'neden yazılım'],
    response: {
      tr: 'Onur, Ege Üniversitesi Biyoloji bölümünden 3.05/4 ortalamayla mezun oldu. Biyolojideki analitik düşünme ve problem çözme becerileri, yazılım dünyasında ona büyük avantaj sağlıyor. Hücrelerin mükemmel düzenini kodlarına taşımayı hedefliyor!',
      en: 'Onur graduated from Ege University\'s Biology department with a 3.05/4 GPA. His analytical thinking and problem-solving skills from biology give him a huge advantage in software. He aims to bring the perfect order of cells into his code!',
    },
  },
  // Hobi
  {
    keywords: ['hobi', 'ilgi', 'boş zaman', 'hobby', 'interest', 'ne yaparsın', 'serbest zaman'],
    response: {
      tr: 'Onur boş zamanlarında da kod yazıyor dersek yanlış olmaz! Bunun dışında AI araştırmaları, Medium\'da yazı yazmak ve yeni teknolojileri keşfetmek en sevdiği aktiviteler arasında. Kahve tüketimi de sınırsız!',
      en: 'It wouldn\'t be wrong to say Onur codes in his free time too! Besides that, AI research, writing on Medium, and exploring new technologies are among his favorite activities. Coffee consumption: unlimited!',
    },
  },
  // Motivasyon
  {
    keywords: ['motivasyon', 'felsefe', 'prensip', 'ilke', 'motto', 'neden kod', 'niye yazılım', 'philosophy', 'motivation'],
    response: {
      tr: 'Onur\'un felsefesi üç temel üzerine kurulu:\n\n• "Karmaşıklığı sadeleştirmek bir tercih değil, bir sanat biçimidir."\n• "En iyi kod, yazılmasına gerek kalmayan koddur."\n• "Hücrelerin mükemmel düzenini, yazdığım her satıra taşımayı hedefliyorum."\n\nBiyoloji ve yazılımı birleştiren güzel bir bakış açısı!',
      en: 'Onur\'s philosophy is built on three pillars:\n\n• "Simplifying complexity is not a choice, it\'s an art form."\n• "The best code is the code that never needs to be written."\n• "I aim to bring the perfect order of cells into every line I write."\n\nA beautiful perspective combining biology and software!',
    },
  },
  // Teşekkür
  {
    keywords: ['teşekkür', 'tesekkur', 'thanks', 'thank you', 'sağol', 'saol', 'eyvallah', 'tşk', 'eyv'],
    response: {
      tr: 'Rica ederim, ne demek! Başka merak ettiğin bir şey olursa çekinmeden sor. Buradayım!',
      en: 'You\'re welcome! If you have any other questions, don\'t hesitate to ask. I\'m here!',
    },
  },
  // Veda
  {
    keywords: ['görüşürüz', 'hoşça kal', 'hoşçakal', 'bye', 'goodbye', 'see you', 'gittim', 'bb', 'güle güle'],
    response: {
      tr: 'Görüşmek üzere! Umarım faydalı olabilmişimdir. Tekrar uğramak istersen buradayım, kapı her zaman açık!',
      en: 'See you later! I hope I\'ve been helpful. Come back anytime — the door is always open!',
    },
  },
  // Yardım
  {
    keywords: ['yardım', 'help', 'ne yapabilirsin', 'neler biliyorsun', 'komutlar', 'özellikler', 'nasıl kullanılır', 'what can you do'],
    response: {
      tr: 'Sana Onur hakkında birçok konuda bilgi verebilirim! Hakkında bilgi, yetenekleri, projeleri, iş deneyimleri, eğitimi, iletişim bilgileri, AI araştırmaları ve daha fazlası. Aşağıdaki seçeneklerden başlayabilirsin.',
      en: 'I can tell you about Onur on many topics! About him, skills, projects, work experience, education, contact info, AI research, and more. You can start with the options below.',
    },
    showOptions: true,
  },
];

export function getQuickReplyById(id: string): QuickReplyOption | undefined {
  return quickReplies.find(qr => qr.id === id);
}

export { quickReplies };
