import {
  applyEvent,
  assignByCity,
  evaluateCondition,
  SCORE_WEIGHTS,
} from '../src/scoring/scoring.logic';

describe('Scoring logic', () => {
  it('applies open/click/reply/webinar weights', () => {
    let score = 0;
    score = applyEvent(score, 'opened');
    expect(score).toBe(SCORE_WEIGHTS.opened);
    score = applyEvent(score, 'clicked');
    expect(score).toBe(SCORE_WEIGHTS.opened + SCORE_WEIGHTS.clicked);
    score = applyEvent(score, 'replied');
    expect(score).toBe(SCORE_WEIGHTS.opened + SCORE_WEIGHTS.clicked + SCORE_WEIGHTS.replied);
    score = applyEvent(score, 'webinar');
    expect(score).toBe(5 + 10 + 20 + 30);
  });

  it('evaluates conditions correctly', () => {
    expect(evaluateCondition(35, '>=', 30)).toBe(true);
    expect(evaluateCondition(20, '>=', 30)).toBe(false);
    expect(evaluateCondition(10, '>', 5)).toBe(true);
    expect(evaluateCondition(10, '==', 10)).toBe(true);
    expect(evaluateCondition(10, '!=', 10)).toBe(false);
    expect(evaluateCondition(5, '<', 10)).toBe(true);
  });

  it('assigns counselor by city with fallback', () => {
    const counselors = [
      { id: 'a', name: 'Anita', city: 'Bangalore' },
      { id: 'b', name: 'Raj', city: 'Hyderabad' },
    ];
    expect(assignByCity('Bangalore', counselors)).toBe('a');
    expect(assignByCity('hyderabad', counselors)).toBe('b'); // case-insensitive
    expect(assignByCity('USA', counselors, 'default')).toBe('default');
    expect(assignByCity(undefined, counselors)).toBeUndefined();
  });
});
