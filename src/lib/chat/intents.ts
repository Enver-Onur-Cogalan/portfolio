import { skillCategories, projects } from '@/data/portfolio';
import { normalize, tokenize, phraseMatch } from './normalize';

/*
  Niyetler: ziyaretçinin ne istediği.

  İki tür var:
  · Varlığa bağlı niyetler (link, teknoloji, sonuç...) bir proje ya da
    şirket hakkında sorulur: "WeatherApp'in linki". Varlık yoksa
    eşleştirici bağlama bakar ("onun linki") ya da genel karşılığına
    düşer ("GitHub linkin" → sosyal hesaplar).
  · Genel niyetler (selam, iletişim, müsaitlik...) tek başına cevaplanır.

  Anahtar ifadeler normalleştirilmiş yazılıyor (ş → s, ı → i). Çok
  kelimeli ifade, kelime sayısı kadar puan alıyor; böylece "llm kullanıyor
  musun" (iki kelime) tek başına "llm"i (AI konusu) yener. Ek almış
  kelimeler ve küçük yazım hataları normalize.ts'teki kurallarla eşleşiyor.
*/

export const ENTITY_INTENTS = ['detail', 'link', 'tech', 'problem', 'approach', 'result', 'download'] as const;
export type EntityIntentId = (typeof ENTITY_INTENTS)[number];

interface IntentDef {
  id: string;
  /** İfade ya da [ifade, ağırlık]; ağırlık verilmezse 1 */
  keywords: Array<string | [string, number]>;
}


