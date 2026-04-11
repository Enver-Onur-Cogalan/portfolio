import Fuse, { IFuseOptions } from 'fuse.js';
import { directResponses, quickReplies } from './responses';
import type { Language } from '@/context/LanguageContext';

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
  'yetenek': ['skill', 'beceri', 'teknoloji', 'tech', 'bilgi'],
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
};

function expandWithSynonyms(text: string): string {
  let expanded = text;
  for (const [canonical, synonyms] of Object.entries(synonymMap)) {
    const normalizedCanonical = normalizeTurkish(canonical);
    for (const syn of synonyms) {
      const normalizedSyn = normalizeTurkish(syn);
      if (expanded.includes(normalizedSyn)) {
        expanded = expanded + ' ' + normalizedCanonical;
        break;
      }
    }
  }
  return expanded;
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
  type: 'direct' | 'quickReply';
  topic?: string;
}

const topicLabels: Record<number, string> = {
  0: 'selamlama', 1: 'selamlama',
  2: 'hakkinda', 3: 'meslek', 4: 'kimlik',
  5: 'bilgi', 6: 'hakkinda',
  7: 'iletisim', 8: 'projeler', 9: 'yetenekler',
  10: 'deneyim', 11: 'egitim', 12: 'konum',
  13: 'ai', 14: 'mobil',
  15: 'jarvis', 16: 'biyoloji', 17: 'hobi', 18: 'motivasyon',
  19: 'tesekkur', 20: 'veda', 21: 'yardim',
};

const searchableItems: SearchableItem[] = directResponses.map((item, index) => ({
  id: `direct-${index}`,
  keywords: item.keywords,
  normalizedKeywords: item.keywords.map(normalizeTurkish),
  responseTr: item.response.tr,
  responseEn: item.response.en,
  showOptions: item.showOptions,
  autoScrollDelay: item.autoScrollDelay,
  type: 'direct',
  topic: topicLabels[index],
}));

const quickReplyItems: SearchableItem[] = quickReplies.map((item) => ({
  id: item.id,
  keywords: [item.label.tr.toLowerCase(), item.label.en.toLowerCase(), item.id],
  normalizedKeywords: [normalizeTurkish(item.label.tr), normalizeTurkish(item.label.en), item.id],
  responseTr: item.response.tr,
  responseEn: item.response.en,
  autoScrollDelay: item.autoScrollDelay,
  type: 'quickReply',
}));

// ─── Fuse.js Setup ───────────────────────────────────────────
const fuseOptions: IFuseOptions<SearchableItem> = {
  keys: ['keywords', 'normalizedKeywords'],
  threshold: 0.4,
  distance: 100,
  includeScore: true,
  minMatchCharLength: 2,
};

const fuse = new Fuse(searchableItems, fuseOptions);
const quickReplyFuse = new Fuse(quickReplyItems, {
  ...fuseOptions,
  threshold: 0.3,
});

// ─── Context Tracking ────────────────────────────────────────
interface ConversationContext {
  lastTopic: string | null;
  lastResponseIndex: number | null;
  recentTopics: string[];
}

let context: ConversationContext = {
  lastTopic: null,
  lastResponseIndex: null,
  recentTopics: [],
};

function updateContext(topic: string | undefined, responseIndex: number) {
  if (topic) {
    context.lastTopic = topic;
    context.lastResponseIndex = responseIndex;
    context.recentTopics = [...context.recentTopics.slice(-4), topic];
  }
}

