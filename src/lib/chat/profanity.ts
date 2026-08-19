// ─── Küfür Filtresi ───────────────────────────────────────────
//
// Tasarım notu: Önceki sürüm kelime gövdesinde arama yapıyordu
// (`word.includes(profanity)`), bu yüzden "hello" → 'hell', "michelle",
// "scraping", "shell" gibi masum kelimeler engelleniyordu. Artık iki
// kesin yöntem var:
//
//   EXACT — kelimenin tamamı eşleşmeli. Kısa ve başka kelimelerin
//           içinde geçebilen ifadeler burada durur ('am', 'got', 'pic').
//   STEMS — kelime bu kökle BAŞLAMALI. Türkçe çekim eklerini yakalamak
//           için ("siktir" → siktirme, siktiğim). Kökler yeterince uzun
//           ve benzersiz seçildi; 'göt' gibi "götür"ü de yakalayacak
//           kökler bilerek STEMS'e alınmadı.
//
// Amaç kapsamlı bir sansür değil, kaba dile karşı kibar bir uyarı.
// Şüpheli durumda kullanıcıyı engellememeyi tercih ediyoruz.

const EXACT: ReadonlySet<string> = new Set([
  // Türkçe
  'am', 'amk', 'amq', 'aq', 'amcik', 'oc', 'oç', 'oq',
  'bok', 'boku', 'bokun', 'got', 'göt', 'gotu', 'gotun',
  'pic', 'piç', 'pico', 'yarak', 'yarrak', 'yarragi',
  'sik', 'siki', 'sikim', 'cuk', 'çük', 'tasak', 'taşak',
  'mal', 'kahpe', 'kaltak', 'ibne', 'ibina', 'gavat',
  'anani', 'anana', 'ananin', 'ananı', 'ananın',
  'salak', 'gerizekali', 'gerizekalı', 'aptal',
  // İngilizce
  'ass', 'arse', 'cock', 'dick', 'cunt', 'twat', 'prick',
  'fag', 'wtf', 'stfu', 'jerk', 'wanker', 'bollocks',
]);

const STEMS: readonly string[] = [
  // Türkçe — çekim eki alabilen kökler
  'siktir', 'sikeyim', 'sikerim', 'siktig', 'sikil', 'sikici', 'sikis',
  'amina', 'aminak', 'aminak', 'amcik', 'amcig', 'amina',
  'orospu', 'orosbu', 'pezeven', 'pezevenk',
  'yarrag', 'yarrak', 'gotver', 'gotlek', 'gotoglan',
  'serefsiz', 'şerefsiz', 'hassiktir', 'siktiri',
  'kahpelik', 'oruspu',
  // İngilizce
  'fuck', 'shit', 'bitch', 'asshole', 'arsehole', 'bastard',
  'cunt', 'nigger', 'nigga', 'faggot', 'motherfuck', 'dickhead',
  'bullshit', 'dumbass', 'jackass', 'whore', 'slut', 'retard',
  'cocksuck', 'dipshit', 'douchebag', 'pussies', 'pussy',
];

// Asla küfür sayılmayacak kelimeler — liste ileride genişlerse diye
// bırakılan güvenlik ağı.
const SAFE: ReadonlySet<string> = new Set([
  'hello', 'hell', 'shell', 'michelle', 'hellenic', 'shelter',
  'class', 'classic', 'assist', 'assistant', 'assets', 'asset',
  'assume', 'assess', 'pass', 'passes', 'password', 'passion',
  'analysis', 'analytics', 'scrap', 'scraping', 'compass', 'embassy',
  'bass', 'mass', 'grass', 'glass', 'brass', 'massage', 'associate',
  'assembly', 'dumbbell', 'ananas', 'gotur', 'goturmek', 'picture',
  'country', 'countries', 'document', 'canada',
]);

// Leetspeak → harf
const LEET: Record<string, string> = {
  '4': 'a', '@': 'a', '1': 'i', '!': 'i', '|': 'i',
  '0': 'o', '3': 'e', '5': 's', '$': 's', '7': 't', '9': 'g', '8': 'b',
};

// Türkçe harfleri ASCII karşılığına indirger — listeler de bu biçimde
// tutulduğu için "sıktır", "siktir" ve "s1kt1r" aynı yere düşer.
const TR_FOLD: Record<string, string> = {
  'ş': 's', 'ç': 'c', 'ğ': 'g', 'ü': 'u', 'ö': 'o', 'ı': 'i', 'â': 'a', 'î': 'i', 'û': 'u',
};

function normalizeWord(word: string): string {
  return word
    .toLowerCase()
    .split('')
    .map((char) => LEET[char] ?? char)
    .join('');
}

// "siiiktir" → "siktir". Ayrı bir varyant olarak denenir; doğrudan
// uygulanmaz, yoksa "pussy" → "pusy" olup kök eşleşmesinden kaçardı.
function collapseRepeats(word: string): string {
  return word.replace(/(.)\1+/g, '$1');
}

function foldTurkish(word: string): string {
  return word
    .split('')
    .map((char) => TR_FOLD[char] ?? char)
    .join('');
}

function isProfaneWord(raw: string): boolean {
  if (!raw) return false;

  const normalized = normalizeWord(raw);
  const folded = foldTurkish(normalized);

  // Güvenlik ağı önce çalışır
  if (SAFE.has(normalized) || SAFE.has(folded)) return false;

  // Hem yazıldığı hali hem harf uzatmaları sadeleştirilmiş hali denenir
  const variants = new Set([
    normalized,
    folded,
    collapseRepeats(normalized),
    collapseRepeats(folded),
  ]);

  for (const variant of variants) {
    if (SAFE.has(variant)) continue;
    if (EXACT.has(variant)) return true;
    if (STEMS.some((stem) => variant.startsWith(stem))) return true;
  }

  return false;
}

export function containsProfanity(text: string): boolean {
  if (!text) return false;

  // Harf ve rakam dışındaki her şey ayraç sayılır; böylece "a.m.k" ve
  // "s-i-k-t-i-r" gibi kaçamaklar da parçalanıp tek tek değerlendirilir.
  const words = text.split(/[^\p{L}\p{N}]+/u).filter(Boolean);

  if (words.some(isProfaneWord)) return true;

  // Noktalama ile bölünmüş kaçamaklar: "a.m.k" → "amk"
  const squashed = normalizeWord(text.replace(/[^\p{L}\p{N}]+/gu, ''));
  if (squashed.length <= 24) {
    const folded = foldTurkish(squashed);
    if (EXACT.has(squashed) || EXACT.has(folded)) return true;
  }

  return false;
}