const DEFS: IntentDef[] = [
  // ─── Varlığa bağlı ───────────────────────────────────────
  { id: 'detail', keywords: ['nedir', 'anlat', 'anlatir misin', 'bahset', 'hakkinda', 'tell me about', 'what is', 'whats', 'detay', 'bilgi ver'] },
  { id: 'link', keywords: ['github', 'repo', 'repository', 'link', 'baglanti', 'kaynak kod', 'kod', 'source code', 'source', 'url'] },
  {
    id: 'tech',
    keywords: ['teknoloji', 'stack', 'tech', 'ne kullandin', 'ne kullanildi', 'neyle yaptin', 'neyle yapildi', 'neyle yazildi', 'ne ile yazildi', 'ne ile yapildi', 'ne ile yaptin', 'ne ile', 'yazildi', 'hangi model', 'which model', 'hangi dil', 'built with', 'written in', 'framework', 'kutuphane', 'library', 'which tech', 'what tech'],
  },
  {
    id: 'problem',
    keywords: ['problem', 'sorun', 'neden yaptin', 'neden yapildi', 'amaci', 'ne ise yarar', 'ise yarar', 'ise yariyor', 'ne isine yarar', 'why did you build', 'what problem', 'what is it for', 'purpose'],
  },
  {
    id: 'approach',
    keywords: ['nasil calisiyor', 'nasil calisir', 'nasil calistin', 'nasil yapildi', 'nasil yaptin', 'mimari', 'architecture', 'how does', 'how did', 'how was', 'built', 'yaklasim', 'approach', 'teknik detay', 'engineering'],
  },
  {
    id: 'result',
    keywords: ['sonuc', 'result', 'metrik', 'metric', 'olcum', 'basar', 'achieve', 'accomplish', 'impact', 'etki', 'kazandirdi', 'tasarruf', 'performans', 'numbers', 'rakamlar', 'outcome'],
  },
  { id: 'download', keywords: ['indir', 'download', 'kurulum', 'install', 'installer', 'exe', 'setup'] },

  // ─── Genel ───────────────────────────────────────────────
  { id: 'howareyou', keywords: ['nasilsin', 'naber', 'ne haber', 'nbr', 'iyi misin', 'how are you', 'whats up', 'nasil gidiyor', 'keyifler'] },
  {
    id: 'greet',
    keywords: ['merhaba', 'selam', 'selamlar', 'hi', 'hey', 'hello', 'hola', 'sa', 'slm', 'mrb', 'gunaydin', 'iyi aksamlar', 'good morning', 'good evening', 'selamun aleykum'],
  },
  {
    id: 'whynollm',
    keywords: ['bot', 'chatbot', 'bu bot', 'neden llm', 'llm yok', 'llm kullan', 'llm mi', 'llm misin', 'no llm', 'without llm', 'without an llm', 'chatgpt', 'gpt', 'openai', 'yapay zeka misin', 'yapay zeka mi', 'are you ai', 'are you an ai', 'are you an llm', 'kural tabanli', 'rule based', 'nasil calisiyorsun', 'how do you work', 'neden model yok'],
  },
  { id: 'identity', keywords: ['sen kimsin', 'bot musun', 'adin ne', 'ismin ne', 'your name', 'who are you', 'are you a bot', 'insan misin', 'are you human', 'robot'] },
  { id: 'help', keywords: ['yardim', 'help', 'ne yapabilirsin', 'neler sorabilirim', 'ne sorabilirim', 'what can you do', 'what can i ask', 'komutlar', 'nasil kullanilir'] },
  {
    id: 'about',
    keywords: ['kendini tanit', 'onur kim', 'kim bu', 'about him', 'tell me about yourself', 'who is onur', 'biraz anlat', 'kendinden bahset', 'tanisalim', 'introduce', 'onur hakkinda', 'hakkimda', 'background', 'his story'],
  },
  {
    id: 'profession',
    keywords: ['ne is yapiyorsun', 'ne is yapiyor', 'meslek', 'unvan', 'job title', 'what do you do', 'what does he do', 'pozisyon', 'yapiyorsun', 'bu aralar', 'ugras', 'for a living', 'role'],
  },
  {
    id: 'education',
    keywords: ['egitim', 'okul', 'universite', 'mezun', 'diploma', 'education', 'school', 'university', 'degree', 'okudun', 'okudu', 'study', 'studied', 'bolum', 'gpa', 'ortalama'],
  },
  {
    id: 'biology',
    keywords: ['biyoloji', 'biology', 'biyolog', 'biologist', 'kariyer degisikligi', 'career change', 'neden yazilim', 'why software', 'laboratuvar', 'lab'],
  },
  {
    id: 'location',
    keywords: ['nerede', 'nerelisin', 'nereli', 'nerede yasiyor', 'sehir', 'konum', 'lokasyon', 'location', 'where', 'based', 'izmir', 'turkiye', 'turkey', 'city'],
  },
  {
    id: 'hobby',
    keywords: ['hobi', 'bos zaman', 'ilgi alan', 'hobby', 'hobbies', 'free time', 'your free time', 'spare time', 'fun', 'something fun', 'fun fact', 'eglence', 'motosiklet', 'motorbike', 'motorcycle', 'oyun', 'gaming', 'kahve', 'coffee', 'disinda ne yapar'],
  },
  {
    // Gizli sürpriz: 404 sayfasındaki motosiklet oyunu. Önerilerde yok,
    // soran buluyor. "Oyun oynar mısın" hobiye gidiyor (tek "oyun" kelimesi
    // hobinin); burada "oyun var mı" gibi çok kelimeli ifadeler kazanıyor.
    id: 'easteregg',
    keywords: ['oyun var mi', 'oyun var', 'mini oyun', 'gizli oyun', '404 oyunu', 'oynayalim', 'oyun oynayalim', 'sikildim', 'canim sikildi', 'gizli', 'saklı', 'surpriz', 'easter egg', 'secret', 'hidden', 'is there a game', 'any game', 'lets play', 'play a game', 'bored', 'im bored'],
  },
  { id: 'philosophy', keywords: ['felsefe', 'prensip', 'ilke', 'motto', 'philosophy', 'principle', 'values', 'degerler'] },
  {
    id: 'workstyle',
    keywords: ['calisma tarzi', 'calisma sekli', 'nasil calisir', 'nasil calisiyor', 'metodoloji', 'work style', 'how does he work', 'how he works', 'surec', 'process'],
  },
  {
    id: 'skills',
    keywords: ['yetenek', 'beceri', 'skill', 'ne biliyor', 'neler biliyor', ['biliyor musun', 0.4], ['kullaniyor musun', 0.4], ['does he know', 0.3], ['does he use', 0.3], 'teknolojiler', 'tech stack', 'diller', 'languages', 'araclar', 'tools', 'uzmanlik', 'expertise'],
  },
  {
    id: 'ai',
    keywords: ['yapay zeka', 'ai', 'artificial intelligence', 'machine learning', 'makine ogrenmesi', 'ml', 'llm', 'llm deneyimi', 'stt', 'tts', 'agent', 'ajan', 'rag', 'model'],
  },
  { id: 'mobile', keywords: ['mobil', 'mobile', 'react native', 'expo', 'ios', 'android', 'app development', 'uygulama gelistirme'] },
  {
    id: 'projects',
    keywords: ['proje', 'project', 'calismalar', 'neler yaptin', 'neler yapti', 'yaptigin isler', 'what have you built', 'what has he built', 'work samples', 'portfolyonda'],
  },
  {
    id: 'experience',
    keywords: ['deneyim', 'tecrube', 'kariyer', 'is deneyimi', 'experience', 'career', 'calistigi yerler', 'nerelerde calisti', 'nerede calisti', 'where has he worked', 'where did he work', 'companies', 'sirketler', 'gecmis is'],
  },
  {
    id: 'contact',
    keywords: ['iletisim', 'ulas', 'contact', 'reach', 'email', 'e posta', 'eposta', 'mail', 'linkedin', 'telefon', 'phone', 'get in touch', 'medium', 'mesaj at'],
  },
  { id: 'cv', keywords: ['cv', 'ozgecmis', 'resume', 'curriculum', 'cv indir', 'ozgecmis indir', 'download cv', 'download resume'] },
  {
    id: 'availability',
    keywords: ['musait', 'acik misin', 'acik mi', 'is ariyor', 'is arayisi', 'firsat', 'available', 'availability', 'open to', 'remote', 'uzaktan', 'hibrit', 'hybrid', 'ofis', 'office', 'relocate', 'tasin', 'izmir disi', 'sehir disi', 'tam zamanli', 'full time', 'freelance', 'maas', 'ucret', 'fiyat', 'price', 'salary', 'beklenti', 'iste misin', 'bir iste', 'calisiyor musun', 'calisiyor mu', 'su an calisiyor', 'currently working', 'employed', 'looking for', 'job search', 'baslayabilir'],
  },
  {
    id: 'hire',
    keywords: ['neden seni', 'neden onur', 'neden ise', 'secmeli', 'why hire', 'why should', 'why you', 'why choose', 'guclu', 'strengths', 'farki ne', 'ne katar', 'artisi', 'what makes'],
  },
  { id: 'hardest', keywords: ['en zor', 'zorlandigin', 'zor problem', 'zorluk', 'challenge', 'hardest', 'difficult', 'toughest'] },
  { id: 'thanks', keywords: ['tesekkur', 'sagol', 'sag ol', 'saol', 'eyvallah', 'tsk', 'thanks', 'thank you', 'thx', 'eyw'] },
  { id: 'bye', keywords: ['gorusuruz', 'hosca kal', 'hoscakal', 'bye', 'goodbye', 'see you', 'gule gule', 'iyi gunler'] },
  { id: 'info', keywords: ['bilgi', 'daha fazla', 'tell me more', 'more info'] },
];

