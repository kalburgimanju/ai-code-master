import { LeadScoreEvent } from './lead-score.entity';

/** Points awarded for each engagement event (per the product spec). */
export const SCORE_WEIGHTS: Record<LeadScoreEvent, number> = {
  opened: 5,
  clicked: 10,
  replied: 20,
  webinar: 30,
  manual: 0,
};

/**
 * Pure: compute the new cumulative score after an event.
 */
export function applyEvent(currentScore: number, event: LeadScoreEvent): number {
  return currentScore + (SCORE_WEIGHTS[event] ?? 0);
}

export type ConditionOp = '>' | '>=' | '<' | '<=' | '==' | '!=';

/**
 * Pure: evaluate a condition against a numeric value.
 */
export function evaluateCondition(
  fieldValue: number,
  op: ConditionOp,
  target: number,
): boolean {
  switch (op) {
    case '>':
      return fieldValue > target;
    case '>=':
      return fieldValue >= target;
    case '<':
      return fieldValue < target;
    case '<=':
      return fieldValue <= target;
    case '==':
      return fieldValue === target;
    case '!=':
      return fieldValue !== target;
    default:
      return false;
  }
}

/**
 * Pure: pick the counselor for a city. Falls back to a default when no
 * city-specific assignment exists. (Auto-assignment rule from the spec.)
 */
export function assignByCity(
  city: string | undefined,
  counselors: { id: string; name: string; city?: string }[],
  defaultCounselorId?: string,
): string | undefined {
  if (!city) return defaultCounselorId;
  const normalized = city.trim().toLowerCase();
  const match = counselors.find(
    (c) => c.city && c.city.trim().toLowerCase() === normalized,
  );
  return match?.id ?? defaultCounselorId;
}
