'use client';

import { useState } from 'react';
import { fetchChatResponse } from '@/lib/openai';
import { createSystemMessage, createUserMessage, type ChatMessage } from '@/lib/helpers';
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
          'Sen LC Waikiki OneSearch\'ün AI asistanısın. Kullanıcılara ürün arama, moda önerileri ve alışveriş konularında yardım ediyorsun. Türkçe yanıt ver ve samimi, dostane bir ton kullan.'
        ),
        // Add all previous text messages to maintain context
        ...messages.filter(msg => msg.text).map((msg) => ({
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.text!,
        })),
      ];

      // Mevcut mesaj için content hazırla
      if (data.text || data.image) {
        const content: any[] = [];
        
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
            placeholder="Ne arıyorsunuz?" 
          />
        </div>
      </div>

      {/* Chat Sayfası - Her zaman görünür */}
      <div className="bg-white w-[800px] min-h-[500px] p-8 rounded-[30px] mx-auto shadow-lg flex-1">
        {messages.length === 0 ? (
          /* Boş durum - henüz mesaj yok */
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Konuşmaya başlamak için bir mesaj yazın...</p>
          </div>
        ) : (
          /* Mesajlar var - özel pencere içinde */
          <div className="bg-gray-50 border-2 border-gray-200 rounded-[20px] p-6 min-h-[400px] max-h-[600px] w-full overflow-y-auto">
            <div className="pt-8 pb-8">
              {messages.map((msg, index) => (
                <div key={msg.id} className="mb-6 mt-6">
                  {msg.sender === 'user' ? (
                    /* Kullanıcı Sorusu - Sağda */
                    <div className="flex justify-end pr-4">
                      <div className="bg-[#1c2938] text-white p-4 rounded-[20px] max-w-[60%]">
                        {msg.image && (
                          <div className="mb-2">
                            <img 
                              src={msg.image} 
                              alt="Yüklenen görsel" 
                              className="max-w-[200px] max-h-[150px] object-cover rounded-lg" 
                            />
                          </div>
                        )}
                        {msg.text && (
                          <div className="whitespace-pre-wrap text-sm">{msg.text}</div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* AI Cevabı - Solda */
                    <div className="flex justify-start pl-4">
                      <div className="bg-[#1c2938] text-white p-4 rounded-[20px] max-w-[70%]">
                        {msg.text && (
                          <div className="whitespace-pre-wrap text-sm">{msg.text}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="mb-6 mt-6">
                  <div className="bg-[#1c2938] text-white p-4 rounded-[20px] max-w-[70%] mr-auto">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-gray-200 text-sm">Yazıyor...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 