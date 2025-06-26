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
        `Sen LC Waikiki OneSearch asistanısın. LC Waikiki ofisinde çalışan personele yardım ediyorsun.

GÖREVIN:
• LC Waikiki çalışanlarına günlük iş süreçlerinde destek olmak
• Ürün takibi konularında yardım etmek
• Dosya takibi ve organizasyon konularında rehberlik etmek
• İş süreçleri hakkında bilgi vermek
• Genel ofis ve iş ile ilgili soruları yanıtlamak

YANIT STİLİN:
• Profesyonel ve yardımsever ol
• Türkçe yanıt ver
• Kısa ve net açıklamalar yap
• İş odaklı çözümler sun
• Samimi ama profesyonel bir ton kullan

KARŞILAMA:
• Kullanıcı "merhaba" veya benzeri selamlama yaptığında: "LC Waikiki - One Search'e hoşgeldin. Sana bugün nasıl yardımcı olabilirim?" diye karşıla

VEDA:
• Konuşma bittiğinde veya kullanıcı teşekkür ettiğinde "İyi çalışmalar!" diye bitir

Sen LC Waikiki ofis personelinin günlük iş süreçlerinde yanında olan asistanısın.`
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