function handleContextualQuery(message: string, lang: Language): MatchResult | null {
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
      };
    }
    if (normalized.includes('ilki') || normalized.includes('birincisi') || normalized.includes('first')) {
      return {
        response: lang === 'tr'
          ? 'İlk proje Jarvis — sesli komutlarla çalışan akıllı bir kişisel asistan. React Native (Expo), TypeScript ve Groq (Llama 3.x) ile geliştirildi.'
          : 'The first project is Jarvis — a smart personal assistant powered by voice commands. Built with React Native (Expo), TypeScript, and Groq (Llama 3.x).',
        showOptions: false,
      };
    }
  }

  if (context.lastTopic === 'iletisim') {
    if (normalized.includes('github') || normalized.includes('link')) {
      return { response: 'GitHub: github.com/Enver-Onur-Cogalan', showOptions: false };
    }
  }

  if (context.lastTopic === 'ai' || context.lastTopic === 'mobil') {
    if (normalized.includes('detay') || normalized.includes('daha fazla') || normalized.includes('more') || normalized.includes('detail')) {
      return {
        response: lang === 'tr'
          ? 'Daha detaylı bilgi için projelere veya deneyimlere göz atabilirsin. Hangisini görmek istersin?'
          : 'For more details, you can check out the projects or experience. Which would you like to see?',
        showOptions: true,
      };
    }
  }

  return null;
}

export function resetContext() {
  context = { lastTopic: null, lastResponseIndex: null, recentTopics: [] };
}

// ─── Ana Eşleştirme Fonksiyonu ──────────────────────────────
export interface MatchResult {
  response: string;
  showOptions: boolean;
  autoScrollDelay?: number;
}

function getResponse(item: SearchableItem, lang: Language): string {
  return lang === 'tr' ? item.responseTr : item.responseEn;
}

export function findBestMatch(userMessage: string, lang: Language = 'tr'): MatchResult {
  const trimmed = userMessage.trim();

  if (trimmed.length === 0) {
    return {
      response: lang === 'tr' ? 'Lütfen bir mesaj yazın.' : 'Please type a message.',
      showOptions: false,
    };
  }

  const normalizedMessage = normalizeTurkish(trimmed);
  const expandedMessage = expandWithSynonyms(normalizedMessage);

  // 1. Bağlam bazlı takip soruları
  const contextualResult = handleContextualQuery(normalizedMessage, lang);
  if (contextualResult) return contextualResult;

  // 2. Quick reply eşleştirmesi
  const quickReplyResults = quickReplyFuse.search(expandedMessage);
  if (quickReplyResults.length > 0 && quickReplyResults[0].score! < 0.2) {
    return {
      response: getResponse(quickReplyResults[0].item, lang),
      showOptions: false,
      autoScrollDelay: quickReplyResults[0].item.autoScrollDelay,
    };
  }

  // 3. Fuse.js fuzzy arama
  const results = fuse.search(expandedMessage);
  if (results.length > 0 && results[0].score! < 0.4) {
    const bestMatch = results[0].item;
    const index = parseInt(bestMatch.id.split('-')[1]);
    updateContext(bestMatch.topic, index);
    return {
      response: getResponse(bestMatch, lang),
      showOptions: bestMatch.showOptions || false,
      autoScrollDelay: bestMatch.autoScrollDelay,
    };
  }

  // 4. Normalize keyword substring
  for (let i = 0; i < searchableItems.length; i++) {
    const item = searchableItems[i];
    const hasKeyword = item.normalizedKeywords.some((keyword) =>
      normalizedMessage.includes(keyword)
    );
    if (hasKeyword) {
      updateContext(item.topic, i);
      return {
        response: getResponse(item, lang),
        showOptions: item.showOptions || false,
        autoScrollDelay: item.autoScrollDelay,
      };
    }
  }

  // 5. Expanded (synonym) substring
  for (let i = 0; i < searchableItems.length; i++) {
    const item = searchableItems[i];
    const hasKeyword = item.normalizedKeywords.some((keyword) =>
      expandedMessage.includes(keyword)
    );
    if (hasKeyword) {
      updateContext(item.topic, i);
      return {
        response: getResponse(item, lang),
        showOptions: item.showOptions || false,
        autoScrollDelay: item.autoScrollDelay,
      };
    }
  }

  // 6. Fallback
  return {
    response: lang === 'tr'
      ? 'Hmm, tam olarak anlayamadım ama olsun! Belki şunlardan biri sana yardımcı olabilir:'
      : 'Hmm, I didn\'t quite get that, but no worries! Maybe one of these can help:',
    showOptions: true,
  };
}
