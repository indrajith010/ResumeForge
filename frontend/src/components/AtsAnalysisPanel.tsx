import { useId, useState } from "react";
import { api } from "../lib/api";
import type { AtsResponse } from "../types/ats";

interface Props {
  resumeId: number;
}

export function AtsAnalysisPanel({ resumeId }: Props) {
  const jobDescriptionId = useId();
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<AtsResponse | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    try {
      setAnalyzing(true);
      setError("");
      const data = await api.analyzeResume(resumeId, jobDescription);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }

  function scoreColor(score: number) {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-500";
  }

  function scoreBg(score: number) {
    if (score >= 75) return "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30";
    if (score >= 50) return "bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/30";
    return "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30";
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">ATS Resume Analysis</h3>

      <div className="mb-4">
        <label htmlFor={jobDescriptionId} className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
          Job Description <span className="text-gray-400 dark:text-gray-500">(optional)</span>
        </label>
        <textarea
          id={jobDescriptionId}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={4}
          className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
          placeholder="Paste a job description to analyze keyword match..."
        />
      </div>

      <button
        onClick={handleAnalyze}
        disabled={analyzing}
        className="w-full bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer mb-4"
      >
        {analyzing ? "Analyzing..." : "Analyze Resume"}
      </button>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-5">
          <div className={`border rounded-xl p-5 text-center ${scoreBg(result.score)}`}>
            <div className={`text-5xl font-bold ${scoreColor(result.score)}`}>{result.score}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{result.score_label}</div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {result.has_job_description ? "ATS Score vs Job Description" : "General ATS Readiness Score"}
            </div>
          </div>

          {result.has_job_description && result.job_match_percentage !== null && (
            <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl p-4">
              <div className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                Job Match: <span className="text-2xl font-bold">{result.job_match_percentage}%</span>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-900/50 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${result.job_match_percentage}%` }}
                />
              </div>
            </div>
          )}

          {result.matched_skills.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Matched Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {result.matched_skills.map((s, i) => (
                  <span key={i} className="bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 px-2 py-0.5 rounded text-xs">{s}</span>
                ))}
              </div>
            </div>
          )}

          {result.missing_skills.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Missing Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {result.missing_skills.map((s, i) => (
                  <span key={i} className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-0.5 rounded text-xs">{s}</span>
                ))}
              </div>
            </div>
          )}

          {result.matched_keywords.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                Matched Keywords ({result.matched_keywords.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {result.matched_keywords.slice(0, 15).map((k, i) => (
                  <span key={i} className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded text-xs">{k}</span>
                ))}
              </div>
            </div>
          )}

          {result.missing_keywords.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                Missing Keywords ({result.missing_keywords.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {result.missing_keywords.slice(0, 15).map((k, i) => (
                  <span key={i} className="bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded text-xs">{k}</span>
                ))}
              </div>
            </div>
          )}

          {result.strengths.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Strengths</h4>
              <ul className="space-y-1">
                {result.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-green-700 dark:text-green-400 flex items-start gap-2">
                    <span className="mt-0.5">&#10003;</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.improvements.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Improvements</h4>
              <ul className="space-y-1">
                {result.improvements.map((s, i) => (
                  <li key={i} className="text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2">
                    <span className="mt-0.5">&#9888;</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.warnings.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Warnings</h4>
              <ul className="space-y-1">
                {result.warnings.map((w, i) => (
                  <li key={i} className="text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
                    <span className="mt-0.5">&#9888;</span> {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Section Breakdown</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(result.section_analysis).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-800 rounded px-3 py-2">
                  <span className="capitalize text-gray-600 dark:text-gray-300">{key}</span>
                  <span className={val.present ? "text-green-600" : "text-red-500"}>
                    {val.present ? "\u2713" : "\u2717"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
