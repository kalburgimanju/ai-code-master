import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { updateRevenueMetrics } from '../agents/revenueAgent';
import type { ActivityEvent } from '../types';

export function useRevenueAgent() {
  const { revenue, addActivity } = useApp();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastRevenueRef = useRef(revenue.totalEarnings);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      // Revenue update is handled in AppContext, this agent just tracks milestones
      const newTotal = revenue.totalEarnings;
      const prevTotal = lastRevenueRef.current;

      if (newTotal > prevTotal + 10) {
        const event: ActivityEvent = {
          id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          agentName: 'Revenue Analyst',
          agentType: 'revenue',
          action: 'Revenue milestone',
          details: `Total earnings: $${newTotal.toFixed(2)}`,
          timestamp: Date.now(),
        };
        addActivity(event);
        lastRevenueRef.current = newTotal;
      }
    }, 15000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [revenue.totalEarnings, addActivity]);
}
