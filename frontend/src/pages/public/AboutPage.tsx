import { Reveal } from "../../components/Reveal";
import { IconLock, IconSparkles, IconChart } from "../../components/icons";

const TECH_STACK = [
  { name: "React 19 + TypeScript", detail: "Frontend UI, built with Vite" },
  { name: "Tailwind CSS v4", detail: "Utility-first styling with light/dark theming" },
  { name: "FastAPI (Python)", detail: "Backend REST API" },
  { name: "SQLite", detail: "Lightweight, file-based data storage" },
  { name: "Firebase Authentication", detail: "Google Sign-In" },
  { name: "LM Studio (local LLM server)", detail: "Runs the AI Assistant entirely on your machine" },
  { name: "fpdf2", detail: "Server-side PDF generation" },
];

export function AboutPage() {
  return (
    <div>
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-14 text-center">
        <Reveal>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">About ResumeForge</h1>
          <p className="mt-5 text-lg text-gray-600 dark:text-gray-300">
            ResumeForge is a resume builder built around one idea: your resume should be judged on your
            experience, not on whether a parser could read your layout — and the tools that help you write it
            shouldn't need your career history to leave your computer.
          </p>
        </Reveal>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
        <Reveal>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Why ResumeForge exists</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Most job applications today pass through an Applicant Tracking System before a person ever sees
            them. A great resume that a parser can't read correctly is, functionally, an invisible resume.
            ResumeForge starts from that constraint: every template is single-column, uses standard section
            headings, and avoids the graphical elements that commonly break ATS parsing — so the formatting
            decisions are made for you, correctly, from the start.
          </p>
        </Reveal>

        <Reveal delay={60}>
          <div className="flex items-start gap-3 bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 rounded-xl p-5">
            <IconSparkles className="w-6 h-6 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">A local-first approach to AI</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Rather than sending your resume content to a third-party AI API, ResumeForge's AI Assistant
                talks to a chat model you run yourself through LM Studio (tested with Qwen3-class models). It's
                instructed to work only from facts you've already provided — never inventing employers,
                metrics, or skills — and it simply doesn't work at all if there's no local model to reach,
                by design, rather than silently falling back to a cloud service.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="flex items-start gap-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl p-5">
            <IconChart className="w-6 h-6 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">ATS scoring without a black box</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                The ATS Analyzer doesn't call an AI model at all — it's a deterministic, rule-based scorer
                that checks section completeness, extracts and matches keywords and technical skills against a
                job description you provide, and flags common formatting risks. The same input always produces
                the same score, and the logic is simple enough to reason about.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={140}>
          <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl p-5">
            <IconLock className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Your data, tied to your account only</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Sign in with Google, and your resumes are stored against your account and yours alone — every
                request is authenticated and every resume lookup is checked against the signed-in user before
                it's returned.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Built with</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TECH_STACK.map((t) => (
                <div key={t.name} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg px-4 py-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{t.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.detail}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-8">
            ResumeForge is built as a portfolio demonstration project.
          </p>
        </div>
      </section>
    </div>
  );
}
