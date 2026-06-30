// Idea storage — client-side localStorage + file download helpers
// Ideas persist in browser localStorage and can be exported as JSON/CSV files

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

const STORAGE_KEY = 'faceflow_ideas';
const AUTO_SAVE_KEY = 'faceflow_auto_save';

// ===== localStorage operations =====

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

// ===== File download helpers =====

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
  const json = JSON.stringify(ideas, null, 2);
  downloadFile(json, `faceflow-ideas-${date}.json`, 'application/json');
}

export function downloadCSV(ideas: StoredIdea[]) {
  const date = new Date().toISOString().split('T')[0];
  const header = 'ID,Title,Niche,Trend Score,Competition,Estimated Views,Keywords,Source,Created At\n';
  const rows = ideas.map((i) =>
    `"${i.id}","${i.title}","${i.niche}",${i.trendScore},"${i.competition}","${i.estimatedViews}","${i.keywords.join('; ')}","${i.source}","${i.createdAt}"`
  ).join('\n');
  downloadFile(header + rows, `faceflow-ideas-${date}.csv`, 'text/csv');
}

// ===== Auto-save settings =====

export function getAutoSaveEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AUTO_SAVE_KEY) === 'true';
}

export function setAutoSaveEnabled(enabled: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTO_SAVE_KEY, String(enabled));
}
