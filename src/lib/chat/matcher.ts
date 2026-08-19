import Fuse from 'fuse.js';
import { directResponses, quickReplies, topicCatalog, type SectionId } from './responses';
import type { Language } from '@/i18n/translations';

// ─── Türkçe Normalizer ───────────────────────────────────────
const turkishCharMap: Record<string, string> = {
  'ş': 's', 'ç': 'c', 'ğ': 'g', 'ü': 'u', 'ö': 'o', 'ı': 'i',
  'Ş': 's', 'Ç': 'c', 'Ğ': 'g', 'Ü': 'u', 'Ö': 'o', 'İ': 'i',
};

function normalizeTurkish(text: string): string {
  return text
    .toLowerCase()
    .split('')
    .map((char) => turkishCharMap[char] || char)
    .join('')
    .trim();
}

// ─── Eş Anlamlı Kelime Haritası ─────────────────────────────
const synonymMap: Record<string, string[]> = {
  'merhaba': ['mrb', 'mrba', 'mrhba', 'selamlar', 'helo', 'hello'],
  'selam': ['slm', 'sa', 'selamun aleykum', 'as'],
  'nasılsın': ['nasilsin', 'nabersin', 'n\'aber', 'noldu', 'keyifler nasil', 'how are you'],
  'proje': ['projeler', 'calismalar', 'portfolio', 'work', 'uretim'],
  'yetenek': ['skill', 'beceri', 'teknoloji', 'tech', 'stack'],
  'deneyim': ['tecrube', 'kariyer', 'is', 'experience', 'gecmis'],
  'iletişim': ['iletisim', 'contact', 'ulasim', 'baglanti', 'eposta', 'reach'],
  'eğitim': ['egitim', 'okul', 'universite', 'tahsil', 'diploma'],
  'react native': ['rnative', 'rn', 'react-native', 'reactnative'],
  'yapay zeka': ['ai', 'ml', 'deep learning', 'makine ogrenimi'],
  'teşekkür': ['tsk', 'tşk', 'eyv', 'eyw', 'sagol', 'saol', 'thanks', 'thank you'],
  'görüşürüz': ['gorusuruz', 'bb', 'bay bay', 'hoscakal', 'hosca kal', 'bye', 'goodbye'],
  'hakkında': ['hakkimda', 'hakkinda', 'kendini tanit', 'kimsin', 'about'],
  'yardım': ['yardim', 'help', 'destek', 'what can you do'],
  'bilgi': ['info', 'bilgilendirme', 'detay', 'aciklama', 'tell me'],
  'konum': ['nerede', 'nereli', 'sehir', 'lokasyon', 'ulke', 'where'],
  'hobi': ['ilgi', 'bos zaman', 'hobby', 'serbest', 'free time'],
  'motivasyon': ['felsefe', 'prensip', 'motto', 'ilke', 'neden kod', 'philosophy'],
  'jarvis': ['asistan', 'sesli asistan', 'voice'],
  'biyoloji': ['biology', 'ege', 'kariyer degisikligi'],
  'unimall': ['e-ticaret', 'eticaret', 'ocr', 'otomasyon', 'e-commerce', 'automation'],
  'envagro': ['stt', 'tts', 'llm', 'benchmark', 'arastirma', 'research'],
};

function splitWords(text: string): Set<string> {
  return new Set(text.split(/[^\p{L}\p{N}]+/u).filter(Boolean));
}

// Eş anlamlıları KELİME olarak arar. Önceki sürüm harf dizisi arıyordu,
// bu yüzden "deneyimlerin" içindeki 'ml' → "yapay zeka", "jarvis"
// içindeki 'is' → "deneyim", "morning" içindeki 'rn' → "react native"
// ekliyor ve soruyu tamamen başka bir konuya kaydırıyordu.
function expandWithSynonyms(text: string, words: Set<string>): string {
  const additions: string[] = [];

  for (const [canonical, synonyms] of Object.entries(synonymMap)) {
    const matched = synonyms.some((syn) => {
      const normalizedSyn = normalizeTurkish(syn);
      return normalizedSyn.includes(' ')
        ? text.includes(normalizedSyn)
        : words.has(normalizedSyn);
    });

    if (matched) additions.push(normalizeTurkish(canonical));
  }

  return additions.length > 0 ? `${text} ${additions.join(' ')}` : text;
}

