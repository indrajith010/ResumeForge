import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Reveal } from "../../components/Reveal";
import {
  IconDocument,
  IconChart,
  IconSparkles,
  IconDownload,
  IconLayers,
  IconSave,
} from "../../components/icons";

const FEATURE_SECTIONS = [
  {
    icon: IconDocument,
    color: "text-blue-600 dark:text-blue-400 bg-blue-600/10",
    title: "Resume Builder",
    tagline: "A structured editor, not a blank page",
    description:
      "Fill in Personal Information, Summary, Skills, Experience, Education, Projects, Certifications, and Languages through a guided form — each section validated and formatted consistently, so you never have to fight with layout by hand.",
    points: [
      "Add, reorder, and remove entries per section",
      "Live preview updates as you type",
      "Works identically across all three templates",
    ],
  },
  {
    icon: IconChart,
    color: "text-indigo-600 dark:text-indigo-400 bg-indigo-600/10",
    title: "ATS Analyzer",
    tagline: "Know exactly where your resume stands",
    description:
      "Paste a job description and get an instant score: keyword and skill overlap, section-by-section completeness, and a breakdown of strengths, gaps, and formatting warnings — computed locally with no AI dependency.",
    points: [
      "General ATS readiness score, with or without a job description",
      "Matched vs. missing keywords and skills",
      "Concrete, actionable improvement suggestions",
    ],
  },
  {
    icon: IconSparkles,
    color: "text-purple-600 dark:text-purple-400 bg-purple-600/10",
    title: "Local AI Assistant",
    tagline: "Writing help that stays on your machine",
    description:
      "Connects to a chat model running locally via LM Studio (tested with Qwen3-class models) to improve your summary, experience bullets, and project descriptions, or tailor suggestions to a specific job posting — without sending your data to a cloud API.",
    points: [
      "Never fabricates employers, metrics, or skills",
      "Tailor mode compares your resume against a job description",
      "Clear, friendly error messages if LM Studio isn't running",
    ],
  },
  {
    icon: IconLayers,
    color: "text-teal-600 dark:text-teal-400 bg-teal-600/10",
    title: "Templates",
    tagline: "Three styles, one ATS-safe structure",
    description:
      "Classic ATS, Modern Professional, and Minimal Clean all share the same single-column, standard-heading layout under the hood — so switching styles is purely cosmetic and never risks breaking parseability.",
    points: [
      "Switch templates any time without losing content",
      "Consistent structure recognized by ATS parsers",
      "Your template choice is remembered per browser",
    ],
  },
  {
    icon: IconDownload,
    color: "text-orange-600 dark:text-orange-400 bg-orange-600/10",
    title: "PDF Export",
    tagline: "A recruiter-ready file in one click",
    description:
      "Generates a clean PDF server-side in your chosen template, with sensible margins, consistent typography, and automatic pagination — ready to attach to an application immediately.",
    points: [
      "Matches the on-screen preview template",
      "Automatically named from your resume's title",
      "No watermarks, no sign-up walls",
    ],
  },
  {
    icon: IconSave,
    color: "text-green-600 dark:text-green-400 bg-green-600/10",
    title: "Safe Autosave",
    tagline: "Your work is saved before you think to ask",
    description:
      "Edits save automatically a couple of seconds after you stop typing, with a manual Save button always available and a warning before you navigate away with unsaved changes.",
    points: [
      "Debounced autosave avoids saving on every keystroke",
      "Status indicator shows Saving / Saved / Unsaved changes",
      "Confirmation prompt before discarding unsaved edits",
    ],
  },
];

export function FeaturesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-14 text-center">
        <Reveal>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">Everything ResumeForge does</h1>
          <p className="mt-5 text-lg text-gray-600 dark:text-gray-300">
            A focused set of tools for writing, checking, and exporting a resume that works — for both the
            software that screens it and the person who reads it next.
          </p>
        </Reveal>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-16">
        {FEATURE_SECTIONS.map((f, i) => (
          <Reveal key={f.title} delay={i * 40}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 border-t border-gray-100 dark:border-gray-800 pt-10 first:border-0 first:pt-0">
              <div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{f.title}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{f.tagline}</p>
              </div>
              <div className="lg:col-span-2">
                <p className="text-gray-600 dark:text-gray-300 mb-4">{f.description}</p>
                <ul className="space-y-2">
                  {f.points.map((point) => (
                    <li key={point} className="flex gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span className="text-blue-500 dark:text-blue-400 mt-0.5">&#10003;</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        ))}
      </section>

      <section className="bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800 py-16 text-center">
        <Reveal>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">See it in action</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate(user ? "/dashboard" : "/login")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {user ? "Go to Dashboard" : "Get Started Free"}
            </button>
            <button
              onClick={() => navigate("/templates")}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Browse Templates
            </button>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
