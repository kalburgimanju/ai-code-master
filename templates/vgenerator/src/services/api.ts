const API_BASE = '/api';

export interface GenerateVideoResponse {
  id: string;
  status: 'queued';
}

export interface TaskStatus {
  task_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  stage?: string;
  progress?: number;
  video_file?: string;
  audio_duration?: number;
  task_dir?: string;
  error?: string;
}

export const api = {
  generateVideo: async (topic: string, settings: Record<string, unknown>): Promise<GenerateVideoResponse> => {
    const res = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, settings }),
    });
    if (!res.ok) throw new Error(`Failed to queue video: ${res.statusText}`);
    return res.json();
  },

  getTaskStatus: async (taskId: string): Promise<TaskStatus> => {
    const res = await fetch(`${API_BASE}/task/${taskId}`);
    if (!res.ok) throw new Error(`Failed to get task status: ${res.statusText}`);
    return res.json();
  },

  getVideoUrl: (taskDir: string, filename: string): string => {
    return `${API_BASE}/video/${encodeURIComponent(taskDir)}/${encodeURIComponent(filename)}`;
  },

  downloadVideo: (taskDir: string, filename: string): string => {
    return `${API_BASE}/download/${encodeURIComponent(taskDir)}/${encodeURIComponent(filename)}`;
  },
};
