import { AIContext, AIProvider } from './ai-provider.interface';
import { FAQS } from './faq';

/**
 * Mock AI provider. Keyword-matches the question against the FAQ knowledge base.
 * No network calls. Used when AI_PROVIDER=mock (default).
 */
export class MockAIProvider implements AIProvider {
  readonly name = 'mock';

  async answerFAQ(question: string, ctx?: AIContext): Promise<string> {
    const q = question.toLowerCase();
    for (const entry of FAQS) {
      if (entry.keywords.some((k) => q.includes(k))) {
        return entry.answer(ctx);
      }
    }
    return `Thanks for your question${ctx?.studentName ? `, ${ctx.studentName}` : ''}! A counselor will get back to you shortly about the ${ctx?.course ?? 'course'}.`;
  }
}
