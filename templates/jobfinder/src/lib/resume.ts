import { Job } from './jobs';

export interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experience: string;
  education: string[];
  roles: string[];
}

export function parseResume(text: string): ParsedResume {
  const lower = text.toLowerCase();
  const techSkills = ['react', 'javascript', 'typescript', 'python', 'java', 'node.js', 'node', 'c++', 'c#', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'terraform', 'git', 'linux', 'html', 'css', 'angular', 'vue', 'next.js', 'django', 'flask', 'spring', 'express', 'rest', 'api', 'graphql', 'redux', 'webpack', 'babel', 'ci/cd', 'jenkins', 'agile', 'scrum', 'machine learning', 'deep learning', 'nlp', 'tensorflow', 'pytorch', 'data science', 'data analysis', 'tableau', 'power bi', 'excel', 'word', 'powerpoint', 'photoshop', 'figma', 'sketch', 'adobe xd', 'ui', 'ux', 'product management', 'project management', 'business analysis', 'sales', 'marketing', 'digital marketing', 'seo', 'content writing', 'leadership', 'management', 'communication', 'teamwork', 'problem solving', 'critical thinking', 'public speaking', 'negotiation', 'networking', 'security', 'testing', 'devops', 'mobile', 'android', 'ios', 'flutter', 'react native', 'blockchain', 'solidity', 'web3', 'sap', 'oracle', 'salesforce', 'hubspot', 'zoho', 'wordpress', 'shopify', 'magento'];
  const roles = ['React Developer', 'ReactJS', 'Next.js Developer', 'NextJS', 'Frontend Developer', 'UI Developer', 'UX Designer', 'UI/UX Designer', 'Backend Developer', 'Full Stack Developer', 'Software Engineer', 'Data Scientist', 'Data Analyst', 'DevOps Engineer', 'Product Manager', 'Project Manager', 'Business Analyst', 'Marketing Manager', 'Sales Executive', 'HR Manager', 'QA Engineer', 'SRE', 'Cloud Architect', 'ML Engineer', 'Mobile Developer', 'Technical Lead', 'Graphic Designer', 'Content Writer'];
  const experienceMatch = lower.match(/(\d+)\s*(?:years?\s*(?:of\s*)?experience|yrs?\s*(?:of\s*)?exp)/);
  return {
    name: extractName(text),
    email: extractEmail(text),
    phone: extractPhone(text),
    skills: techSkills.filter((s) => lower.includes(s)),
    experience: experienceMatch ? `${experienceMatch[1]} years` : 'Not specified',
    education: extractEducation(text),
    roles: roles.filter((r) => lower.includes(r.toLowerCase())),
  };
}

function extractEmail(text: string): string {
  const m = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return m ? m[0] : 'Not found';
}

function extractPhone(text: string): string {
  const m = text.match(/(?:\+91|0)?[-\s]?[6-9]\d{9}/);
  return m ? m[0] : 'Not found';
}

function extractName(text: string): string {
  const lines = text.split('\n').filter((l) => l.trim());
  return lines[0]?.trim()?.slice(0, 50) || 'Unknown';
}

function extractEducation(text: string): string[] {
  const degrees = ['bachelor', 'master', 'phd', 'b.tech', 'm.tech', 'b.e', 'm.e', 'b.sc', 'm.sc', 'b.com', 'm.com', 'ba', 'ma', 'mba', 'bca', 'mca', 'b.b.a', 'm.b.a', 'b.a', 'm.a', '12th', '10th', 'high school', 'diploma', 'bachelor of', 'master of', 'bachelor\'s', 'master\'s'];
  const found: string[] = [];
  for (const d of degrees) {
    if (text.toLowerCase().includes(d)) {
      const line = text.split('\n').find((l) => l.toLowerCase().includes(d));
      if (line) found.push(line.trim());
    }
  }
  return found.slice(0, 3);
}

export function matchJobs(resume: ParsedResume, jobs: Job[]): { job: Job; score: number; matchedSkills: string[] }[] {
  const results = jobs.map((job) => {
    const matchedSkills = job.skills.filter((s) => resume.skills.some((rs) => s.toLowerCase().includes(rs.toLowerCase()) || rs.toLowerCase().includes(s.toLowerCase())));
    const roleMatch = resume.roles.some((r) => job.role.toLowerCase().includes(r.toLowerCase().split(' ').slice(0, 2).join(' ')));
    const skillScore = job.skills.length > 0 ? matchedSkills.length / job.skills.length : 0;
    const score = skillScore * 0.7 + (roleMatch ? 0.3 : 0);
    return { job, score: Math.round(score * 100), matchedSkills };
  });
  return results.sort((a, b) => b.score - a.score);
}
