export interface LessonPlan {
  id: string;
  title: string;
  prompt: string;
  status: string;
  ai_model: string;
  created_at: string;
  updated_at: string;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  lesson_number: number;
  title: string;
  description: string;
  key_points: string[];
  talking_points: string[];
  script_outline: string;
  full_script: string;
  script_author: string;
  script_image: string;
  image_prompt: string;
  ppt_path: string;
  drive_script_link: string;
  drive_ppt_link: string;
  resources: { title: string; url: string }[];
  duration_minutes: number;
  status: string;
  video?: YouTubeVideo | null;
}

export interface YouTubeVideo {
  id: string;
  youtube_video_id: string;
  title: string;
  description: string;
  tags: string[];
  upload_date: string | null;
  view_count: number;
  like_count: number;
  comment_count: number;
  last_fetched_at: string | null;
}

export interface PromptHistory {
  id: string;
  plan_id: string;
  raw_prompt: string;
  ai_response: Record<string, unknown> | null;
  model_used: string;
  tokens_used: number;
  created_at: string;
}
