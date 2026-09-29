export interface Education {
  school: string;
  degree: string;
  field: string;
  start_date: string;
  end_date: string;
  description: string;
}

export interface Experience {
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  description: string;
}

export interface Project {
  name: string;
  description: string;
  url: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
}

export interface Language {
  name: string;
  proficiency: string;
}

export interface Resume {
  id: number;
  user_id: string;
  title: string;
  full_name: string;
  job_title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  summary: string;
  skills: string[];
  education: Education[];
  experience: Experience[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  created_at: string;
  updated_at: string;
}

export type ResumeInput = Omit<Resume, "id" | "user_id" | "created_at" | "updated_at">;

export const defaultResumeInput: ResumeInput = {
  title: "Untitled Resume",
  full_name: "",
  job_title: "",
  email: "",
  phone: "",
  location: "",
  website: "",
  linkedin: "",
  summary: "",
  skills: [],
  education: [],
  experience: [],
  projects: [],
  certifications: [],
  languages: [],
};
