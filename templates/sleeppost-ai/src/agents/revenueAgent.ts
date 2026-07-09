import type { RevenueMetrics } from '../types';

export function updateRevenueMetrics(current: RevenueMetrics): RevenueMetrics {
  const newSubscriber = Math.random() > 0.85;
  const activeSubscribers = current.activeSubscribers + (newSubscriber ? 1 : 0);

  const planDistribution = { free: 0.6, pro: 0.3, business: 0.1 };
  const avgRevenuePerUser = 29 * planDistribution.pro + 99 * planDistribution.business;
  const monthlyRecurring = activeSubscribers * avgRevenuePerUser;

  const dailyRevenue = [...current.dailyRevenue.slice(1), monthlyRecurring / 30 + Math.random() * 3];
  const monthlyRevenue = [...current.monthlyRevenue.slice(1), monthlyRecurring];

  const churnEvent = Math.random() > 0.95;
  const churnRate = Math.max(0.5, Math.min(8, current.churnRate + (churnEvent ? 0.2 : -0.05)));
  const conversionRate = Math.min(20, Math.max(1, current.conversionRate + (Math.random() > 0.5 ? 0.1 : -0.05)));
  const ltv = monthlyRecurring > 0 ? Math.round(monthlyRecurring / Math.max(1, churnRate / 100) * 0.3) : 0;

  return {
    totalEarnings: current.totalEarnings + Math.random() * 3,
    monthlyRecurring,
    activeSubscribers,
    conversionRate,
    churnRate,
    ltv,
    dailyRevenue,
    monthlyRevenue,
  };
}

export function getRevenueInsights(revenue: RevenueMetrics): string[] {
  const insights: string[] = [];

  if (revenue.conversionRate > 5) {
    insights.push('Conversion rate is above 5% — strong performance.');
  }
  if (revenue.churnRate > 5) {
    insights.push('Churn rate is elevated. Consider improving onboarding.');
  }
  if (revenue.monthlyRecurring > 1000) {
    insights.push('MRR has crossed $1,000 — time to scale marketing.');
  }
  if (revenue.activeSubscribers > 50) {
    insights.push('50+ active subscribers — consider adding team features.');
  }

  return insights;
}