// ─── Searchable Items ────────────────────────────────────────
interface SearchableItem {
  id: string;
  keywords: string[];
  normalizedKeywords: string[];
  responseTr: string;
  responseEn: string;
  showOptions?: boolean;
  autoScrollDelay?: number;
  sectionId?: SectionId;
  type: 'direct' | 'quickReply';
  topic?: string;
  suggests?: string[];
}

const searchableItems: SearchableItem[] = directResponses.map((item, index) => ({
  id: `direct-${index}`,
  keywords: item.keywords,
  normalizedKeywords: item.keywords.map(normalizeTurkish),
  responseTr: item.response.tr,
  responseEn: item.response.en,
  showOptions: item.showOptions,
  autoScrollDelay: item.autoScrollDelay,
  sectionId: item.sectionId,
  type: 'direct',
  topic: item.topic,
  suggests: item.suggests,
}));

const quickReplyItems: SearchableItem[] = quickReplies.map((item) => ({
  id: item.id,
  keywords: [item.label.tr.toLowerCase(), item.label.en.toLowerCase(), item.id],
  normalizedKeywords: [normalizeTurkish(item.label.tr), normalizeTurkish(item.label.en), item.id],
  responseTr: item.response.tr,
  responseEn: item.response.en,
  autoScrollDelay: item.autoScrollDelay,
  sectionId: item.sectionId,
  type: 'quickReply',
}));

// ─── Fuse.js ─────────────────────────────────────────────────
// Fuse yalnızca YAZIM HATASI telafisi için, en son çare olarak
// kullanılıyor. Eskiden ilk sıradaydı ve tüm cümle üzerinde gevşek bir
// eşikle çalıştığı için "hello" → biyografi, "hi there" → hobi gibi
// alakasız eşleşmeler üretiyordu.
const fuse = new Fuse(searchableItems, {
  keys: ['normalizedKeywords'],
  threshold: 0.28,
  distance: 40,
  includeScore: true,
  minMatchCharLength: 3,
});

// ─── Anahtar kelime puanlaması ──────────────────────────────
// Uzun eşleşme kısa eşleşmeden değerlidir: "projelerini anlat" içinde
// 'projelerin' (10 harf) eşleşmesi, 'anlat' (5 harf) eşleşmesini yener.
function scoreItem(item: SearchableItem, words: Set<string>, message: string): number {
  let score = 0;

  for (const keyword of item.normalizedKeywords) {
    if (!keyword) continue;

    if (keyword.includes(' ')) {
      // Çok kelimeli ifade — cümlenin içinde geçmeli
      if (message.includes(keyword)) score += keyword.length * 2;
      continue;
    }

    if (words.has(keyword)) {
      score += keyword.length * 2;
      continue;
    }

    // Türkçe çekim ekleri: "projelerini" → 'proje', ya da kullanıcı
    // kısa yazmış: "proj" → 'proje'
    if (keyword.length >= 4) {
      for (const word of words) {
        if (word.startsWith(keyword) || (word.length >= 4 && keyword.startsWith(word))) {
          score += keyword.length;
          break;
        }
      }
    }
  }

  return score;
}

// ─── Konuşma Bağlamı ─────────────────────────────────────────
//
// Önemli: Bağlam eskiden bu modülde global bir değişkendi. Sunucuda
// modül tüm istekler arasında paylaşıldığı için bir ziyaretçinin son
// konusu başka bir ziyaretçinin yanıtını etkiliyordu. Artık bağlam
// istemcide saklanıyor ve her istekle gidip geliyor.

