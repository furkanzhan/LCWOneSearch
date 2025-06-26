export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
      url: string;
    };
  }>;
  image?: string; // Base64 veya URL
}

// Helper functions for creating message objects
export function createSystemMessage(content: string): ChatMessage {
  return {
    role: 'system',
    content,
  };
}

export function createUserMessage(content: string): ChatMessage {
  return {
    role: 'user',
    content,
  };
}

export function createAssistantMessage(content: string): ChatMessage {
  return {
    role: 'assistant',
    content,
  };
}

export function createUserMessageWithImage(text: string, imageBase64: string): ChatMessage {
  return {
    role: 'user',
    content: [
      { type: 'text', text },
      { type: 'image_url', image_url: { url: imageBase64 } }
    ],
    image: imageBase64,
  };
} 