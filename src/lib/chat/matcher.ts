import type { Language } from '@/i18n/translations';
import { projects } from '@/data/portfolio';
import { normalize, tokenize, phraseMatch } from './normalize';
import { ENTITY_INTENTS, scoreIntents, intentOrder, type EntityIntentId } from './intents';
import { entities, findEntity, answerAbout, type Entity, type Answer } from './knowledge';
import { generalAnswers, fallbackAnswer, quickReplies, type SectionId } from './responses';
import { emptyContext, type ConversationContext } from './context';

/*
  Eşleştirici: mesajı anlayıp cevaba bağlayan kısım. Model yok.

  1. Mesaj normalleştirilir (Türkçe karakterler, büyük/küçük harf).
  2. Varlık aranır: hangi proje ya da şirketten bahsediliyor?
  3. Niyetler puanlanır: ne isteniyor? (intents.ts)
  4. İkisi birleştirilir:
     · varlık + varlık niyeti   → "WeatherApp'in linki" → o projenin reposu
     · yalnızca varlık          → projenin özeti; ama "peki Meme File?"
                                  ise bir önceki niyet yeni varlığa uygulanır
     · yalnızca varlık niyeti   → "onun linki?" son konuşulan varlık;
                                  bağlam yoksa genel karşılığı ("GitHub" →
                                  sosyal hesaplar, "teknolojiler" → yetenekler)
     · genel niyet              → hazır cevap
  5. Puan eşiğin altındaysa uydurmuyor: "şunu mu demek istedin?" ya da
     açıkça "bilmiyorum".

  Davranış src/lib/chat/bot.test.ts'teki altın test setiyle ölçülüyor.
*/

export type { ConversationContext } from './context';

export interface MatchResult {
  response: string;
  showOptions: boolean;
  autoScrollDelay?: number;
  sectionId?: SectionId;
  context: ConversationContext;
  /** Bu yanıttan sonra gösterilecek takip konuları */
  suggests?: string[];
  /** Anlaşılan niyet ve varlık: testler ve kayıt için */
  intent: string;
  entity?: string;
}

const MIN_SCORE = 0.7;

/** Sohbet nezaketi: başka bir soruyla birlikte gelirse soruya öncelik verilir */
const SMALL_TALK = new Set(['greet', 'howareyou', 'thanks', 'bye']);

/** Varlık söylenmeden sorulan varlık niyetlerinin genel karşılıkları */
const GENERAL_FALLBACK: Partial<Record<EntityIntentId, string>> = {
  link: 'socials',
  tech: 'skills',
  result: 'hire',
  approach: 'workstyle',
  problem: 'hardest',
  detail: 'info',
};

/** Genel niyetin öneri düğmesi anahtarı (topicCatalog) */
const INTENT_TOPIC: Record<string, string> = {
  about: 'hakkinda', projects: 'projeler', skills: 'yetenekler', experience: 'deneyim',
  education: 'egitim', contact: 'iletisim', ai: 'ai', mobile: 'mobil', biology: 'biyoloji',
  location: 'konum', hobby: 'hobi', philosophy: 'motivasyon', availability: 'musaitlik',
  hire: 'neden', hardest: 'zorluk', workstyle: 'calisma', cv: 'cv', whynollm: 'nollm',
};

const SHOW_OPTIONS = new Set(['greet', 'help', 'info']);

const FOLLOW_UP_STARTS = ['peki', 'ya', 'and', 've', 'what about', 'how about'];
const PRONOUNS = new Set(['onun', 'onu', 'ona', 'bunun', 'bunu', 'it', 'its', 'that', 'this', 'projenin', 'uygulamanin', 'sirketin']);

const isEntityIntent = (id: string | null | undefined): id is EntityIntentId =>
  !!id && (ENTITY_INTENTS as readonly string[]).includes(id);

/** Mesajda geçen en güçlü varlık */
function detectEntity(tokens: string[]): Entity | null {
  let best: Entity | null = null;
  let bestScore = 0;
  for (const entity of entities) {
    for (const alias of entity.aliases) {
      // Uzun takma ad daha belirleyici: "meme file", tek başına "meme"yi yener
      const score = phraseMatch(tokens, alias) * (1 + 0.1 * (alias.length - 1));
      if (score > bestScore) {
        bestScore = score;
        best = entity;
      }
    }
  }
  return bestScore >= MIN_SCORE ? best : null;
}

function topIntent(scores: Map<string, number>, ids: readonly string[]): { id: string; score: number } | null {
  let best: { id: string; score: number } | null = null;
  // Eşitlikte intentOrder'daki sıra kazanır (ör. "selam nasılsın" → nasılsın)
  for (const id of intentOrder) {
    if (!ids.includes(id)) continue;
    const score = scores.get(id) ?? 0;
    if (score > 0 && (!best || score > best.score)) best = { id, score };
  }
  return best;
}

