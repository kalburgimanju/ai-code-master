import type { VideoProject } from '../types';

const STORAGE_KEY = 'vgenerator_projects';

function loadProjects(): VideoProject[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveProjects(projects: VideoProject[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export const videoStore = {
  getAll: (): VideoProject[] => loadProjects(),

  getById: (id: string): VideoProject | undefined =>
    loadProjects().find((p) => p.id === id),

  add: (project: VideoProject): void => {
    const projects = loadProjects();
    projects.unshift(project);
    saveProjects(projects);
  },

  update: (id: string, updates: Partial<VideoProject>): void => {
    const projects = loadProjects();
    const idx = projects.findIndex((p) => p.id === id);
    if (idx !== -1) {
      projects[idx] = { ...projects[idx], ...updates };
      saveProjects(projects);
    }
  },

  delete: (id: string): void => {
    const projects = loadProjects();
    saveProjects(projects.filter((p) => p.id !== id));
  },

  clear: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  },
};
