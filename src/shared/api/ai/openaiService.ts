/**
 * OpenAI Service Wrapper
 * Provides centralized access to OpenAI Models (GPT-4o and Text Embeddings)
 */

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const openaiService = {
  /**
   * Generates a semantic embedding for a text string.
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY is missing');

    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-3-small',
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`OpenAI Embedding Error: ${error.error?.message || res.statusText}`);
    }

    const data = await res.json();
    return data.data[0].embedding;
  },

  /**
   * Generates a structured response using GPT-4o-mini.
   */
  async generateCompletion(messages: ChatMessage[], jsonMode = false): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY is missing');

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        response_format: jsonMode ? { type: 'json_object' } : undefined,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`OpenAI Completion Error: ${error.error?.message || res.statusText}`);
    }

    const data = await res.json();
    return data.choices[0].message.content;
  },
};
