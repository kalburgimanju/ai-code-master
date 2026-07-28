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

/**
 * OpenAI FAQ adapter. Active only when OPENAI_API_KEY is set. Construction throws
 * otherwise; the factory falls back to the mock provider.
 */
export class OpenAIProvider implements AIProvider {
  readonly name = 'openai';
  private client: OpenAI;
  private model: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAIProvider requires OPENAI_API_KEY');
    }
    this.client = new OpenAI({ apiKey });
    this.model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
  }

  async answerFAQ(question: string, ctx?: AIContext): Promise<string> {
    const user = ctx?.studentName
      ? `Student: ${ctx.studentName} (course: ${ctx.course ?? 'n/a'}). Question: ${question}`
      : question;
    const res = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: user },
      ],
    });
    return res.choices[0]?.message?.content?.trim() ?? 'No answer available.';
  }
}
