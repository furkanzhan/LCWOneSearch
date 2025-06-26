'use server';

import { ChatMessage } from './helpers';

export async function fetchChatResponse(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OpenAI API key not found. Please set OPENAI_API_KEY in your environment variables.');
  }

  // Metin + görsel destekli hale dönüştür
  const transformedMessages = messages.map((msg) => {
    if (msg.image) {
      return {
        role: msg.role,
        content: [
          { type: "text", text: msg.content },
          {
            type: "image_url",
            image_url: {
              url: msg.image, // base64 veya URL olabilir
            },
          },
        ],
      };
    } else {
      return {
        role: msg.role,
        content: msg.content,
      };
    }
  });

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: transformedMessages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenAI API');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
}
