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

    // Kullanıcı mesajını ekle
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
      // Prepare messages for API call
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
        // Add all previous text messages to maintain context
        ...messages.filter(msg => msg.text).map((msg) => ({
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.text!,
        })),
      ];

      // Mevcut mesaj için content hazırla
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

      // Call the API
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
    <div className="w-full max-w-4xl flex flex-col bg-[#1c2938] min-h-screen">
      {/* Arama Çubuğu */}
      <div className="w-full mb-10 flex justify-center items-center">
        <div className="flex items-center bg-white rounded-full shadow-md">
          <ChatInput 
            onSend={sendMessageToOpenAI} 
            disabled={isLoading} 
            placeholder="Size nasıl yardımcı olabilirim?" 
          />
        </div>
      </div>

      {/* Chat Container - Messenger Tarzı */}
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 w-[900px] min-h-[600px] rounded-2xl mx-auto shadow-xl border border-gray-200 flex flex-col">
        
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">LC Waikiki OneSearch Asistan</h2>
              <p className="text-sm text-gray-500">
                {isLoading ? 'Yazıyor...' : 'Ofis personeli için yardımcı asistan'}
              </p>
            </div>
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="text-gray-400 hover:text-gray-600 text-sm px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Sohbeti Temizle
              </button>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-6 overflow-y-auto max-h-[500px]">
          {messages.length === 0 ? (
            /* Boş durum */
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="bg-blue-50 p-6 rounded-full mb-4">
                <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">LC Waikiki OneSearch Asistan</h3>
              <p className="text-gray-500">Ürün takibi, dosya yönetimi ve iş süreçleri için yardımcınız</p>
              
              {/* Öneri Butonları */}
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <button 
                  onClick={() => sendMessageToOpenAI({ text: 'Merhaba' })}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                >
                  👋 Merhaba
                </button>
                <button 
                  onClick={() => sendMessageToOpenAI({ text: 'Ürün takibi nasıl yapılır?' })}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                >
                  📦 Ürün Takibi
                </button>
                <button 
                  onClick={() => sendMessageToOpenAI({ text: 'Dosya yönetimi hakkında bilgi' })}
                  className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition-colors"
                >
                  📁 Dosya Yönetimi
                </button>
              </div>
            </div>
          ) : (
            /* Mesajlar */
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  
                  {/* AI Avatar */}
                  {msg.sender === 'assistant' && (
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`max-w-[70%] ${msg.sender === 'user' ? 'order-1' : 'order-2'}`}>
                    <div className={`px-4 py-3 rounded-2xl ${
                      msg.sender === 'user' 
                        ? 'bg-blue-500 text-white rounded-br-md' 
                        : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md'
                    }`}>
                      
                      {/* Image */}
                      {msg.image && (
                        <div className="mb-3">
                          <Image 
                            src={msg.image} 
                            alt="Yüklenen görsel" 
                            width={200}
                            height={150}
                            className="object-cover rounded-lg" 
                          />
                        </div>
                      )}
                      
                      {/* Text */}
                      {msg.text && (
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.text}
                        </div>
                      )}
                    </div>
                    
                    {/* Timestamp */}
                    <div className={`text-xs text-gray-400 mt-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* User Avatar */}
                  {msg.sender === 'user' && (
                    <div className="flex-shrink-0 ml-3 order-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                      </svg>
                    </div>
                  </div>
                  <div className="bg-white text-gray-800 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-gray-500 text-sm">Yazıyor...</span>
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