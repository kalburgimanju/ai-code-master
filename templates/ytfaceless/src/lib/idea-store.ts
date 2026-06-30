// Idea storage — client-side localStorage + file download helpers

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
  description: string;
  targetAudience: string;
  videoLength: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const STORAGE_KEY = 'faceflow_ideas';

export function loadFromStorage(): StoredIdea[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToStorage(ideas: StoredIdea[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
}

export function mergeAndSave(existing: StoredIdea[], newIdeas: StoredIdea[]): StoredIdea[] {
  const existingTitles = new Set(existing.map((i) => i.title));
  const fresh = newIdeas.filter((i) => !existingTitles.has(i.title));
  const merged = [...fresh, ...existing];
  saveToStorage(merged);
  return merged;
}

export function clearStorage() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

function downloadFile(content: string, filename: string, mimeType: string) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadJSON(ideas: StoredIdea[]) {
  const date = new Date().toISOString().split('T')[0];
  downloadFile(JSON.stringify(ideas, null, 2), `faceflow-ideas-${date}.json`, 'application/json');
}

export function downloadCSV(ideas: StoredIdea[]) {
  const date = new Date().toISOString().split('T')[0];
  const header = 'ID,Title,Niche,Description,Trend Score,Competition,Estimated Views,Keywords,Target Audience,Video Length,Difficulty,Source,Created At\n';
  const rows = ideas.map((i) =>
    `"${i.id}","${i.title}","${i.niche}","${i.description.replace(/"/g, '""')}",${i.trendScore},"${i.competition}","${i.estimatedViews}","${i.keywords.join('; ')}","${i.targetAudience}","${i.videoLength}","${i.difficulty}","${i.source}","${i.createdAt}"`
  ).join('\n');
  downloadFile(header + rows, `faceflow-ideas-${date}.csv`, 'text/csv');
}
