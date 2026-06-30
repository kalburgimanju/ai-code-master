// Cost tracking for API usage
// Most APIs are free on OpenRouter with free models

interface CostEntry {
  service: string;
  amountCents: number;
  description: string;
  timestamp: string;
}

const costs: CostEntry[] = [];

// Cost per service (in cents) - Free tier pricing
export const COSTS = {
  OPENROUTER_SCRIPT: 0,        // Free with OpenRouter free models
  POLLINATIONS_THUMBNAIL: 0,   // Free image generation
  VOICEOVER_SCRIPT: 0,         // Free script generation
  HTML_VIDEO: 0,               // Free HTML-based video
} as const;

export function trackCost(
  service: string,
  amountCents: number,
  description: string
): void {
  costs.push({
    service,
    amountCents,
    description,
    timestamp: new Date().toISOString(),
  });
}

export function getTotalCost(): number {
  return costs.reduce((sum, c) => sum + c.amountCents, 0);
}

export function getCostsByService(): Record<string, number> {
  const byService: Record<string, number> = {};
  for (const cost of costs) {
    byService[cost.service] = (byService[cost.service] || 0) + cost.amountCents;
  }
  return byService;
}

export function getRecentCosts(limit: number = 10): CostEntry[] {
  return costs.slice(-limit);
}

export function resetCosts(): void {
  costs.length = 0;
}

// Free tier limits info
export function getFreeTierLimits(): Record<string, string> {
  return {
    'OpenRouter Free Models': 'Unlimited (rate-limited)',
    'Pollinations.ai': 'Unlimited (free image generation)',
    'YouTube Data API': '10,000 units/day free',
    'Vercel KV': '30,000 commands/day free',
    'Vercel Blob': '500MB storage free',
  };
}
