/*
  Metni karşılaştırılabilir hâle getirme ve kelime eşleştirme.

  Kurallar bilerek basit: model yok, kütüphane yok. Türkçe için önemli
  iki şey var: büyük/küçük harf (İ/I) ve ekler ("projelerini" →
  "proje"). Yazım hataları için küçük bir düzenleme mesafesi yetiyor;
  eskiden bunun için Fuse.js vardı ve tarayıcı paketine ~8 KB ekliyordu.
*/

const FOLD: Record<string, string> = {
  ş: 's', ç: 'c', ğ: 'g', ü: 'u', ö: 'o', ı: 'i', â: 'a', î: 'i', û: 'u',
};

/** Küçük harf, Türkçe karakterler ASCII'ye, fazla boşluk tek boşluğa. */
export function normalize(text: string): string {
  return text
    .replace(/İ/g, 'i')
    .replace(/I/g, 'i')
    .toLowerCase()
    .replace(/[şçğüöıâîû]/g, (char) => FOLD[char] ?? char)
    .replace(/[’`´]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/** Harf ve rakam dizileri. Kesme işareti ayırır: "weatherapp'in" → weatherapp, in */
export function tokenize(normalized: string): string[] {
  return normalized.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
}

/** İki kelime arasındaki düzenleme mesafesi; sınırı aşınca erken çıkar. */
export function editDistance(a: string, b: string, limit = 2): number {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
      rowMin = Math.min(rowMin, current[j]);
    }
    if (rowMin > limit) return limit + 1;
    previous = current;
  }
  return previous[b.length];
}

/**
 * Bir kelimenin bir anahtar kelimeyle ne kadar eşleştiği (0–1).
 *
 * - birebir: 1
 * - ek almış: "projelerini" ⊇ "proje" (anahtar en az 4 harf): 0.85.
 *   Türkçe ünsüz yumuşaması da sayılıyor: "meslek" → "mesleğin",
 *   "kitap" → "kitabı" (normalleştirilmiş hâlde ğ → g).
 * - yazım hatası: 6+ harfte 1, 9+ harfte 2 harf fark: 0.7. Daha kısa
 *   kelimelerde tolerans yanlış eşleşme üretiyordu ("there" → "where").
 *
 * Kısa kelimeler yalnızca birebir eşleşiyor; "ai" gibi iki harfli bir
 * anahtar "aile"nin başında gizlenmesin.
 */
const SOFTENED: Record<string, string> = { k: 'g', p: 'b', t: 'd', c: 'c' };

/*
  2–3 harfli anahtarlar ("cv", "kod", "bot") serbest önek eşleşmesine
  kapalı; yoksa "ai" "aile"nin içinde bulunurdu. Ama Türkçe bunlara da ek
  getiriyor: "cvni", "kodu", "botun". Yalnızca bu yaygın ekler kabul.
*/
const SHORT_SUFFIXES = new Set([
  'i', 'u', 'ı', 'yi', 'yu', 'ni', 'nu', 'si', 'su', 'in', 'un', 'nin', 'nun', 'yin', 'yun',
  'de', 'da', 'te', 'ta', 'den', 'dan', 'ten', 'tan', 'ye', 'ya', 'e', 'a',
  'ler', 'lar', 'leri', 'lari', 'le', 'la', 'yle', 'yla', 'mi', 'mu', 'imi', 'umu', 'umuz', 'imiz',
]);

export function wordMatch(word: string, keyword: string): number {
  if (word === keyword) return 1;
  if (keyword.length >= 4) {
    if (word.startsWith(keyword)) return 0.85;
    const soft = SOFTENED[keyword[keyword.length - 1]];
    if (soft && word.length > keyword.length && word.startsWith(keyword.slice(0, -1) + soft)) return 0.85;
  } else if (keyword.length >= 2 && word.startsWith(keyword) && SHORT_SUFFIXES.has(word.slice(keyword.length))) {
    return 0.85;
  }
  if (keyword.length >= 6 && word.length >= 5) {
    const limit = keyword.length >= 9 ? 2 : 1;
    // Tek başına bir yazım hatası eşleşmesi cevap tetiklemesin (eşik
    // 0.7), yalnızca başka bir eşleşmeye katkı versin: "aralar"
    // "araçlar" sanılıp yetenek listesi açılıyordu. Uzun kelimelerde
    // (ör. "wetherapp") yanlış alarm ihtimali düşük, tam güç.
    if (editDistance(word, keyword, limit) <= limit) return keyword.length >= 9 ? 0.7 : 0.6;
  }
  return 0;
}

/**
 * Bir anahtar ifadenin mesajda geçip geçmediği (0–1). Çok kelimeli
 * ifadelerde her kelime sırayla eşleşmeli; "weather app" ile
 * "weather appin" de eşleşir.
 */
export function phraseMatch(tokens: string[], phrase: string[]): number {
  if (phrase.length === 1) {
    let best = 0;
    for (const token of tokens) best = Math.max(best, wordMatch(token, phrase[0]));
    return best;
  }
  for (let start = 0; start + phrase.length <= tokens.length; start++) {
    let total = 0;
    let ok = true;
    for (let k = 0; k < phrase.length; k++) {
      const score = wordMatch(tokens[start + k], phrase[k]);
      if (score === 0) {
        ok = false;
        break;
      }
      total += score;
    }
    if (ok) return total / phrase.length;
  }
  return 0;
}
