export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: SkillLevel;
  proficiency: number; // 0-100
  icon: string;
  yearsOfExperience: number;
}

export enum SkillCategory {
  LANGUAGES = 'Languages',
  FRONTEND = 'Frontend',
  BACKEND = 'Backend',
  AI_ML = 'AI & ML',
  DEVOPS = 'DevOps',
  ANIMATION = 'Animation',
}

export enum SkillLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
  EXPERT = 'Expert',
}