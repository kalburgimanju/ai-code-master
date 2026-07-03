import { create } from 'zustand';
import { ParsedResume } from './resume';

export interface Application {
  jobId: number;
  title: string;
  company: string;
  role: string;
  appliedAt: string;
  status: 'applied' | 'referred' | 'interview' | 'rejected' | 'offered';
  salary: string;
  referrerName: string;
  referrerEmail: string;
}

interface AppState {
  resume: ParsedResume | null;
  resumeText: string;
  applications: Application[];
  setResume: (r: ParsedResume | null, text: string) => void;
  addApplication: (a: Application) => void;
  updateApplication: (jobId: number, updates: Partial<Application>) => void;
  loadState: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  resume: null,
  resumeText: '',
  applications: [],
  setResume: (r, text) => {
    set({ resume: r, resumeText: text });
    if (typeof window !== 'undefined') localStorage.setItem('jobfinder_resume', JSON.stringify(r));
  },
  addApplication: (a) => {
    const apps = [...get().applications, a];
    set({ applications: apps });
    if (typeof window !== 'undefined') localStorage.setItem('jobfinder_applications', JSON.stringify(apps));
  },
  updateApplication: (jobId, updates) => {
    const apps = get().applications.map((a) => a.jobId === jobId ? { ...a, ...updates } : a);
    set({ applications: apps });
    if (typeof window !== 'undefined') localStorage.setItem('jobfinder_applications', JSON.stringify(apps));
  },
  loadState: () => {
    if (typeof window === 'undefined') return;
    const savedResume = localStorage.getItem('jobfinder_resume');
    const savedApps = localStorage.getItem('jobfinder_applications');
    if (savedResume) try { set({ resume: JSON.parse(savedResume) }); } catch {}
    if (savedApps) try { set({ applications: JSON.parse(savedApps) }); } catch {}
  },
}));
