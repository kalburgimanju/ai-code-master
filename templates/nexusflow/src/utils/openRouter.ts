const OPENROUTER_API = 'https://openrouter.ai/api/v1/chat/completions';

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
}

export async function callOpenRouter(
  apiKey: string,
  request: OpenRouterRequest,
  onChunk?: (text: string) => void
): Promise<string> {
  const response = await fetch(OPENROUTER_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
      'X-Title': 'NexusFlow',
    },
    body: JSON.stringify({
      ...request,
      stream: !!onChunk,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${error}`);
  }

  if (onChunk) {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    if (!reader) throw new Error('No response body');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));

      for (const line of lines) {
        try {
          const data = JSON.parse(line.slice(6));
          const text = data.choices?.[0]?.delta?.content || '';
          if (text) {
            fullText += text;
            onChunk(text);
          }
        } catch {
          // skip parse errors on incomplete chunks
        }
      }
    }

    return fullText;
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return response.ok;
  } catch {
    return false;
  }
}

export interface OpenRouterModel {
  id: string;
  name: string;
  provider: string;
}

export async function fetchAvailableModels(
  apiKey: string
): Promise<OpenRouterModel[]> {
  try {
    const response = await fetch(
      'https://openrouter.ai/api/v1/models',
      {
        headers: { Authorization: `Bearer ${apiKey}` },
      }
    );
    if (!response.ok) return [];
    const data = await response.json();
    return (data.data || []).map((m: any) => ({
      id: m.id,
      name: m.name || m.id,
      provider: (m.architecture?.provider || '').split('/')[0] || 'Unknown',
    }));
  } catch {
    return [];
  }
}
