import { NextRequest, NextResponse } from 'next/server';
import { findBestMatch } from '@/lib/chat/matcher';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Mesaj gereklidir.' },
        { status: 400 }
      );
    }

    const result = findBestMatch(message);

    // Yanıt uzunluğuna göre simüle edilmiş typing delay (ms)
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
      { error: 'Bir hata olustu.' },
      { status: 500 }
    );
  }
}
