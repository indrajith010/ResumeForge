import { useId, useState } from "react";
import { api } from "../lib/api";
import { aiErrorMessage } from "../lib/aiErrorMessage";
import type { Resume } from "../types/resume";
import type { AiSuggestion, TailorResumeResult } from "../types/ai";

interface Props {
  resume: Resume;
  onApplySummary: (summary: string) => void;
  onApplyExperience: (index: number, description: string) => void;
  onApplyProject: (index: number, description: string) => void;
}

export function AiAssistant({ resume, onApplySummary, onApplyExperience, onApplyProject }: Props) {
  const jobDescriptionId = useId();
  const experienceSelectId = useId();
  const projectSelectId = useId();
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"summary" | "experience" | "project" | "tailor">("summary");

  const [summaryResult, setSummaryResult] = useState<AiSuggestion | null>(null);
  const [expIndex, setExpIndex] = useState(0);
  const [expResult, setExpResult] = useState<AiSuggestion | null>(null);
  const [projIndex, setProjIndex] = useState(0);
  const [projResult, setProjResult] = useState<AiSuggestion | null>(null);
  const [tailorResult, setTailorResult] = useState<TailorResumeResult | null>(null);

  function resumeToText(): string {
    const parts = [
      `Name: ${resume.full_name}`,
      `Title: ${resume.job_title}`,
      `Summary: ${resume.summary}`,
      `Skills: ${resume.skills.join(", ")}`,
      ...resume.experience.map((e) => `Experience: ${e.position} at ${e.company} - ${e.description}`),
      ...resume.education.map((e) => `Education: ${e.degree} ${e.field} from ${e.school}`),
      ...resume.projects.map((p) => `Project: ${p.name} - ${p.description}`),
      ...resume.certifications.map((c) => `Certification: ${c.name} from ${c.issuer}`),
    ];
    return parts.join("\n");
  }

  async function handleImproveSummary() {
    try {
      setLoading(true);
      setError("");
      const result = await api.improveSummary(resume.summary, jobDescription);
      setSummaryResult(result);
    } catch (e) {
      setError(aiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleImproveExperience() {
    const exp = resume.experience[expIndex];
    if (!exp) return;
    try {
      setLoading(true);
      setError("");
      const result = await api.improveExperience(exp.position, exp.company, exp.description, jobDescription);
      setExpResult(result);
    } catch (e) {
      setError(aiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleImproveProject() {
    const proj = resume.projects[projIndex];
    if (!proj) return;
    try {
      setLoading(true);
      setError("");
      const result = await api.improveProject(proj.name, proj.description, "", jobDescription);
      setProjResult(result);
    } catch (e) {
      setError(aiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleTailorResume() {
    try {
      setLoading(true);
      setError("");
      const result = await api.tailorResume(resumeToText(), jobDescription);
      setTailorResult(result);
    } catch (e) {
      setError(aiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  const tabs = [
    { key: "summary" as const, label: "Summary" },
    { key: "experience" as const, label: "Experience" },
    { key: "project" as const, label: "Project" },
    { key: "tailor" as const, label: "Tailor" },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-purple-600 dark:text-purple-400 font-semibold">AI</span>
        <h3 className="font-semibold text-gray-900 dark:text-white">AI Resume Assistant</h3>
      </div>

      <div className="mb-4">
        <label htmlFor={jobDescriptionId} className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Job Description (optional)</label>
        <textarea
          id={jobDescriptionId}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={3}
          className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
          placeholder="Paste job description for context-aware suggestions..."
        />
      </div>

      <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1" role="tablist" aria-label="AI assistance type">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 text-xs py-1.5 rounded-md transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
              activeTab === tab.key
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm font-medium"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {activeTab === "summary" && (
        <div className="space-y-3">
          <button
            onClick={handleImproveSummary}
            disabled={loading}
            className="w-full bg-purple-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading ? "Generating..." : "Improve Summary"}
          </button>
          {summaryResult && (
            <AiResult
              result={summaryResult}
              onApply={() => { onApplySummary(summaryResult.suggestion); setSummaryResult(null); }}
              onDismiss={() => setSummaryResult(null)}
            />
          )}
        </div>
      )}

      {activeTab === "experience" && (
        <div className="space-y-3">
          {resume.experience.length > 0 ? (
            <>
              <label htmlFor={experienceSelectId} className="sr-only">Select experience entry to improve</label>
              <select
                id={experienceSelectId}
                value={expIndex}
                onChange={(e) => { setExpIndex(Number(e.target.value)); setExpResult(null); }}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
              >
                {resume.experience.map((exp, i) => (
                  <option key={i} value={i}>{exp.position || `Experience ${i + 1}`} at {exp.company || "Unknown"}</option>
                ))}
              </select>
              <button
                onClick={handleImproveExperience}
                disabled={loading}
                className="w-full bg-purple-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {loading ? "Generating..." : "Improve Experience"}
              </button>
              {expResult && (
                <AiResult
                  result={expResult}
                  onApply={() => { onApplyExperience(expIndex, expResult.suggestion); setExpResult(null); }}
                  onDismiss={() => setExpResult(null)}
                />
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500">Add experience entries first.</p>
          )}
        </div>
      )}

      {activeTab === "project" && (
        <div className="space-y-3">
          {resume.projects.length > 0 ? (
            <>
              <label htmlFor={projectSelectId} className="sr-only">Select project entry to improve</label>
              <select
                id={projectSelectId}
                value={projIndex}
                onChange={(e) => { setProjIndex(Number(e.target.value)); setProjResult(null); }}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
              >
                {resume.projects.map((proj, i) => (
                  <option key={i} value={i}>{proj.name || `Project ${i + 1}`}</option>
                ))}
              </select>
              <button
                onClick={handleImproveProject}
                disabled={loading}
                className="w-full bg-purple-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {loading ? "Generating..." : "Improve Project"}
              </button>
              {projResult && (
                <AiResult
                  result={projResult}
                  onApply={() => { onApplyProject(projIndex, projResult.suggestion); setProjResult(null); }}
                  onDismiss={() => setProjResult(null)}
                />
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500">Add project entries first.</p>
          )}
        </div>
      )}

      {activeTab === "tailor" && (
        <div className="space-y-3">
          <button
            onClick={handleTailorResume}
            disabled={loading || !jobDescription.trim()}
            className="w-full bg-purple-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading ? "Generating..." : "Tailor Resume to Job"}
          </button>
          {!jobDescription.trim() && (
            <p className="text-xs text-gray-400 dark:text-gray-500">Paste a job description above to enable tailoring.</p>
          )}
          {tailorResult && (
            <TailorResult result={tailorResult} onDismiss={() => setTailorResult(null)} />
          )}
        </div>
      )}
    </div>
  );
}

function AiResult({ result, onApply, onDismiss }: { result: AiSuggestion; onApply: () => void; onDismiss: () => void }) {
  return (
    <div className="bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 rounded-lg p-4 space-y-3">
      <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">{result.reason}</div>
      <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap bg-white dark:bg-gray-900 rounded p-3 border border-purple-100 dark:border-purple-500/20">
        {result.suggestion}
      </div>
      <div className="flex gap-2">
        <button
          onClick={onApply}
          className="bg-purple-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-purple-700 cursor-pointer"
        >
          Apply
        </button>
        <button
          onClick={onDismiss}
          className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

function TailorResult({ result, onDismiss }: { result: TailorResumeResult; onDismiss: () => void }) {
  return (
    <div className="bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 rounded-lg p-4 space-y-4">
      {result.summary_suggestion && (
        <div>
          <h5 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">Summary Suggestion</h5>
          <p className="text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900 rounded p-3 border border-purple-100 dark:border-purple-500/20 whitespace-pre-wrap">
            {result.summary_suggestion}
          </p>
        </div>
      )}

      {result.keyword_suggestions.length > 0 && (
        <div>
          <h5 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">Suggested Keywords</h5>
          <div className="flex flex-wrap gap-1.5">
            {result.keyword_suggestions.map((k, i) => (
              <span key={i} className="bg-white dark:bg-gray-900 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 px-2 py-0.5 rounded text-xs">{k}</span>
            ))}
          </div>
        </div>
      )}

      {result.experience_suggestions.length > 0 && (
        <div>
          <h5 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">Experience Suggestions</h5>
          <ul className="space-y-1">
            {result.experience_suggestions.map((s, i) => (
              <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                <span className="text-purple-400 dark:text-purple-500 mt-0.5">&#8226;</span> {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.project_suggestions.length > 0 && (
        <div>
          <h5 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">Project Suggestions</h5>
          <ul className="space-y-1">
            {result.project_suggestions.map((s, i) => (
              <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                <span className="text-purple-400 dark:text-purple-500 mt-0.5">&#8226;</span> {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.overall_notes.length > 0 && (
        <div>
          <h5 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">Overall Notes</h5>
          <ul className="space-y-1">
            {result.overall_notes.map((n, i) => (
              <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                <span className="text-purple-400 dark:text-purple-500 mt-0.5">&#8226;</span> {n}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={onDismiss}
        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
      >
        Dismiss
      </button>
    </div>
  );
}
