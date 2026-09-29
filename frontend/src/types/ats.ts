export interface AtsResponse {
  score: number;
  score_label: string;
  has_job_description: boolean;
  job_match_percentage: number | null;
  matched_keywords: string[];
  missing_keywords: string[];
  matched_skills: string[];
  missing_skills: string[];
  section_analysis: Record<string, { present: boolean; message: string; [key: string]: unknown }>;
  strengths: string[];
  improvements: string[];
  warnings: string[];
}
