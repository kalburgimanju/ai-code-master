export function formatPrice(lakhs: number): string {
  if (lakhs >= 100) return `₹${(lakhs / 100).toFixed(1)} Cr`;
  return `₹${lakhs.toFixed(0)} L`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-IN');
}

export function getTimeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function calculateEMI(principal: number, rateAnnual: number, tenureMonths: number): number {
  const r = rateAnnual / 12 / 100;
  return Math.round(principal * r * Math.pow(1 + r, tenureMonths) / (Math.pow(1 + r, tenureMonths) - 1));
}

export function propertyTax(propertyValue: number, city: string): number {
  const rates: Record<string, number> = { Hubli: 0.003, Bangalore: 0.005, Mysore: 0.004 };
  return propertyValue * (rates[city] || 0.004);
}

export function stampDuty(propertyValue: number): number {
  return propertyValue * 0.05; // 5% in Karnataka
}

export function registrationFee(propertyValue: number): number {
  return propertyValue * 0.01; // 1% in Karnataka
}

export function gstOnUnderConstruction(propertyValue: number, isUnderConstruction: boolean): number {
  if (!isUnderConstruction) return 0;
  return propertyValue * 0.05; // 5% GST on under-construction
}

export function totalBuyingCost(propertyValue: number, isUnderConstruction: boolean, city: string): number {
  return propertyValue + stampDuty(propertyValue) + registrationFee(propertyValue) + gstOnUnderConstruction(propertyValue, isUnderConstruction);
}
