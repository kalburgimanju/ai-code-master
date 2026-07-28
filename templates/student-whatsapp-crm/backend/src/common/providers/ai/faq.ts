import { AIContext } from './ai-provider.interface';

export interface FaqEntry {
  keywords: string[];
  answer: (ctx?: AIContext) => string;
}

/**
 * Canned FAQ knowledge base for the education-coaching business. The mock AI
 * provider matches the student's question against keyword sets.
 */
export const FAQS: FaqEntry[] = [
  {
    keywords: ['fee', 'fees', 'cost', 'price', 'charge', '₹', 'rs', 'rupee'],
    answer: (ctx) =>
      `The ${ctx?.course ?? 'course'} fee is ₹25,000. EMI options are available.`,
  },
  {
    keywords: ['duration', 'how long', 'weeks', 'months', 'timeline'],
    answer: (ctx) =>
      `Duration is 12 weeks with live projects for the ${ctx?.course ?? 'course'}.`,
  },
  {
    keywords: ['curriculum', 'syllabus', 'topics', 'learn', 'course content'],
    answer: () =>
      `Curriculum covers fundamentals, hands-on projects, and a capstone. Download the full syllabus from our portal.`,
  },
  {
    keywords: ['timing', 'timings', 'schedule', 'class time', 'batch', 'when'],
    answer: () =>
      `We run weekday evenings (7–9 PM IST) and weekend batches. Pick what suits you.`,
  },
  {
    keywords: ['placement', 'placements', 'job', 'hiring', 'career', 'internship'],
    answer: () =>
      `We offer placement support with 200+ hiring partners and mock interviews.`,
  },
];