function finish(
  answer: Answer,
  context: ConversationContext,
  intent: string,
  entity: Entity | null,
  topic: string | null
): MatchResult {
  // Sohbet nezaketi ("teşekkürler") konuşulan projeyi unutturmasın
  const keepEntity = SMALL_TALK.has(intent) ? context.lastEntity : null;
  const nextContext: ConversationContext = {
    lastTopic: topic,
    recentTopics: topic ? [...context.recentTopics.slice(-4), topic] : context.recentTopics,
    lastEntity: entity?.id ?? keepEntity,
    lastIntent: intent,
  };
  // Az önce konuşulanı tekrar önermenin anlamı yok
  const recent = nextContext.recentTopics.slice(-2);
  const filtered = (answer.suggests ?? []).filter((key) => key !== topic && !recent.includes(key));
  return {
    response: answer.text,
    showOptions: SHOW_OPTIONS.has(intent),
    sectionId: answer.sectionId,
    context: nextContext,
    suggests: filtered.length > 0 ? filtered : answer.suggests,
    intent,
    entity: entity?.id,
  };
}

function entityResult(lang: Language, entity: Entity, intent: EntityIntentId, context: ConversationContext): MatchResult {
  return finish(answerAbout(lang, entity, intent), context, intent, entity, entity.id);
}

function generalResult(lang: Language, intent: string, context: ConversationContext): MatchResult {
  return finish(generalAnswers[intent](lang), context, intent, null, INTENT_TOPIC[intent] ?? null);
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
      intent: 'empty',
    };
  }

  // Hızlı yanıt numarası ("3")
  if (/^[1-5]$/.test(trimmed)) {
    const quick = quickReplies.find((item) => item.id === trimmed);
    if (quick) {
      return {
        response: quick.response[lang],
        showOptions: false,
        autoScrollDelay: quick.autoScrollDelay,
        sectionId: quick.sectionId,
        context,
        intent: `quick:${quick.id}`,
      };
    }
  }

  const normalized = normalize(trimmed);
  const tokens = tokenize(normalized);
  const scores = scoreIntents(tokens);
  const entity = detectEntity(tokens);

  const generalIds = intentOrder.filter((id) => !isEntityIntent(id));
  const specific = topIntent(scores, ENTITY_INTENTS.filter((id) => id !== 'detail'));
  const detail = topIntent(scores, ['detail']);

  let general = topIntent(scores, generalIds);
  // "Merhaba, projelerin neler?" → selam değil, soru cevaplanır
  if (general && SMALL_TALK.has(general.id)) {
    const substantive = topIntent(scores, generalIds.filter((id) => !SMALL_TALK.has(id)));
    if (substantive && substantive.score >= MIN_SCORE) general = substantive;
  }

  const isFollowUp = FOLLOW_UP_STARTS.some((start) => normalized === start || normalized.startsWith(`${start} `));
  const hasPronoun = tokens.some((token) => PRONOUNS.has(token));

  // ─── A. Bir proje ya da şirketten bahsediliyor ─────────────
  if (entity) {
    if (specific && specific.score >= MIN_SCORE) {
      return entityResult(lang, entity, specific.id as EntityIntentId, context);
    }
    // "peki Meme File?" → bir önceki soru, yeni konu
    if (isFollowUp && isEntityIntent(context.lastIntent)) {
      return entityResult(lang, entity, context.lastIntent, context);
    }
    return entityResult(lang, entity, 'detail', context);
  }

  // ─── B. Varlık yok ama varlığa dair bir şey soruluyor ──────
  const asked =
    specific && specific.score >= MIN_SCORE
      ? specific
      : detail && detail.score >= MIN_SCORE && hasPronoun
        ? detail
        : null;
  if (asked) {
    const id = asked.id as EntityIntentId;
    const target = findEntity(context.lastEntity);
    const generalScore = general?.score ?? 0;

    // Genel niyet, sorulanın bağlamsız karşılığı olabilir: WeatherApp'ten
    // sonra "hangi teknolojiler" yetenekler listesi değil, WeatherApp'inkiler
    const generalIsGeneric = general?.id === GENERAL_FALLBACK[id];

    // "onun linki?", "teknolojileri neler?" → son konuşulan proje
    if (target && (hasPronoun || tokens.length <= 4) && (asked.score >= generalScore || generalIsGeneric)) {
      return entityResult(lang, target, id, context);
    }

    // Tek bir indirilebilir proje varsa "indir" onu kastediyor; ama
    // "özgeçmişini indir" gibi daha güçlü bir soru varsa o değil
    if (id === 'download' && asked.score > generalScore) {
      const downloadable = projects.filter((p) => p.download);
      const only = downloadable.length === 1 ? findEntity(downloadable[0].id) : null;
      if (only) return entityResult(lang, only, 'download', context);
    }

    const fallback = GENERAL_FALLBACK[id];
    if (fallback && asked.score >= generalScore) return generalResult(lang, fallback, context);
  }

  // ─── C. Genel soru ─────────────────────────────────────────
  if (general && general.score >= MIN_SCORE) {
    return generalResult(lang, general.id, context);
  }

  // ─── D. Anlaşılamadı: uydurmak yok ─────────────────────────
  const guesses = [...scores.entries()]
    .filter(([id]) => INTENT_TOPIC[id])
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => INTENT_TOPIC[id])
    .slice(0, 3);
  const answer = fallbackAnswer(lang, guesses);
  return {
    response: answer.text,
    showOptions: false,
    context,
    suggests: answer.suggests,
    intent: 'fallback',
  };
}
