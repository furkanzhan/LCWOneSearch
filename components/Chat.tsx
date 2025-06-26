'use client';

import { useState } from 'react';
import Image from 'next/image';
import { fetchChatResponse } from '@/lib/openai';
import { createSystemMessage, type ChatMessage } from '@/lib/helpers';

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
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const base64 = await convertToBase64(file);
        setSelectedImage(base64);
      } catch (error) {
        console.error('Error converting file:', error);
      }
    }
  };

  const sendMessage = async () => {
    if ((!inputText.trim() && !selectedImage) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim() || "Bu görselde ne görüyorsun?",
      image: selectedImage || undefined,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setSelectedImage(null);
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

      if (userMessage.text || userMessage.image) {
        const content: Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }> = [];
        
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
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      minHeight: '100vh',
      backgroundColor: '#f0f2f5',
      fontFamily: 'Arial, sans-serif',
    },
    main: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      padding: '2rem',
    },
    logoSection: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '2.5rem',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      textAlign: 'center' as const,
      width: '100%',
      maxWidth: '700px',
      marginBottom: '2rem',
    },
    inputContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      gap: '10px',
    },
    fileButton: {
      backgroundColor: '#f8f9fa',
      border: '1px solid #ddd',
      borderRadius: '50%',
      width: '45px',
      height: '45px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      fontSize: '20px',
      color: '#666',
    },
    textInput: {
      flex: 1,
      padding: '0.8rem 1.2rem',
      fontSize: '1.1rem',
      borderRadius: '25px',
      border: '1px solid #ddd',
      outline: 'none',
      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)',
    },
    sendButton: {
      backgroundColor: '#0070f3',
      color: 'white',
      border: 'none',
      borderRadius: '25px',
      padding: '0.8rem 1.8rem',
      fontSize: '1.1rem',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
    },
    chatSection: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '2.5rem',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      width: '100%',
      maxWidth: '700px',
      marginBottom: '2rem',
    },
    chatArea: {
      maxHeight: '400px',
      overflowY: 'auto' as const,
      marginBottom: '1rem',
      padding: '1rem',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      border: '1px solid #eee',
    },
    message: {
      marginBottom: '1rem',
      padding: '0.8rem 1.2rem',
      borderRadius: '8px',
      fontSize: '1rem',
    },
    userMessage: {
      backgroundColor: '#0070f3',
      color: 'white',
      marginLeft: 'auto',
      marginRight: '0',
      maxWidth: '80%',
      textAlign: 'right' as const,
    },
    assistantMessage: {
      backgroundColor: '#e9ecef',
      color: '#333',
      marginLeft: '0',
      marginRight: 'auto',
      maxWidth: '80%',
    },
    timestamp: {
      fontSize: '0.8rem',
      opacity: 0.7,
      marginTop: '0.3rem',
    },
    footer: {
      textAlign: 'center' as const,
      padding: '1.5rem',
      marginTop: 'auto',
      color: '#777',
      fontSize: '0.9rem',
      borderTop: '1px solid #eee',
      backgroundColor: '#fff',
    },
    loadingIndicator: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: '#666',
      fontStyle: 'italic' as const,
    },
    imagePreview: {
      marginTop: '1rem',
      position: 'relative' as const,
      display: 'inline-block',
    },
    removeImageButton: {
      position: 'absolute' as const,
      top: '-8px',
      right: '-8px',
      backgroundColor: '#ff4757',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      cursor: 'pointer',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  };

  return (
    <div style={styles.container}>
      <main style={styles.main}>
        {/* Logo Bölümü */}
        <section style={styles.logoSection}>
          <Image
            src="/logo.png"
            alt="LC Waikiki OneSearch"
            width={400}
            height={160}
            style={{ marginBottom: '1.5rem' }}
          />
          
          {/* Dosya Önizleme */}
          {selectedImage && (
            <div style={styles.imagePreview}>
              <Image 
                src={selectedImage} 
                alt="Yüklenecek dosya" 
                width={200}
                height={150}
                style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              />
              <button
                style={styles.removeImageButton}
                onClick={() => setSelectedImage(null)}
              >
                ×
              </button>
            </div>
          )}

          <div style={styles.inputContainer}>
            {/* Dosya Ekleme Butonu */}
            <label style={styles.fileButton}>
              +
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>

            <input
              type="text"
              placeholder="Size nasıl yardımcı olabilirim?"
              style={styles.textInput}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <button 
              style={styles.sendButton} 
              onClick={sendMessage}
              disabled={isLoading || (!inputText.trim() && !selectedImage)}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = '#005bb5';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = '#0070f3';
                }
              }}
            >
              {isLoading ? 'Gönderiliyor...' : 'Gönder'}
            </button>
          </div>
        </section>

        {/* Chat Mesajları */}
        {messages.length > 0 && (
          <section style={styles.chatSection}>
            <div style={styles.chatArea}>
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  style={{
                    ...styles.message,
                    ...(msg.sender === 'user' ? styles.userMessage : styles.assistantMessage)
                  }}
                >
                  {msg.image && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <Image 
                        src={msg.image} 
                        alt="Gönderilen görsel" 
                        width={150}
                        height={100}
                        style={{ borderRadius: '6px' }}
                      />
                    </div>
                  )}
                  <div>{msg.text}</div>
                  <div style={styles.timestamp}>
                    {msg.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div style={styles.loadingIndicator}>
                  <span>⏳ Asistan yazıyor...</span>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setMessages([])}
              style={{
                ...styles.sendButton,
                backgroundColor: '#6c757d',
                fontSize: '0.9rem',
                padding: '0.5rem 1rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#5a6268';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#6c757d';
              }}
            >
              Sohbeti Temizle
            </button>
          </section>
        )}
      </main>

      <footer style={styles.footer}>
        <p>&copy; 2025 LC Waikiki OneSearch - AI Asistanı</p>
      </footer>
    </div>
  );
} 