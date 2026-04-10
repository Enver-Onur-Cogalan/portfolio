import { bio, projects, techStack, experiences, socialLinks } from '@/data/portfolio';

export interface ResponseItem {
  keywords: string[];
  response: string;
  showOptions?: boolean;
  autoScrollDelay?: number; // milliseconds
}

export interface QuickReplyOption {
  id: string;
  label: string;
  title: string;
  response: string;
  autoScrollDelay?: number;
}

const quickReplies: QuickReplyOption[] = [
  {
    id: '1',
    label: 'Hakkımda',
    title: '1',
    response: `Adım Onur, işim ise karmaşık sorunları basit kodlarla çözmek. Her gün bir önceki versiyonuma güncelleme atan bir geliştiriciyim diyebiliriz.\n\nDaha detaylı bilgi için ilgili kısma yönlendiriyorum!`,
    autoScrollDelay: 2000,
  },
  {
    id: '2',
    label: 'Yetenekler',
    title: '2',
    response: `Neler yapabildiğimi merak ediyorsan, seni şöyle bir aşağıya doğru alalım.\n\nSayfayı senin için kaydırıyorum.😉`,
    autoScrollDelay: 2000,
  },
  {
    id: '3',
    label: 'Deneyimler',
    title: '3',
    response: `Burada sadece CV yok kanki; yarısı başarı, yarısı 'bu kod niye çalışmıyor' diye dökülen saçlarım!\n\nBiyolojiden yazılıma nasıl evrildiğimi görmek için aşağı süzülüyoruz, sıkı tutun.😜`,
    autoScrollDelay: 2000,
  },
  {
    id: '4',
    label: 'Projeler',
    title: '4',
    response: `Zamanımın ve enerjimin büyük bir kısmını, fikirleri çalışan sistemlere dönüştürmek için harcıyorum. Aşağıda, sadece kod satırlarını değil, üzerine kafa yorduğum çözümleri göreceksin.\n\nHadi, üretim sürecimin sonuçlarına birlikte bakalım.🧐`,
    autoScrollDelay: 2000,
  },
  {
    id: '5',
    label: 'İletişim',
    title: '5',
    response: `Kapımız her zaman açık! Yeni fikirler veya sadece bir selam için bana ulaşmaktan sakın çekinme; ben bir mesaj uzağındayım, bekliyorum. ✌️:\n\nİlgili kısma hemen gönderiyorum...`,
    autoScrollDelay: 2000,
  },
];

