import { NextRequest, NextResponse } from 'next/server';
import { findBestMatch } from '@/lib/chat/matcher';
import { getQuickReplyById } from '@/lib/chat/responses';
import { containsProfanity } from '@/lib/chat/profanity';
import type { Language } from '@/context/LanguageContext';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, lang, quickReplyId } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Mesaj gereklidir.' },
        { status: 400 }
      );
    }

    const currentLang: Language = lang === 'en' ? 'en' : 'tr';

    // Argo/küfür kontrolü
    if (containsProfanity(message)) {
      return NextResponse.json({
        response: currentLang === 'en'
          ? 'Error 403: No manners found. Please update your dictionary and try again.'
          : 'Hata 403: Terbiye bulunamadı. Lütfen lügatini güncelleyip tekrar dene.',
        showOptions: false,
        profanityDetected: true,
      });
    }

    // Eğer quickReplyId geldiyse, doğrudan o quick reply'nin yanıtını ver
    if (quickReplyId) {
      const quickReply = getQuickReplyById(quickReplyId);
      if (quickReply) {
        const response = quickReply.response[currentLang];
        const responseLength = response.length;
        const typingDelay = Math.min(300 + responseLength * 3, 2000);

        return NextResponse.json({
          response,
          showOptions: false,
          autoScrollDelay: quickReply.autoScrollDelay || 2000,
          typingDelay,
          timestamp: new Date().toISOString(),
        });
      }
    }

    const result = findBestMatch(message, currentLang);

    const responseLength = result.response.length;
    const typingDelay = Math.min(300 + responseLength * 3, 2000);

    return NextResponse.json({
      response: result.response,
      showOptions: result.showOptions,
      autoScrollDelay: result.autoScrollDelay,
      typingDelay,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu.' },
      { status: 500 }
    );
  }
}
