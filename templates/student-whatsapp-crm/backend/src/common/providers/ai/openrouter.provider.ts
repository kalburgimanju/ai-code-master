import OpenAI from 'openai';
import { AIContext, AIProvider } from './ai-provider.interface';

const SYSTEM_PROMPT = `You are an admissions assistant for an education-coaching business.
Answer ONLY about these topics using the facts below. If asked something else, say a
counselor will follow up.

Facts:
- Fee: ₹25,000 with EMI options
- Duration: 12 weeks with live projects
- Curriculum: fundamentals, hands-on projects, capstone
- Class timings: weekday evenings 7-9 PM IST and weekend batches
- Placements: 200+ hiring partners and mock interviews`;

// OpenRouter exposes an OpenAI-compatible Chat Completions API.
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Free models available on OpenRouter (https://openrouter.ai/models?q=free).
// Note: free slugs rotate; if one 404s/429s, switch to another from this list.
const FREE_MODELS = [
  'openai/gpt-oss-20b:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'nousresearch/hermes-3-llama-3.1-405b:free',
  'qwen/qwen3-next-80b-a3b-instruct:free',
];

/**
 * OpenRouter FAQ adapter (OpenAI-compatible). Active only when
 * OPENROUTER_API_KEY is set. Construction throws otherwise; the factory
 * falls back to the mock provider.
 */
export class OpenRouterProvider implements AIProvider {
  readonly name = 'openrouter';
  private client: OpenAI;
  private model: string;

  constructor() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OpenRouterProvider requires OPENROUTER_API_KEY');
    }
    this.client = new OpenAI({
      apiKey,
      baseURL: OPENROUTER_BASE_URL,
      defaultHeaders: {
        'HTTP-Referer': 'https://student-whatsapp-crm.local',
        'X-Title': 'Student WhatsApp CRM',
      },
    });
    this.model = process.env.OPENROUTER_MODEL ?? FREE_MODELS[0];
  }

  async answerFAQ(question: string, ctx?: AIContext): Promise<string> {
    const user = ctx?.studentName
      ? `Student: ${ctx.studentName} (course: ${ctx.course ?? 'n/a'}). Question: ${question}`
      : question;
    try {
      const res = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: user },
        ],
      });
      return res.choices[0]?.message?.content?.trim() ?? 'No answer available.';
    } catch (err: any) {
      console.error('[openrouter] request failed:', err?.status, err?.message);
      return 'Sorry, the AI assistant is temporarily unavailable. A counselor will follow up shortly.';
    }
  }
}

export { FREE_MODELS };
