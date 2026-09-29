export interface AiSuggestion {
  suggestion: string;
  reason: string;
}

export interface TailorResumeResult {
  summary_suggestion: string;
  keyword_suggestions: string[];
  experience_suggestions: string[];
  project_suggestions: string[];
  overall_notes: string[];
}
