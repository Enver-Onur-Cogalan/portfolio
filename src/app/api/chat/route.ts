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

    return NextResponse.json({
      response: result.response,
      showOptions: result.showOptions,
      autoScrollDelay: result.autoScrollDelay,
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
