export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured?: boolean;
  category: string;
  date: string;
  status: ProjectStatus;
  tags: string[];
}

export enum ProjectStatus {
  PRODUCTION = 'production',
  COMPLETED = 'completed',
  PUBLISHED = 'published',
  DRAFT = 'draft',
  CONCEPT = 'concept',
}