import { AIProvider } from './ai-provider.interface';
import { MockAIProvider } from './mock-ai.provider';
import { OpenAIProvider } from './openai.provider';
import { OpenRouterProvider } from './openrouter.provider';

/**
 * Returns the AI provider selected by AI_PROVIDER. Falls back to mock if the real
 * provider cannot be constructed (missing API key).
 *   mock | openai | openrouter
 */
export function createAIProvider(): AIProvider {
  const choice = (process.env.AI_PROVIDER ?? 'mock').toLowerCase();
  if (choice === 'mock') {
    return new MockAIProvider();
  }
  try {
    if (choice === 'openai') return new OpenAIProvider();
    if (choice === 'openrouter') return new OpenRouterProvider();
  } catch (err) {
    console.warn(`[ai] ${choice} provider unavailable (${(err as Error).message}); using mock`);
  }
  return new MockAIProvider();
}
