import { create } from 'zustand';
import { Project, Script, AudioFile, VideoClip, Avatar, Generation, Agent, CustomAgent, DashboardTab } from '@/types';

const STORAGE_KEY = 'ai-video-studio-state';

interface PersistedState {
  user: { id: string; name: string; email: string } | null;
  projects: Project[];
  currentProject: Project | null;
  customAgents: CustomAgent[];
  generations: Generation[];
}

function loadPersistedState(): Partial<PersistedState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function savePersistedState(state: Partial<PersistedState>) {
  if (typeof window === 'undefined') return;
  try {
    // Don't serialize blob URLs — they're ephemeral
    const sanitized = JSON.parse(JSON.stringify(state, (key, value) => {
      if (key === 'url' && typeof value === 'string' && value.startsWith('blob:')) return '';
      if (key === 'imageUrl' && typeof value === 'string' && value.startsWith('blob:')) return '';
      if (key === 'thumbnailUrl' && typeof value === 'string' && value.startsWith('blob:')) return '';
      if (key === 'blobUrl' && typeof value === 'string' && value.startsWith('blob:')) return '';
      if (key === 'thumbnail' && typeof value === 'string' && value.startsWith('data:')) return '';
      return value;
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } catch (e) {
    console.warn('Failed to persist state:', e);
  }
}

interface AppState {
  user: { id: string; name: string; email: string } | null;
  projects: Project[];
  currentProject: Project | null;
  activeTab: DashboardTab;
  agents: Agent[];
  customAgents: CustomAgent[];
  generations: Generation[];
  initialized: boolean;
  setUser: (user: AppState['user']) => void;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  setActiveTab: (tab: DashboardTab) => void;
  setAgents: (agents: Agent[]) => void;
  setCustomAgents: (agents: CustomAgent[]) => void;
  addCustomAgent: (agent: CustomAgent) => void;
  updateCustomAgent: (id: string, updates: Partial<CustomAgent>) => void;
  deleteCustomAgent: (id: string) => void;
  addScript: (script: Script) => void;
  addAudioFile: (audio: AudioFile) => void;
  addVideoClip: (video: VideoClip) => void;
  addAvatar: (avatar: Avatar) => void;
  addGeneration: (gen: Generation) => void;
  updateGeneration: (id: string, updates: Partial<Generation>) => void;
  logout: () => void;
}

export const useStore = create<AppState>((set, get) => {
  const persisted = loadPersistedState();

  return {
    user: persisted.user || null,
    projects: persisted.projects || [],
    currentProject: persisted.currentProject || null,
    activeTab: 'scripts',
    agents: [
      { id: 'tts-agent-1', name: 'VoiceCraft TTS', type: 'tts', description: 'Converts text scripts into natural-sounding speech', status: 'idle', model: 'neural-tts-v2', capabilities: ['text-to-speech', 'voice-cloning', 'multi-language'] },
      { id: 'video-agent-1', name: 'SceneWeaver', type: 'video', description: 'Generates video content from scripts', status: 'idle', model: 'video-gen-v3', capabilities: ['text-to-video', 'scene-generation', 'transitions'] },
      { id: 'avatar-agent-1', name: 'PersonaForge', type: 'avatar', description: 'Creates and animates AI avatars', status: 'idle', model: 'avatar-synth-v2', capabilities: ['avatar-generation', 'lip-sync', 'gestures'] },
      { id: 'orchestrator-1', name: 'DirectorAI', type: 'orchestrator', description: 'Coordinates all agents for complete projects', status: 'idle', model: 'orchestrator-v1', capabilities: ['workflow-orchestration', 'batch-processing'] },
    ],
    customAgents: persisted.customAgents || [],
    generations: persisted.generations || [],
    initialized: true,

    setUser: (user) => { set({ user }); savePersistedState({ user, projects: get().projects, currentProject: get().currentProject, customAgents: get().customAgents, generations: get().generations }); },
    setProjects: (projects) => { set({ projects }); savePersistedState({ user: get().user, projects, currentProject: get().currentProject, customAgents: get().customAgents, generations: get().generations }); },
    setCurrentProject: (currentProject) => { set({ currentProject }); savePersistedState({ user: get().user, projects: get().projects, currentProject, customAgents: get().customAgents, generations: get().generations }); },
    setActiveTab: (tab) => set({ activeTab: tab }),
    setAgents: (agents) => set({ agents }),

    setCustomAgents: (customAgents) => { set({ customAgents }); savePersistedState({ user: get().user, projects: get().projects, currentProject: get().currentProject, customAgents, generations: get().generations }); },
    addCustomAgent: (agent) => { const customAgents = [...get().customAgents, agent]; set({ customAgents }); savePersistedState({ user: get().user, projects: get().projects, currentProject: get().currentProject, customAgents, generations: get().generations }); },
    updateCustomAgent: (id, updates) => { const customAgents = get().customAgents.map((a) => a.id === id ? { ...a, ...updates } : a); set({ customAgents }); savePersistedState({ user: get().user, projects: get().projects, currentProject: get().currentProject, customAgents, generations: get().generations }); },
    deleteCustomAgent: (id) => { const customAgents = get().customAgents.filter((a) => a.id !== id); set({ customAgents }); savePersistedState({ user: get().user, projects: get().projects, currentProject: get().currentProject, customAgents, generations: get().generations }); },

    addScript: (script) => set((state) => {
      if (!state.currentProject) return state;
      const currentProject = { ...state.currentProject, scripts: [...state.currentProject.scripts, script], updatedAt: new Date().toISOString() };
      const projects = state.projects.map((p) => p.id === currentProject.id ? currentProject : p);
      set({ currentProject, projects });
      savePersistedState({ user: state.user, projects, currentProject, customAgents: state.customAgents, generations: state.generations });
      return { currentProject, projects };
    }),
    addAudioFile: (audio) => set((state) => {
      if (!state.currentProject) return state;
      const currentProject = { ...state.currentProject, audioFiles: [...state.currentProject.audioFiles, audio], updatedAt: new Date().toISOString() };
      const projects = state.projects.map((p) => p.id === currentProject.id ? currentProject : p);
      set({ currentProject, projects });
      savePersistedState({ user: state.user, projects, currentProject, customAgents: state.customAgents, generations: state.generations });
      return { currentProject, projects };
    }),
    addVideoClip: (video) => set((state) => {
      if (!state.currentProject) return state;
      const currentProject = { ...state.currentProject, videoClips: [...state.currentProject.videoClips, video], updatedAt: new Date().toISOString() };
      const projects = state.projects.map((p) => p.id === currentProject.id ? currentProject : p);
      set({ currentProject, projects });
      savePersistedState({ user: state.user, projects, currentProject, customAgents: state.customAgents, generations: state.generations });
      return { currentProject, projects };
    }),
    addAvatar: (avatar) => set((state) => {
      if (!state.currentProject) return state;
      const currentProject = { ...state.currentProject, avatars: [...state.currentProject.avatars, avatar], updatedAt: new Date().toISOString() };
      const projects = state.projects.map((p) => p.id === currentProject.id ? currentProject : p);
      set({ currentProject, projects });
      savePersistedState({ user: state.user, projects, currentProject, customAgents: state.customAgents, generations: state.generations });
      return { currentProject, projects };
    }),

    addGeneration: (gen) => set((state) => {
      const generations = [...state.generations, gen];
      savePersistedState({ user: state.user, projects: state.projects, currentProject: state.currentProject, customAgents: state.customAgents, generations });
      return { generations };
    }),
    updateGeneration: (id, updates) => set((state) => {
      const generations = state.generations.map((g) => g.id === id ? { ...g, ...updates } : g);
      savePersistedState({ user: state.user, projects: state.projects, currentProject: state.currentProject, customAgents: state.customAgents, generations });
      return { generations };
    }),

    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem(STORAGE_KEY);
      set({ user: null, projects: [], currentProject: null, generations: [], customAgents: [] });
    },
  };
});
