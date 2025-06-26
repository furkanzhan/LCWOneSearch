import { NextRequest, NextResponse } from 'next/server';
import { fetchChatResponse } from '@/lib/openai';
import { createSystemMessage, createUserMessage, type ChatMessage } from '@/lib/helpers';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Geçerli bir mesaj gerekli' },
        { status: 400 }
      );
    }

    const messages: ChatMessage[] = [
      createSystemMessage(
        'Sen yardımcı bir AI asistanısın. Türkçe yanıt ver ve kullanıcıya nazik bir şekilde yardım et. LCW OneSearch uygulamasının bir parçasısın.'
      ),
      createUserMessage(message),
    ];

    const response = await fetchChatResponse(messages);

    return NextResponse.json({ message: response });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    );
  }
} 