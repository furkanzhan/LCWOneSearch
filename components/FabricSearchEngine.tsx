"use client"
import { useState } from "react"
import { fetchChatResponse } from '@/lib/openai';
import { createSystemMessage, type ChatMessage } from '@/lib/helpers';

// Basit SVG İkonları
const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const LoaderIcon = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0V9a8 8 0 1115.356 2m-15.356-2L9 3" />
  </svg>
);

interface Message {
  id: string;
  text?: string;
  image?: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export default function FabricSearchEngine() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        const base64 = await convertToBase64(file);
        setSelectedImage(base64);
      } catch (error) {
        console.error('Error:', error);
      }
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim() && !selectedImage) return;

    setIsLoading(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: searchQuery || "Bu görselde ne görüyorsun?",
      image: selectedImage || undefined,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const apiMessages: ChatMessage[] = [
        createSystemMessage(
          'Sen LC Waikiki OneSearch\'ün AI asistanısın. Kullanıcılara ürün arama, moda önerileri ve alışveriş konularında yardım ediyorsun. Türkçe yanıt ver ve kısa, net cevaplar ver.'
        ),
        ...messages.filter(msg => msg.text).map((msg) => ({
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.text!,
        })),
      ];

      if (userMessage.text || userMessage.image) {
        const content: any[] = [];
        
        if (userMessage.text) {
          content.push({ type: 'text', text: userMessage.text });
        }
        
        if (userMessage.image) {
          content.push({ 
            type: 'image_url', 
            image_url: { url: userMessage.image } 
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
      setSearchQuery("");
      setSelectedImage(null);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  }

  return (
    <div className="min-h-screen bg-[#1e2a38] text-white">
      <div className="container mx-auto px-4 py-12">
        
        {/* Logo */}
        <div className="text-center mb-12">
          <img
            src="/logo.png"
            alt="LCW OneSearch"
            className="w-[250px] h-auto mx-auto mb-4"
          />
          <p className="text-gray-300 text-lg">AI destekli ürün arama</p>
        </div>

        {/* Ana Arama Kutusu */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white rounded-full p-2 shadow-lg">
            <div className="flex items-center gap-2">
              
              {/* Görsel Yükleme */}
              <label className="cursor-pointer p-3 hover:bg-gray-100 rounded-full transition-colors">
                <PlusIcon />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {/* Arama Input */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ne arıyorsunuz?"
                className="flex-1 px-4 py-3 text-gray-800 bg-transparent outline-none text-lg"
                disabled={isLoading}
              />

              {/* Arama Butonu */}
              <button
                onClick={handleSearch}
                disabled={isLoading || (!searchQuery.trim() && !selectedImage)}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white p-3 rounded-full transition-colors"
              >
                {isLoading ? <LoaderIcon /> : <SearchIcon />}
              </button>
            </div>
          </div>

          {/* Yüklenen Görsel Önizleme */}
          {selectedImage && (
            <div className="mt-4 text-center">
              <div className="inline-block relative">
                <img
                  src={selectedImage}
                  alt="Önizleme"
                  className="max-w-[200px] max-h-[150px] object-cover rounded-lg shadow-md"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mesajlar */}
        {messages.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Arama Sonuçları</h2>
                <button
                  onClick={() => setMessages([])}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Temizle
                </button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-lg ${
                      msg.sender === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {msg.image && (
                        <div className="mb-2">
                          <img 
                            src={msg.image} 
                            alt="Görsel" 
                            className="max-w-[150px] max-h-[100px] object-cover rounded" 
                          />
                        </div>
                      )}
                      {msg.text && (
                        <div className="text-sm leading-relaxed">{msg.text}</div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <LoaderIcon />
                        <span className="text-sm">Analiz ediliyor...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
} 