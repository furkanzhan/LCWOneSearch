'use client';

import { useState } from 'react';
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

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
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
        {
          role: 'user' as const,
          content: inputText.trim(),
        }
      ];

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

  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
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
    askAiSection: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '2.5rem',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      textAlign: 'center' as const,
      width: '100%',
      maxWidth: '700px',
      marginBottom: '2rem',
    },
    askAiTitle: {
      fontSize: '2.5rem',
      color: '#333',
      marginBottom: '1.5rem',
    },
    inputContainer: {
      display: 'flex',
      justifyContent: 'center',
      width: '100%',
    },
    textInput: {
      flex: 1,
      padding: '0.8rem 1.2rem',
      fontSize: '1.1rem',
      borderRadius: '25px',
      border: '1px solid #ddd',
      marginRight: '10px',
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
    suggestionsSection: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '2.5rem',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      width: '100%',
      maxWidth: '700px',
    },
    suggestionsTitle: {
      fontSize: '1.8rem',
      color: '#333',
      marginBottom: '1.5rem',
      textAlign: 'center' as const,
    },
    suggestionsList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
    },
    suggestionItem: {
      backgroundColor: '#f9f9f9',
      border: '1px solid #eee',
      borderRadius: '8px',
      padding: '1rem 1.5rem',
      marginBottom: '1rem',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease, transform 0.2s ease',
    },
    suggestionText: {
      fontSize: '1.1rem',
      color: '#555',
      margin: 0,
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
  };

  return (
    <div style={styles.container}>
      <main style={styles.main}>
        {/* Üst Kısım: AI'ya Her Şeyi Sorun */}
        <section style={styles.askAiSection}>
          <h1 style={styles.askAiTitle}>Ask our AI anything</h1>
          <div style={styles.inputContainer}>
            <input
              type="text"
              placeholder="What can I ask you to do?"
              style={styles.textInput}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <button 
              style={styles.sendButton} 
              onClick={sendMessage}
              disabled={isLoading || !inputText.trim()}
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
              {isLoading ? 'Gönderiliyor...' : 'Sor'}
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

        {/* Öneriler Kısmı */}
        <section style={styles.suggestionsSection}>
          <h2 style={styles.suggestionsTitle}>Suggestions on what to ask Our AI</h2>
          <ul style={styles.suggestionsList}>
            <li 
              style={styles.suggestionItem}
              onClick={() => handleSuggestionClick("Which one of my projects is performing the best?")}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#eef';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f9f9f9';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <p style={styles.suggestionText}>Which one of my projects is performing the best?</p>
            </li>
            <li 
              style={styles.suggestionItem}
              onClick={() => handleSuggestionClick("What projects should I be concerned about right now?")}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#eef';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f9f9f9';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <p style={styles.suggestionText}>What projects should I be concerned about right now?</p>
            </li>
            <li 
              style={{...styles.suggestionItem, marginBottom: 0}}
              onClick={() => handleSuggestionClick("Ask me anything about your projects")}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#eef';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f9f9f9';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <p style={styles.suggestionText}>Ask me anything about your projects</p>
            </li>
          </ul>
        </section>
      </main>

      <footer style={styles.footer}>
        <p>&copy; 2025 LC Waikiki OneSearch - AI Asistanı</p>
      </footer>
    </div>
  );
} 