// Cost tracking for API usage

interface CostEntry {
  service: string;
  amountCents: number;
  description: string;
  timestamp: string;
}

const costs: CostEntry[] = [];

// Cost per service (in cents)
export const COSTS = {
  OPENAI_SCRIPT: 2,        // ~$0.02 per script
  OPENAI_THUMBNAIL: 4,     // ~$0.04 per thumbnail
  ELEVENLABS_VOICEOVER: 30, // ~$0.30 per voiceover (10min)
  RUNWAY_VIDEO: 150,        // ~$1.50 per video clip
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
