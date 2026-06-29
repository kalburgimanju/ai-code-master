import { useEffect, useRef } from 'react';
import { useAgentContext } from '../context/AgentContext';
import type { ActivityEvent } from '../types';

const sampleUsers = [
  'Rahul K.', 'Priya S.', 'Amit T.', 'Sneha M.', 'Vikram R.',
  'Kavya P.', 'Arjun N.', 'Deepa L.', 'Sanjay G.', 'Meera D.',
  'Rohan B.', 'Nisha V.', 'Karan J.', 'Pooja A.', 'Suresh W.',
];

const sampleQuestions = [
  'How do I reset my password?',
  'What is your return policy?',
  'Can I get a refund for order #45892?',
  'How long does shipping take?',
  'Do you offer bulk discounts?',
  'I need help with my account settings.',
  'What payment methods do you accept?',
  'Can you transfer me to a human agent?',
  'How do I update my billing information?',
  'Where is my order?',
  'I want to schedule a demo.',
  'What are your business hours?',
  'Can I upgrade my plan?',
  'How does the free trial work?',
  'Do you have an API?',
  'What is the cancellation policy?',
  'I have a complaint about my last order.',
  'Can you help me with onboarding?',
  'What training materials do you provide?',
  'How do I add team members?',
];

const sampleResponses = [
  'You can reset your password at Settings → Security. I\'ve sent a reset link to your email!',
  'Our return policy allows returns within 30 days. Items must be unused and in original packaging.',
  'I can process that refund for you. Order #45892 will be refunded within 3-5 business days.',
  'Standard shipping takes 3-5 days. Express shipping is available for next-day delivery.',
  'Yes! Orders above ₹50,000 qualify for a 10% discount. I can apply that now.',
  'I\'ll guide you through your account settings. What specifically would you like to change?',
  'We accept UPI, credit/debit cards, net banking, and wallets. Enterprise clients can use invoice billing.',
  'Of course! I\'ll transfer you to a human agent now. Please hold for a moment.',
  'You can update billing at Settings → Billing. I can help with that right now.',
  'Your order #TSK-45892 is currently in transit. Expected delivery: June 30.',
  'I\'d love to set that up! What day works best for you this week?',
  'We\'re available Monday-Friday, 9am-6pm IST. But I\'m here 24/7!',
  'Absolutely! I can help you upgrade. Which plan interests you?',
  'The free trial gives you full access for 14 days. No credit card required.',
  'Yes, we offer a REST API. Documentation is at docs.myaiemployee.com.',
  'You can cancel anytime from Settings → Subscription. No questions asked.',
  'I\'m sorry to hear that. Can you share your order number so I can investigate?',
  'For onboarding, I\'ll walk you through the setup. It takes about 10 minutes.',
  'We have video tutorials, documentation, and live workshops. What\'s your learning style?',
  'You can add team members at Settings → Team. Each member gets their own access level.',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function useAgentLoop() {
  const { agents, updateAgent, addActivity } = useAgentContext();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (agents.length === 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      const activeAgents = agents.filter((a) => a.status === 'active');
      if (activeAgents.length === 0) return;

      const agent = pick(activeAgents);
      const user = pick(sampleUsers);
      const question = pick(sampleQuestions);
      const response = pick(sampleResponses);
      const duration = Math.round((0.3 + Math.random() * 1.7) * 10) / 10;
      const resolved = Math.random() > 0.08;

      // Update agent metrics
      const newConvCount = agent.conversations + 1;
      const newResolution = Math.min(
        100,
        Math.max(70, agent.resolutionRate + (resolved ? 0.1 : -0.3))
      );
      const newAvgTime = (
        parseFloat(agent.avgResponseTime) * 0.9 + duration * 0.1
      ).toFixed(1);

      updateAgent(agent.id, {
        conversations: newConvCount,
        resolutionRate: Math.round(newResolution),
        avgResponseTime: newAvgTime,
      });

      // Add activity event
      const event: ActivityEvent = {
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        agentId: agent.id,
        agentName: agent.name,
        user,
        message: question,
        response,
        timestamp: Date.now(),
        resolved,
        duration,
      };

      addActivity(event);
    }, 3000 + Math.random() * 4000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [agents, updateAgent, addActivity]);
}