export const directResponses: ResponseItem[] = [
  // Selamlaşma
  {
    keywords: ['merhaba', 'selam', 'hi', 'hey', 'selamün aleyküm', 'good morning', 'good afternoon', 'good evening', 'günaydın', 'iyi geceler', 'sa', 'slm'],
    response: 'Selam! Onur\'un portfolyosuna hoş geldin. Burada onun hakkında her şeyi öğrenebilirsin — projelerinden yeteneklerine, deneyimlerinden iletişim bilgilerine kadar. Ne merak ediyorsun?',
    showOptions: true,
  },
  {
    keywords: ['nasılsın', 'nasıl', 'iyi misin', 'ne haber', 'naber', 'nbr', 'nasilsin'],
    response: 'Gayet iyiyim, sorduğun için sağ ol! Ben bir bot olsam da moralim her zaman yerinde. Sana nasıl yardımcı olabilirim?',
  },
  // Kimlik
  {
    keywords: ['kimsin', 'sen kim', 'kimdir', 'hakkında', 'who are you', 'tell me about yourself', 'tanışalım', 'kendini tanıt'],
    response: `${bio}\n\nKısacası: Karmaşıklığı sadeleştirmeyi seven, AI ve mobil teknolojileri birleştirerek anlamlı ürünler ortaya koyan bir geliştirici. Başka merak ettiğin bir şey var mı?`,
  },
  {
    keywords: ['ne yapıyorsun', 'ne iş yapıyorsun', 'mesleğin', 'profession', 'occupation', 'job', 'ne is', 'neyle uğraşıyorsun'],
    response: 'Onur şu anda AI Researcher & Mobile Developer olarak çalışıyor. React Native ile mobil uygulamalar geliştirirken, bir yandan da LLM, STT ve TTS modelleri üzerine araştırmalar yapıyor. İki dünyayı birleştiren bir profil diyebiliriz!',
  },
  {
    keywords: ['adın', 'ismin', 'ismin ne', 'senin adın', 'what is your name', 'bot musun'],
    response: 'Ben Onur\'un portfolyo chatbotuyum! LLM falan yok bende, ama Onur hakkında bildiklerimi seninle paylaşmaktan mutluluk duyarım. Sor bakalım!',
  },
  // Bilgi isteme - showOptions true olacak
  {
    keywords: ['bilgi', 'ver', 'bana bilgi', 'söyle', 'daha fazla', 'detay', 'detaylı bilgi', 'anlat', 'anlatır mısın'],
    response: 'Tabii ki! Hangi konu ilgini çekiyor? Aşağıdakilerden birini seç, seni hemen bilgilendirelim.',
    showOptions: true,
  },
  {
    keywords: ['hakkımda bilgi', 'cv', 'özgeçmiş', 'about me', 'resume', 'özgeçmis'],
    response: `${bio}\n\nDaha fazla detay ister misin? Yetenekleri, projeleri veya deneyimleri sorabilirsin!`,
    showOptions: true,
  },
  // İletişim
  {
    keywords: ['iletişim', 'contact', 'email', 'mail', 'telefon', 'telefon numarası', 'ulaş', 'ulas', 'iletisim', 'nasıl ulaşırım', 'bağlantı'],
    response: `Onur'a ulaşabileceğin kanallar:\n\n📧 E-posta: ${socialLinks.email}\n💻 GitHub: ${socialLinks.github}\n💼 LinkedIn: ${socialLinks.linkedin}\n📝 Medium: ${socialLinks.medium}\n\nHer zaman bir mesaj uzağında!`,
  },
  // Projeler
  {
    keywords: ['proje', 'projelerin', 'çalışmaların', 'yaptığın iş', 'projects', 'portfolio', 'neler yaptın', 'github'],
    response: `İşte Onur'un öne çıkan projeleri:\n\n${projects.map(p => `• ${p.title}: ${p.description}`).join('\n\n')}\n\nDaha fazlası için GitHub: ${socialLinks.github}`,
  },
  // Yetenekler
  {
    keywords: ['yetenek', 'yeteneklerin', 'teknoloji', 'teknolojilerin', 'stack', 'skills', 'bilgin', 'tech stack', 'ne biliyorsun'],
    response: `Onur'un teknoloji araç kutusu:\n\n${techStack.map(t => `• ${t}`).join('\n')}\n\nMobil geliştirme ve AI araştırmaları konusunda uzmanlaşmış bir profil. Öğrenme hızı da cabası!`,
  },
  // Deneyim
  {
    keywords: ['deneyim', 'deneyimlerin', 'iş', 'career', 'work', 'iş deneyimi', 'tecrübe', 'çalıştığın yerler'],
    response: `Onur'un kariyer yolculuğu:\n\n${experiences.filter(e => e.type === 'work').map(e => `• ${e.title} (${e.period})\n  ${e.description}`).join('\n\n')}\n\nHer adımda yeni şeyler öğrenerek büyümeye devam ediyor!`,
  },
  // Eğitim
  {
    keywords: ['eğitim', 'egitim', 'okul', 'üniversite', 'education', 'school', 'university', 'bootcamp', 'patika', 'mezun'],
    response: `Onur'un eğitim serüveni:\n\n${experiences.filter(e => e.type === 'education').map(e => `• ${e.title} (${e.period})\n  ${e.description}`).join('\n\n')}\n\nBiyolojiden yazılıma geçiş, ona farklı bir bakış açısı ve analitik düşünme becerisi kazandırmış.`,
  },
  // Konum
  {
    keywords: ['nerede', 'nerelisin', 'lokasyon', 'location', 'city', 'şehir', 'ülke', 'istanbul', 'türkiye', 'turkey', 'where are you', 'nereden'],
    response: 'Onur Türkiye\'den çalışıyor ve remote olarak dünya genelinde projelere katkıda bulunuyor. Daha önce Londra merkezli bir şirketle de remote çalıştı. Fiziksel sınırlar onu durduramaz!',
  },
  // AI
  {
    keywords: ['ai', 'yapay zeka', 'yapay', 'zeka', 'artificial intelligence', 'machine learning', 'ml', 'llm', 'stt', 'tts', 'model'],
    response: 'AI, Onur\'un en büyük tutkularından biri! Şu anda STT (konuşmayı metne çevirme), TTS (metni sese çevirme) ve LLM (büyük dil modelleri) üzerine derinlemesine araştırmalar yapıyor. Açık kaynak ve ticari modelleri karşılaştırıp benchmark çalışmaları yürütüyor.',
  },
  // Mobil
  {
    keywords: ['react native', 'mobile', 'mobil', 'uygulama', 'app', 'expo', 'react'],
    response: 'Mobil geliştirme Onur\'un uzmanlık alanı! Jarvis (sesli asistan), ChatApp (gerçek zamanlı sohbet) ve MovieApp gibi projelerinde React Native ve Expo kullandı. Kullanıcı dostu ve performanslı uygulamalar üretmeye bayılıyor.',
  },
  // Jarvis özel
  {
    keywords: ['jarvis', 'asistan', 'sesli asistan', 'voice assistant'],
    response: `Jarvis, Onur'un en kapsamlı projelerinden biri! Sesli komutlarla mobil cihazınızla etkileşim kurmanızı sağlayan akıllı bir kişisel asistan. React Native (Expo), TypeScript, Groq (Llama 3.x), ElevenLabs API kullanılarak geliştirildi.\n\nGitHub: ${socialLinks.github}`,
  },
  // Biyoloji geçmişi
  {
    keywords: ['biyoloji', 'biology', 'ege üniversitesi', 'ege', 'kariyer değişikliği', 'neden yazılım'],
    response: 'Onur, Ege Üniversitesi Biyoloji bölümünden 3.05/4 ortalamayla mezun oldu. Biyolojideki analitik düşünme ve problem çözme becerileri, yazılım dünyasında ona büyük avantaj sağlıyor. Hücrelerin mükemmel düzenini kodlarına taşımayı hedefliyor!',
  },
  // Hobi / ilgi alanı
  {
    keywords: ['hobi', 'ilgi', 'boş zaman', 'hobby', 'interest', 'ne yaparsın', 'serbest zaman'],
    response: 'Onur boş zamanlarında da kod yazıyor dersek yanlış olmaz! Bunun dışında AI araştırmaları, Medium\'da yazı yazmak ve yeni teknolojileri keşfetmek en sevdiği aktiviteler arasında. Kahve tüketimi de sınırsız!',
  },
  // Motivasyon / felsefe
  {
    keywords: ['motivasyon', 'felsefe', 'prensip', 'ilke', 'motto', 'neden kod', 'niye yazılım'],
    response: 'Onur\'un felsefesi üç temel üzerine kurulu:\n\n• "Karmaşıklığı sadeleştirmek bir tercih değil, bir sanat biçimidir."\n• "En iyi kod, yazılmasına gerek kalmayan koddur."\n• "Hücrelerin mükemmel düzenini, yazdığım her satıra taşımayı hedefliyorum."\n\nBiyoloji ve yazılımı birleştiren güzel bir bakış açısı!',
  },
  // Teşekkür
  {
    keywords: ['teşekkür', 'tesekkur', 'thanks', 'thank you', 'sağol', 'saol', 'eyvallah', 'tşk', 'eyv'],
    response: 'Rica ederim, ne demek! Başka merak ettiğin bir şey olursa çekinmeden sor. Buradayım!',
  },
  // Vedalaşma
  {
    keywords: ['görüşürüz', 'hoşça kal', 'hoşçakal', 'bye', 'goodbye', 'see you', 'gittim', 'bb', 'güle güle'],
    response: 'Görüşmek üzere! Umarım faydalı olabilmişimdir. Tekrar uğramak istersen buradayım, kapı her zaman açık!',
  },
  // Yardım / ne yapabilirsin
  {
    keywords: ['yardım', 'help', 'ne yapabilirsin', 'neler biliyorsun', 'komutlar', 'özellikler', 'nasıl kullanılır'],
    response: 'Sana Onur hakkında birçok konuda bilgi verebilirim! Hakkında bilgi, yetenekleri, projeleri, iş deneyimleri, eğitimi, iletişim bilgileri, AI araştırmaları ve daha fazlası. Aşağıdaki seçeneklerden başlayabilirsin.',
    showOptions: true,
  },
];

export function getQuickReplyById(id: string): QuickReplyOption | undefined {
  return quickReplies.find(qr => qr.id === id);
}

export { quickReplies };
