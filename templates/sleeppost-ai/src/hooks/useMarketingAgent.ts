import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { generateCampaign, updateCampaignMetrics } from '../agents/marketingAgent';
import type { ActivityEvent } from '../types';

export function useMarketingAgent() {
  const { campaigns, addCampaign, updateCampaign, addActivity } = useApp();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const runCampaign = async () => {
      try {
        const campaign = await generateCampaign();
        addCampaign(campaign);

        const event: ActivityEvent = {
          id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          agentName: 'Marketing Manager',
          agentType: 'marketing',
          action: 'Created campaign',
          details: `${campaign.name} (${campaign.type})`,
          timestamp: Date.now(),
        };
        addActivity(event);
      } catch (err) {
        console.warn('Marketing agent error:', err);
      }
    };

    // First campaign after 10 seconds
    const initialTimeout = setTimeout(runCampaign, 10000);

    intervalRef.current = setInterval(runCampaign, 60000);

    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [addCampaign, addActivity]);

  // Update campaign metrics periodically
  useEffect(() => {
    if (campaigns.length === 0) return;

    const interval = setInterval(() => {
      const activeCampaigns = campaigns.filter(c => c.status === 'active');
      if (activeCampaigns.length > 0) {
        const campaign = activeCampaigns[Math.floor(Math.random() * activeCampaigns.length)];
        const updated = updateCampaignMetrics(campaign);
        updateCampaign(campaign.id, { metrics: updated.metrics });
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [campaigns, updateCampaign]);
}