export interface ConversationContext {
  lastTopic: string | null;
  recentTopics: string[];
}

export const emptyContext: ConversationContext = {
  lastTopic: null,
  recentTopics: [],
};

function withTopic(context: ConversationContext, topic?: string): ConversationContext {
  if (!topic) return context;
  return {
    lastTopic: topic,
    recentTopics: [...context.recentTopics.slice(-4), topic],
  };
}

/** Dışarıdan gelen bağlamı güvenli hale getirir — API'ye ne geldiği belli olmaz. */
export function sanitizeContext(input: unknown): ConversationContext {
  if (!input || typeof input !== 'object') return emptyContext;
  const raw = input as Partial<ConversationContext>;
  const lastTopic = typeof raw.lastTopic === 'string' ? raw.lastTopic.slice(0, 32) : null;
  const recentTopics = Array.isArray(raw.recentTopics)
    ? raw.recentTopics.filter((t): t is string => typeof t === 'string').slice(-5).map((t) => t.slice(0, 32))
    : [];
  return { lastTopic, recentTopics };
}

// ─── Bağlam Bazlı Takip Soruları ────────────────────────────
function handleContextualQuery(
  message: string,
  lang: Language,
  context: ConversationContext
): MatchResult | null {
  const normalized = normalizeTurkish(message);

  const isFollowUp =
    normalized.includes('github') || normalized.includes('link') ||
    normalized.includes('detay') || normalized.includes('daha fazla') ||
    normalized.includes('more') || normalized.includes('detail') ||
    normalized.includes('devami') || normalized.includes('ilki') ||
    normalized.includes('birincisi') || normalized.includes('first') ||
    normalized.includes('onun');

  if (!isFollowUp || !context.lastTopic) return null;

  if (context.lastTopic === 'projeler') {
    if (normalized.includes('github') || normalized.includes('link')) {
      return {
        response: lang === 'tr'
          ? 'GitHub profilinden tüm projelere ulaşabilirsin: github.com/Enver-Onur-Cogalan\n\nSpesifik bir projeyi merak ediyorsan adını yazabilirsin!'
          : 'You can find all projects on GitHub: github.com/Enver-Onur-Cogalan\n\nIf you\'re curious about a specific project, just type its name!',
        showOptions: false,
        context,
      };
    }
    if (normalized.includes('ilki') || normalized.includes('birincisi') || normalized.includes('first')) {
      return {
        response: lang === 'tr'
          ? 'İlk proje Jarvis — sesli komutlarla çalışan akıllı bir kişisel asistan. React Native (Expo), TypeScript ve Groq (Llama 3.x) ile geliştirildi.'
          : 'The first project is Jarvis — a smart personal assistant powered by voice commands. Built with React Native (Expo), TypeScript, and Groq (Llama 3.x).',
        showOptions: false,
        sectionId: 'projeler',
        context,
      };
    }
  }

  if (context.lastTopic === 'iletisim') {
    if (normalized.includes('github') || normalized.includes('link')) {
      return { response: 'GitHub: github.com/Enver-Onur-Cogalan', showOptions: false, context };
    }
  }

  if (context.lastTopic === 'ai' || context.lastTopic === 'mobil') {
    if (normalized.includes('detay') || normalized.includes('daha fazla') || normalized.includes('more') || normalized.includes('detail')) {
      return {
        response: lang === 'tr'
          ? 'Daha detaylı bilgi için projelere veya deneyimlere göz atabilirsin. Hangisini görmek istersin?'
          : 'For more details, you can check out the projects or experience. Which would you like to see?',
        showOptions: true,
        context,
      };
    }
  }

  return null;
}

// ─── Ana Eşleştirme Fonksiyonu ──────────────────────────────
export interface MatchResult {
  response: string;
  showOptions: boolean;
  autoScrollDelay?: number;
  sectionId?: SectionId;
  context: ConversationContext;
  /** Bu yanıttan sonra gösterilecek takip konuları */
  suggests?: string[];
}

