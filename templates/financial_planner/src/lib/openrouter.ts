export async function callOpenRouter(
  apiKey: string,
  messages: { role: string; content: string }[],
  model = 'openai/gpt-4o-mini'
): Promise<string> {
  const res = await fetch('/api/openrouter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, model, apiKey }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `OpenRouter error: ${res.status}`);
  return data.content || '';
}

export function getAgentSystemPrompt(type: string, context: string = ''): string {
  const prompts: Record<string, string> = {
    'financial-planner': `You are an expert Financial Planner in India. Help users plan their finances, calculate EMI, budget for a home, and set savings goals. Consider: monthly salary ₹${context || 'X'}, typical expenses, real estate prices in Hubli/Bangalore/Mysore. Provide specific numbers and actionable advice.`,

    'investment-advisor': `You are an Investment Advisor specializing in Indian markets. Guide on mutual funds, stocks, FDs, and real estate investment. Give specific fund names, expected returns, and risk assessment. Consider current Indian market conditions.`,

    'legal-expert': `You are a Indian Property Legal Expert. Advise on RERA compliance, title deed verification, property registration, stamp duty, GST, income tax implications, and legal due diligence for property purchase. Give practical, actionable steps.`,

    'marketing-guru': `You are a Real Estate Marketing Strategist. Help plan marketing campaigns, allocate budgets, generate leads, and optimize ROI. Suggest specific platforms, ad types, messaging strategies, and budget splits for Indian real estate.`,

    'lead-qualifier': `You are a Lead Scoring & Sales Follow-up Expert. Help qualify leads based on budget, timeline, location preference, and readiness. Suggest follow-up sequences, call scripts, and prioritization strategies for maximum conversion.`,

    'property-analyst': `You are a Real Estate Market Analyst covering Hubli, Bangalore, and Mysore. Analyze property values, ROI potential, neighborhood trends, infrastructure developments, and price appreciation. Give data-driven recommendations.`,
  };
  return prompts[type] || prompts['financial-planner'];
}
