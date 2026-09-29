import { auth } from "../config/firebase";
import type { Resume, ResumeInput } from "../types/resume";
import type { AtsResponse } from "../types/ats";
import type { AiSuggestion, TailorResumeResult } from "../types/ai";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

async function authHeaders(): Promise<HeadersInit> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers: { ...headers, ...options.headers } });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  listResumes: () => request<Resume[]>("/api/resumes"),
  getResume: (id: number) => request<Resume>(`/api/resumes/${id}`),
  createResume: (data: ResumeInput) =>
    request<Resume>("/api/resumes", { method: "POST", body: JSON.stringify(data) }),
  updateResume: (id: number, data: ResumeInput) =>
    request<Resume>(`/api/resumes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteResume: (id: number) =>
    request<void>(`/api/resumes/${id}`, { method: "DELETE" }),

  importResume: async (file: File): Promise<ResumeInput> => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");
    const token = await user.getIdToken();
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/api/resumes/import`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail || `Import failed: ${res.status}`);
    }
    return res.json();
  },

  downloadPdf: async (id: number, filename: string, template: string = "classic") => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");
    const token = await user.getIdToken();
    const res = await fetch(`${API_BASE}/api/resumes/${id}/pdf?template=${template}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail || `PDF export failed: ${res.status}`);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  analyzeResume: (id: number, jobDescription: string = "") =>
    request<AtsResponse>(`/api/resumes/${id}/ats/analyze`, {
      method: "POST",
      body: JSON.stringify({ job_description: jobDescription }),
    }),

  improveSummary: (currentSummary: string, jobDescription: string = "") =>
    request<AiSuggestion>("/api/ai/improve-summary", {
      method: "POST",
      body: JSON.stringify({ current_summary: currentSummary, job_description: jobDescription }),
    }),

  improveExperience: (position: string, company: string, description: string, jobDescription: string = "") =>
    request<AiSuggestion>("/api/ai/improve-experience", {
      method: "POST",
      body: JSON.stringify({ position, company, description, job_description: jobDescription }),
    }),

  improveProject: (name: string, description: string, technologies: string = "", jobDescription: string = "") =>
    request<AiSuggestion>("/api/ai/improve-project", {
      method: "POST",
      body: JSON.stringify({ name, description, technologies, job_description: jobDescription }),
    }),

  tailorResume: (resumeText: string, jobDescription: string) =>
    request<TailorResumeResult>("/api/ai/tailor-resume", {
      method: "POST",
      body: JSON.stringify({ resume_text: resumeText, job_description: jobDescription }),
    }),
};
