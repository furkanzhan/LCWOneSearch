'use client';

import { useState, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (data: { text: string; image?: string }) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({ 
  onSend, 
  disabled = false, 
  placeholder = "Ne arıyorsunuz?",
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleSubmit = () => {
    if ((!input.trim() && !selectedImage) || disabled) return;

    // Hem metin hem de görsel gönder
    onSend({
      text: input.trim(),
      image: selectedImage || undefined
    });

    // Temizle
    setInput('');
    setSelectedImage(null);
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await convertToBase64(file);
      setSelectedImage(base64);
    } catch (error) {
      console.error('Error converting file to base64:', error);
    }
    
    // File input'u temizle
    e.target.value = '';
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Görsel Önizleme */}
      {selectedImage && (
        <div className="mb-4 relative">
          <img 
            src={selectedImage} 
            alt="Yüklenecek görsel" 
            className="max-w-[200px] max-h-[120px] object-cover rounded-lg shadow-md"
          />
          <button
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
          >
            ×
          </button>
        </div>
      )}

      {/* Giriş Alanı */}
      <div className="rounded-[40px] bg-red-200 p-[25px] h-[250px] mt-6 w-[700px] mx-auto">
        <div className="flex items-center h-full">
          {/* + Butonu */}
          <div className="w-[40px] flex justify-center bg-yellow-200">
            <label className="text-[32px] cursor-pointer px-3 bg-blue-200 rounded-full w-12 h-12 flex items-center justify-center">
              +
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Input Alanı */}
          <div className="flex-1 bg-purple-200 px-8">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full outline-none text-lg text-black placeholder:text-gray-400 bg-green-200 px-4 rounded-lg h-[40px]"
              disabled={disabled}
            />
          </div>
          
          {/* Gönder Butonu */}
          <div className="w-[100px] flex justify-center bg-orange-200">
            <button
              onClick={handleSubmit}
              disabled={disabled || (!input.trim() && !selectedImage)}
              className="rounded-full bg-gradient-to-b from-[#62b6e6] to-[#4986cb] text-white w-[80px] h-[80px] text-center font-bold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {disabled ? '...' : 'Gönder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 