import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Reveal } from "../../components/Reveal";
import { TemplatePreviewCard } from "../../components/TemplatePreviewCard";
import { SAMPLE_RESUME } from "../../content/sampleResume";
import { TEMPLATES } from "../../types/template";
import { createResumeFromTemplate } from "../../lib/templateCta";
import {
  IconSparkles,
  IconChart,
  IconDownload,
  IconSave,
  IconLayers,
  IconLock,
} from "../../components/icons";

const FEATURES = [
  { icon: IconLayers, title: "3 ATS-Safe Templates", desc: "Classic, Modern, and Minimal layouts — all built on the same parser-friendly single-column structure." },
  { icon: IconChart, title: "ATS Analyzer", desc: "Score your resume against a real job description and see exactly which keywords and skills you're missing." },
  { icon: IconSparkles, title: "Local AI Assistant", desc: "Get writing help from an AI model running on your own machine — no cloud API, no data leaving your computer." },
  { icon: IconDownload, title: "One-Click PDF Export", desc: "Download a clean, recruiter-ready PDF in any of the three templates, generated server-side." },
  { icon: IconSave, title: "Safe Autosave", desc: "Your edits save automatically a couple seconds after you stop typing, with a manual Save always available too." },
  { icon: IconLock, title: "Privacy by Design", desc: "Your resumes are tied to your account only — sign in with Google, and nothing is shared with third parties." },
];

const TESTIMONIALS = [
  {
    quote: "The ATS analyzer caught three missing keywords I never would have noticed. Landed an interview the same week I fixed them.",
    name: "Amara O.",
    role: "Product Manager",
  },
  {
    quote: "I liked that the AI assistant runs locally — I didn't want a random cloud service storing my job search history.",
    name: "Diego R.",
    role: "Backend Developer",
  },
  {
    quote: "Switched templates in one click and the formatting didn't fall apart. That alone saved me an evening.",
    name: "Priya K.",
    role: "UX Designer",
  },
];

export function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [creatingTemplate, setCreatingTemplate] = useState<string | null>(null);

  function handlePrimaryCta() {
    navigate(user ? "/dashboard" : "/login");
  }

  async function handleUseTemplate(templateId: (typeof TEMPLATES)[number]["id"]) {
    setCreatingTemplate(templateId);
    try {
      await createResumeFromTemplate(templateId, user, navigate);
    } finally {
      setCreatingTemplate(null);
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
          <div className="rf-animate-in inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
            Local-first AI · No data leaves your machine
          </div>
          <h1 className="rf-animate-in text-4xl sm:text-6xl font-bold tracking-tight text-gray-900 dark:text-white" style={{ animationDelay: "80ms" }}>
            Build a resume that
            <br className="hidden sm:block" /> actually gets <span className="text-blue-600 dark:text-blue-400">past the ATS</span>
          </h1>
          <p className="rf-animate-in mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto" style={{ animationDelay: "160ms" }}>
            ResumeForge combines ATS-safe templates, a keyword-matching analyzer, and a private local AI
            assistant to help you write a resume that's both compelling and parser-friendly.
          </p>
          <div className="rf-animate-in mt-9 flex flex-col sm:flex-row items-center justify-center gap-3" style={{ animationDelay: "240ms" }}>
            <button
              onClick={handlePrimaryCta}
              className="w-full sm:w-auto bg-blue-600 text-white px-7 py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {user ? "Go to Dashboard" : "Start Building — It's Free"}
            </button>
            <button
              onClick={() => navigate("/templates")}
              className="w-full sm:w-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-7 py-3.5 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Browse Templates
            </button>
          </div>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Reveal className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Everything you need, nothing you don't</h2>
          <p className="mt-3 text-gray-500 dark:text-gray-400">
            A focused toolset built around one goal: a resume that reads well to both software and humans.
          </p>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 60} className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6">
              <div className="w-11 h-11 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <f.icon />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5">{f.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Templates preview */}
      <section className="bg-gray-50 dark:bg-gray-900/40 border-y border-gray-100 dark:border-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Pick a template, not a fight with formatting</h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400">
              Every template shares the same ATS-safe structure underneath — the only thing that changes is the style.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEMPLATES.map((t, i) => (
              <Reveal key={t.id} delay={i * 80}>
                <TemplatePreviewCard
                  template={t}
                  resume={SAMPLE_RESUME}
                  onUse={() => handleUseTemplate(t.id)}
                  busy={creatingTemplate === t.id}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* AI + ATS highlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <Reveal>
          <div className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-3">
            <IconSparkles className="w-5 h-5" /> Local AI Assistant
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Writing help that never leaves your machine
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            The AI Assistant connects to a chat model running locally through LM Studio — tested with
            Qwen3-class models. It tightens your summary, strengthens experience bullets with action verbs,
            and tailors suggestions to a specific job description.
          </p>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex gap-2"><span className="text-blue-500">&#10003;</span> Never fabricates employers, metrics, or skills</li>
            <li className="flex gap-2"><span className="text-blue-500">&#10003;</span> Works entirely offline once LM Studio is running</li>
            <li className="flex gap-2"><span className="text-blue-500">&#10003;</span> Tailors suggestions to a pasted job description</li>
          </ul>
        </Reveal>
        <Reveal delay={100}>
          <div className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-sm font-semibold mb-3">
            <IconChart className="w-5 h-5" /> ATS Analyzer
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Know your score before you hit apply
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Paste in a job description and get an instant ATS readiness score, matched vs. missing keywords,
            section-by-section completeness, and concrete suggestions — all computed locally, no AI required.
          </p>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex gap-2"><span className="text-indigo-500">&#10003;</span> Keyword and skill match against any job posting</li>
            <li className="flex gap-2"><span className="text-indigo-500">&#10003;</span> Section-by-section completeness breakdown</li>
            <li className="flex gap-2"><span className="text-indigo-500">&#10003;</span> Actionable strengths, improvements, and warnings</li>
          </ul>
        </Reveal>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 dark:bg-gray-900/40 border-y border-gray-100 dark:border-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Built with job seekers in mind</h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 80} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">&ldquo;{t.quote}&rdquo;</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{t.role}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <Reveal>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Ready to build your next resume?</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Free to use. Sign in with Google to get started in seconds.</p>
          <button
            onClick={handlePrimaryCta}
            className="bg-blue-600 text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {user ? "Go to Dashboard" : "Get Started Free"}
          </button>
        </Reveal>
      </section>
    </div>
  );
}
