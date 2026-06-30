// Idea storage — server generates, client stores in localStorage
// This avoids Vercel serverless statelessness

export interface StoredIdea {
  id: string;
  title: string;
  niche: string;
  trendScore: number;
  competition: 'Low' | 'Medium' | 'High';
  estimatedViews: string;
  keywords: string[];
  source: string;
  createdAt: string;
}

export function generateCSV(ideas: StoredIdea[]): string {
  const header = 'ID,Title,Niche,Trend Score,Competition,Estimated Views,Keywords,Source,Created At\n';
  const rows = ideas.map((i) =>
    `"${i.id}","${i.title}","${i.niche}",${i.trendScore},"${i.competition}","${i.estimatedViews}","${i.keywords.join('; ')}","${i.source}","${i.createdAt}"`
  ).join('\n');
  return header + rows;
}

export function generateJSON(ideas: StoredIdea[]): string {
  return JSON.stringify(ideas, null, 2);
}
