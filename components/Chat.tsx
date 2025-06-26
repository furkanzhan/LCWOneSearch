'use client';

import { useState } from 'react';
import Image from 'next/image';
import { fetchChatResponse } from '@/lib/openai';
import { createSystemMessage, type ChatMessage } from '@/lib/helpers';
import ChatInput from './ChatInput';

interface Message {
  id: string;
  text?: string;
  image?: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessageToOpenAI = async (data: { text: string; image?: string }) => {
    if ((!data.text.trim() && !data.image) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: data.text,
      image: data.image,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const apiMessages: ChatMessage[] = [
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
        ...messages.filter(msg => msg.text).map((msg) => ({
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.text!,
        })),
      ];

      if (data.text || data.image) {
        const content: Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }> = [];
        
        if (data.text) {
          content.push({ type: 'text', text: data.text });
        }
        
        if (data.image) {
          content.push({ 
            type: 'image_url', 
            image_url: { url: data.image } 
          });
        }
        
        apiMessages.push({
          role: 'user',
          content: content
        });
      }

      const response = await fetchChatResponse(apiMessages);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#1c2938] min-h-screen flex flex-col">
      
      {/* Chat Input Alanı */}
      <div className="p-6">
        <ChatInput 
          onSend={sendMessageToOpenAI} 
          disabled={isLoading} 
          placeholder="Size nasıl yardımcı olabilirim?" 
        />
      </div>

      {/* Chat Mesajları */}
      <div className="flex-1 bg-white mx-6 mb-6 rounded-xl shadow-lg">
        
        {/* Chat Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">LC Waikiki OneSearch</h2>
              <p className="text-blue-100 text-sm">Ofis Asistanı</p>
            </div>
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="text-blue-100 hover:text-white px-3 py-1 rounded hover:bg-blue-500 transition-colors text-sm"
              >
                Temizle
              </button>
            )}
          </div>
        </div>

        {/* Mesajlar Alanı */}
        <div className="h-96 overflow-y-auto p-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-lg">Sohbet başlatmak için bir mesaj yazın</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.sender === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}>
                    
                    {msg.image && (
                      <div className="mb-2">
                        <Image 
                          src={msg.image} 
                          alt="Yüklenen görsel" 
                          width={200}
                          height={150}
                          className="rounded object-cover" 
                        />
                      </div>
                    )}
                    
                    {msg.text && (
                      <p className="text-sm">{msg.text}</p>
                    )}
                    
                    <p className={`text-xs mt-1 ${
                      msg.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                    }`}>
                      {msg.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-sm text-gray-500">Yazıyor...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 