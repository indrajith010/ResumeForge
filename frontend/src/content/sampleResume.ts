import type { Resume } from "../types/resume";

export const SAMPLE_RESUME: Resume = {
  id: 0,
  user_id: "sample",
  title: "Sample Resume",
  full_name: "Jordan Lee",
  job_title: "Senior Frontend Engineer",
  email: "jordan.lee@email.com",
  phone: "(555) 012-3456",
  location: "Austin, TX",
  website: "jordanlee.dev",
  linkedin: "linkedin.com/in/jordanlee",
  summary:
    "Frontend engineer with 6+ years building accessible, performant web applications. Led the migration of a 200k-line React codebase to TypeScript and mentored four junior engineers.",
  skills: ["React", "TypeScript", "Node.js", "GraphQL", "Accessibility", "CI/CD"],
  education: [
    { school: "University of Texas at Austin", degree: "B.S.", field: "Computer Science", start_date: "2014", end_date: "2018", description: "" },
  ],
  experience: [
    {
      company: "Northwind Software",
      position: "Senior Frontend Engineer",
      start_date: "2021",
      end_date: "Present",
      description: "Led migration of core product to TypeScript, cutting production bugs by 34%. Built a component library adopted across 5 teams.",
    },
    {
      company: "Bluepeak Labs",
      position: "Frontend Engineer",
      start_date: "2018",
      end_date: "2021",
      description: "Shipped customer-facing dashboard used by 40k+ monthly active users. Improved Lighthouse performance score from 61 to 94.",
    },
  ],
  projects: [
    { name: "OpenA11y Toolkit", description: "Open-source accessibility linting toolkit with 1,200+ GitHub stars.", url: "github.com/example/opena11y" },
  ],
  certifications: [
    { name: "AWS Certified Developer – Associate", issuer: "Amazon Web Services", date: "2023" },
  ],
  languages: [
    { name: "English", proficiency: "Native" },
    { name: "Spanish", proficiency: "Conversational" },
  ],
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};
