/*
  Konuşma bağlamı.

  Ayrı bir dosyada, çünkü sohbet penceresi (tarayıcı) bunu import ediyor.
  Eskiden eşleştiriciden geliyordu ve onunla birlikte arama kütüphanesi
  de tarayıcı paketine giriyordu; pencerenin ihtiyacı yalnızca bu tip ve
  boş başlangıç değeri.

  Bağlam sunucuda tutulmuyor: istemcide yaşıyor, her istekle gidip
  geliyor. Sunucuda global bir değişken olsaydı bir ziyaretçinin son
  konusu başka bir ziyaretçinin cevabını etkilerdi.
*/

export interface ConversationContext {
  /** Son cevabın konusu (öneri düğmelerini tekrar etmemek için) */
  lastTopic: string | null;
  recentTopics: string[];
  /** Son konuşulan proje/şirket: "onun linki?" sorusunu çözmek için */
  lastEntity: string | null;
  /** Son niyet: "peki Meme File?" sorusunda aynı şeyi yeni konuya uygulamak için */
  lastIntent: string | null;
}

export const emptyContext: ConversationContext = {
  lastTopic: null,
  recentTopics: [],
  lastEntity: null,
  lastIntent: null,
};

const shortString = (value: unknown): string | null =>
  typeof value === 'string' && value.length > 0 ? value.slice(0, 32) : null;

/** Dışarıdan gelen bağlamı güvenli hale getirir: API'ye ne geldiği belli olmaz. */
export function sanitizeContext(input: unknown): ConversationContext {
  if (!input || typeof input !== 'object') return emptyContext;
  const raw = input as Record<string, unknown>;
  const recentTopics = Array.isArray(raw.recentTopics)
    ? raw.recentTopics
        .map(shortString)
        .filter((topic): topic is string => topic !== null)
        .slice(-5)
    : [];
  return {
    lastTopic: shortString(raw.lastTopic),
    recentTopics,
    lastEntity: shortString(raw.lastEntity),
    lastIntent: shortString(raw.lastIntent),
  };
}
