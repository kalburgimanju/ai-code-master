const STORAGE_PREFIX = 'fp_';

export function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const d = localStorage.getItem(STORAGE_PREFIX + key);
    return d ? JSON.parse(d) : fallback;
  } catch { return fallback; }
}

export function setItem(key: string, value: any): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
}

export const USER_KEY = 'user';
export const FINANCIAL_KEY = 'financial_profile';
export const CHATS_KEY = 'chats';
export const LEADS_KEY = 'leads';
export const CAMPAIGNS_KEY = 'campaigns';
export const POSTS_KEY = 'posts';
export const LEGAL_KEY = 'legal';
export const CALLS_KEY = 'calls';
export const SETTINGS_KEY = 'settings';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}
