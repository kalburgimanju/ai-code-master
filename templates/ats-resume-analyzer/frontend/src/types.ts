export interface ScoreBreakdown {
  keywordMatch: number;
  skillsAlignment: number;
  experienceMatch: number;
  educationMatch: number;
  grammarScore: number;
  completenessScore: number;
}

export interface AnalysisResult {
  atsScore: number;
  scoreBreakdown: ScoreBreakdown;
  extractedSkills: string[];
  extractedExperience: string[];
  extractedEducation: string[];
  missingKeywords: string[];
  suggestedSkills: string[];
  improvements: string[];
  strongestMatches: string[];
  strengths: string[];
  weaknesses: string[];
  analysisDate: string;
  processingTime: number;
}

export interface AnalysisResponse {
  success: boolean;
  message: string;
  atsScore?: number;
  scoreBreakdown?: {
    keywordMatch: number;
    skillsAlignment: number;
    experienceMatch: number;
    educationMatch: number;
    grammarScore: number;
    completenessScore: number;
  };
  extractedSkills?: string[];
  extractedExperience?: string[];
  extractedEducation?: string[];
  missingKeywords?: string[];
  suggestedSkills?: string[];
  improvements?: string[];
  strongestMatches?: string[];
  strengths?: string[];
  weaknesses?: string[];
  analysisDate?: string;
  processingTime?: number;
}

export interface ResumeAnalysis {
  atsScore: number;
  scoreBreakdown: ScoreBreakdown;
  extractedSkills: string[];
  extractedExperience: string[];
  extractedEducation: string[];
  missingKeywords: string[];
  suggestedSkills: string[];
  improvements: string[];
  strongestMatches: string[];
  strengths: string[];
  weaknesses: string[];
  analysisDate: string;
}