/*
  Sitede adı geçen her teknoloji ("Python", "Docker", "Zustand") yetenek
  sorusunun işareti, düşük ağırlıkla. Liste veriden geliyor; yeni bir
  yetenek eklenince bot onu da tanıyor. Başka bir niyetin zaten anahtarı
  olan adlar ("React Native" → mobil, "RAG" → AI) alınmıyor: daha belirgin
  konu kazansın. "React Native (Expo)" gibi açıklamalar atılıp tekrarlar
  birleştiriliyor; yoksa aynı ad iki kez puan alıyordu.
*/
const otherKeywords = new Set(
  DEFS.filter((def) => def.id !== 'skills').flatMap((def) =>
    def.keywords.map((k) => normalize(typeof k === 'string' ? k : k[0]))
  )
);
const techNames = [
  ...new Set(
    [...skillCategories.flatMap((c) => c.skills), ...projects.flatMap((p) => p.technologies)].map((name) =>
      normalize(name.replace(/\(.*?\)/g, ''))
    )
  ),
].filter((name) => name.length >= 2 && !otherKeywords.has(name));
DEFS.find((def) => def.id === 'skills')!.keywords.push(...techNames.map((name): [string, number] => [name, 0.5]));

interface CompiledIntent {
  id: string;
  phrases: Array<{ words: string[]; weight: number }>;
}

const COMPILED: CompiledIntent[] = DEFS.map((def) => ({
  id: def.id,
  phrases: def.keywords.map((k) => {
    const [text, weight] = typeof k === 'string' ? [k, 1] : k;
    return { words: tokenize(normalize(text)), weight };
  }),
}));

export const intentOrder = DEFS.map((def) => def.id);

/**
 * Her niyetin puanı. Bir ifade eşleşince kelime sayısı × eşleşme gücü
 * kadar puan alır; aynı kelimeyi birden fazla ifade sayabilir, bu da
 * niyetin mesajla ne kadar örtüştüğünü yansıtıyor.
 */
export function scoreIntents(tokens: string[]): Map<string, number> {
  const scores = new Map<string, number>();
  for (const intent of COMPILED) {
    let score = 0;
    for (const phrase of intent.phrases) {
      const match = phraseMatch(tokens, phrase.words);
      if (match > 0) score += match * phrase.words.length * phrase.weight;
    }
    if (score > 0) scores.set(intent.id, score);
  }
  return scores;
}
