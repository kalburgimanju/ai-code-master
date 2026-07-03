// Grade levels for Sanskrit learning (1-10 years)
export type GradeLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

// Media types for resources
export type ResourceType = 'book' | 'audio' | 'video' | 'lesson' | 'learning-video';

// Reference source
export interface Reference {
  id: string;
  title: string;
  author: string;
  edition?: string;
  page?: number;
  url?: string;
}

// Lesson structure
export interface Lesson {
  id: string;
  grade: GradeLevel;
  title: string;
  sanskritText: string;
  englishTranslation: string;
  romanTranslation?: string;
  explanation: string;
  resources: Resource[];
  references: Reference[];
  practiceQuestions?: PracticeQuestion[];
}

// Learning resource
export interface Resource {
  id: string;
  type: ResourceType;
  title: string;
  url: string;
  description?: string;
  duration?: string; // for audio/video
  pages?: number; // for books
}

// Practice question
export interface PracticeQuestion {
  id: string;
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
}

// Grade curriculum
export interface GradeCurriculum {
  grade: GradeLevel;
  title: string;
  description: string;
  lessons: LessonSummary[];
  resources: Resource[];
}

// Lesson summary for curriculum overview
export interface LessonSummary {
  id: string;
  title: string;
  description: string;
  duration: string;
}

// User progress tracking
export interface UserProgress {
  lessonId: string;
  completed: boolean;
  score?: number;
  lastAccessed?: Date;
}