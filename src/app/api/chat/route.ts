import { NextRequest, NextResponse } from 'next/server';
import { findBestMatch, sanitizeContext, emptyContext } from '@/lib/chat/matcher';
import { topicCatalog, pathTopics, type VisitorPath } from '@/lib/chat/responses';
import { containsProfanity } from '@/lib/chat/profanity';
import { translate, type Language } from '@/i18n/translations';

const MAX_MESSAGE_LENGTH = 500;

// ─── Basit hız sınırı ────────────────────────────────────────
// Bellekte tutulur; sunucusuz ortamda örnek başına çalışır. Amaç
// bir saldırıyı durdurmak değil, tek bir istemcinin uç noktayı
// gereksiz yere dövmesini engellemek.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 40;
const requestLog = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = requestLog.get(key);

  if (!entry || now > entry.resetAt) {
    requestLog.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });

    // Süresi dolmuş kayıtları ara sıra temizle
    if (requestLog.size > 500) {
      for (const [k, v] of requestLog) {
        if (now > v.resetAt) requestLog.delete(k);
      }
    }
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

// Yanıt uzunluğuna göre doğal duran bir "yazıyor..." süresi
function typingDelayFor(response: string): number {
  return Math.min(300 + response.length * 3, 2000);
}

/** Konu anahtarlarını istemcinin gösterebileceği düğmelere çevirir. */
function toSuggestions(topics: string[] | undefined, lang: Language) {
  if (!topics) return [];
  return topics
    .filter((id) => topicCatalog[id])
    .slice(0, 4)
    .map((id) => ({ id, label: topicCatalog[id].label[lang], query: topicCatalog[id].query }));
}

function isVisitorPath(value: unknown): value is VisitorPath {
  return value === 'hiring' || value === 'technical' || value === 'browsing';
}

export async function POST(request: NextRequest) {
  let lang: Language = 'tr';

  try {
    const body = await request.json();
    const { message } = body;
    lang = body.lang === 'en' ? 'en' : 'tr';

    if (isRateLimited(clientKey(request))) {
      return NextResponse.json(
        { response: translate(lang, 'chat.rateLimited'), showOptions: false },
        { status: 429 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: lang === 'en' ? 'Message is required.' : 'Mesaj gereklidir.' },
        { status: 400 }
      );
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json({
        response: translate(lang, 'chat.tooLong'),
        showOptions: false,
      });
    }

    if (containsProfanity(message)) {
      return NextResponse.json({
        response: translate(lang, 'chat.profanity'),
        showOptions: false,
        profanityDetected: true,
      });
    }

    // Bağlam istemcide saklanıp her istekle geliyor — sunucuda global
    // durum tutulmuyor, böylece ziyaretçiler birbirini etkilemiyor.
    const context = sanitizeContext(body.context);

    // Ziyaretçi geliş amacını seçtiyse ona uygun başlangıç konuları
    const visitorPath: unknown = body.visitorPath;
    if (isVisitorPath(visitorPath) && body.pathIntro === true) {
      return NextResponse.json({
        response: translate(lang, `chat.path.${visitorPath}.intro`),
        showOptions: false,
        suggestions: toSuggestions(pathTopics[visitorPath], lang),
        typingDelay: 600,
        context,
      });
    }

    const result = findBestMatch(message, lang, context);

    return NextResponse.json({
      response: result.response,
      showOptions: result.showOptions,
      autoScrollDelay: result.autoScrollDelay,
      sectionId: result.sectionId,
      suggestions: toSuggestions(result.suggests, lang),
      typingDelay: typingDelayFor(result.response),
      context: result.context,
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { response: translate(lang, 'chat.error'), showOptions: false, context: emptyContext },
      { status: 500 }
    );
  }
}