function getResponse(item: SearchableItem, lang: Language): string {
  return lang === 'tr' ? item.responseTr : item.responseEn;
}

function toResult(
  item: SearchableItem,
  lang: Language,
  context: ConversationContext
): MatchResult {
  const nextContext = withTopic(context, item.topic);

  // Aynı konuyu tekrar önermenin anlamı yok; yakın geçmişte konuşulanları ele
  const suggests = (item.suggests ?? []).filter(
    (topic) => topic !== item.topic && !nextContext.recentTopics.slice(-2).includes(topic)
  );

  return {
    response: getResponse(item, lang),
    showOptions: item.showOptions || false,
    autoScrollDelay: item.autoScrollDelay,
    sectionId: item.sectionId,
    context: nextContext,
    suggests: suggests.length > 0 ? suggests : item.suggests,
  };
}

export function findBestMatch(
  userMessage: string,
  lang: Language = 'tr',
  context: ConversationContext = emptyContext
): MatchResult {
  const trimmed = userMessage.trim();

  if (trimmed.length === 0) {
    return {
      response: lang === 'tr' ? 'Lütfen bir mesaj yazın.' : 'Please type a message.',
      showOptions: false,
      context,
    };
  }

  const normalizedMessage = normalizeTurkish(trimmed);
  const expandedMessage = expandWithSynonyms(normalizedMessage, splitWords(normalizedMessage));
  const words = splitWords(expandedMessage);

  // 1. Bağlam bazlı takip soruları ("peki github?")
  const contextual = handleContextualQuery(normalizedMessage, lang, context);
  if (contextual) return contextual;

  // 2. Kullanıcı hızlı yanıt numarasını yazdıysa ("3")
  if (/^[1-5]$/.test(trimmed)) {
    const quickReply = quickReplyItems.find((item) => item.id === trimmed);
    if (quickReply) return toResult(quickReply, lang, context);
  }

  // 3. Anahtar kelime puanlaması — ana yöntem
  let best: SearchableItem | null = null;
  let bestScore = 0;

  for (const item of searchableItems) {
    const score = scoreItem(item, words, expandedMessage);
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }

  if (best && bestScore >= 4) {
    return toResult(best, lang, context);
  }

  // 4. Yazım hatası telafisi — kelime kelime, sıkı eşikle
  for (const word of words) {
    if (word.length < 4) continue;
    const [match] = fuse.search(word);
    if (match && (match.score ?? 1) < 0.28) {
      return toResult(match.item, lang, context);
    }
  }

  // 5. Anlaşılamadı — en yakın konuları öner
  // Puanlama zaten yapıldı; sıfırın üstünde kalan en iyi adayları
  // "şunu mu demek istedin?" olarak sunuyoruz. Hiç aday yoksa genel
  // başlangıç konularına düşüyoruz.
  const nearest = searchableItems
    .map((item) => ({ topic: item.topic, score: scoreItem(item, words, expandedMessage) }))
    .filter((entry) => entry.score > 0 && entry.topic && topicCatalog[entry.topic])
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.topic as string);

  const unique = [...new Set(nearest)].slice(0, 3);
  const hasGuesses = unique.length > 0;

  return {
    response: hasGuesses
      ? lang === 'tr'
        ? 'Tam olarak anlayamadım. Bunlardan birini mi kastettin?'
        : 'I couldn\'t quite place that. Did you mean one of these?'
      : lang === 'tr'
        ? 'Hmm, bunu bilmiyorum. Ama şunları sorabilirsin:'
        : 'Hmm, I don\'t know that one. But you can ask about:',
    showOptions: false,
    suggests: hasGuesses ? unique : ['hakkinda', 'projeler', 'deneyim', 'iletisim'],
    context,
  };
}
