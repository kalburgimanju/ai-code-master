const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Plans
export const api = {
  listPlans: () => request<import("./types").LessonPlan[]>("/plans"),
  getPlan: (id: string) => request<import("./types").LessonPlan & { lessons: import("./types").Lesson[] }>(`/plans/${id}`),
  createPlan: (title: string, prompt: string) =>
    request<import("./types").LessonPlan>("/plans", { method: "POST", body: JSON.stringify({ title, prompt }) }),
  deletePlan: (id: string) => request(`/plans/${id}`, { method: "DELETE" }),
  updateLesson: (planId: string, lessonId: string, data: Partial<import("./types").Lesson>) =>
    request<import("./types").Lesson>(`/plans/${planId}/lessons/${lessonId}`, { method: "PUT", body: JSON.stringify(data) }),

  getLesson: (planId: string, lessonId: string) =>
    request<import("./types").Lesson>(`/plans/${planId}/lessons/${lessonId}`),

  // Script generation
  generateScript: (planId: string, lessonId: string) =>
    request<{ lesson: import("./types").Lesson; model_used: string; tokens_used: number }>(
      `/plans/${planId}/lessons/${lessonId}/generate-script`,
      { method: "POST", body: JSON.stringify({}) }
    ),

  // YouTube metadata generation
  generateMetadata: (planId: string, lessonId: string) =>
    request<{ title: string; description: string; model_used: string; tokens_used: number }>(
      `/plans/${planId}/lessons/${lessonId}/generate-metadata`,
      { method: "POST", body: JSON.stringify({}) }
    ),

  // PPT generation
  generatePpt: (planId: string, lessonId: string) =>
    request<{ ppt_path: string; download_url: string; slides_count: number; model_used: string; tokens_used: number }>(
      `/plans/${planId}/lessons/${lessonId}/generate-ppt`,
      { method: "POST", body: JSON.stringify({}) }
    ),

  // Google Drive upload
  uploadToDrive: (planId: string, lessonId: string) =>
    request<{ script_doc_id: string; script_doc_link: string; ppt_file_id: string; ppt_file_link: string }>(
      `/drive/upload/${planId}/lessons/${lessonId}`,
      { method: "POST", body: JSON.stringify({}) }
    ),

  // Agent
  generatePlan: (title: string, prompt: string, numLessons = 5) =>
    request<{ plan: import("./types").LessonPlan & { lessons: import("./types").Lesson[] }; prompt_history: import("./types").PromptHistory }>(
      "/agent/generate",
      { method: "POST", body: JSON.stringify({ title, prompt, num_lessons: numLessons }) }
    ),

  // YouTube
  getYouTubeAuthUrl: () => request<{ auth_url: string }>("/youtube/auth-url"),
  youtubeStatus: () => request<{ authenticated: boolean }>("/youtube/status"),
  refreshAnalytics: () => request<{ refreshed: number; total: number }>("/youtube/refresh", { method: "POST" }),
  getVideoAnalytics: (videoId: string) => request<import("./types").YouTubeVideo>(`/youtube/analytics/${videoId}`),
  uploadVideo: async (lessonId: string, title: string, description: string, tags: string, file: File) => {
    const form = new FormData();
    form.append("lesson_id", lessonId);
    form.append("title", title);
    form.append("description", description);
    form.append("tags", tags);
    form.append("file", file);
    const res = await fetch(`${BASE}/youtube/upload`, { method: "POST", body: form });
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  },
};
