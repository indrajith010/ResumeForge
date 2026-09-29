import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import type { Resume, Education, Experience, Project, Certification, Language } from "../types/resume";
import type { TemplateId } from "../types/template";
import { AtsAnalysisPanel } from "../components/AtsAnalysisPanel";
import { AiAssistant } from "../components/AiAssistant";
import { ConfirmDialog } from "../components/ConfirmDialog";
import TemplateSelector from "../components/TemplateSelector";
import ClassicAts from "../components/templates/ClassicAts";
import ModernProfessional from "../components/templates/ModernProfessional";
import MinimalClean from "../components/templates/MinimalClean";
import { PersonalInfoSection } from "../components/builder/PersonalInfoSection";
import { SummarySection } from "../components/builder/SummarySection";
import { SkillsSection } from "../components/builder/SkillsSection";
import { ExperienceSection } from "../components/builder/ExperienceSection";
import { EducationSection } from "../components/builder/EducationSection";
import { ProjectsSection } from "../components/builder/ProjectsSection";
import { CertificationsSection } from "../components/builder/CertificationsSection";
import { LanguagesSection } from "../components/builder/LanguagesSection";

const emptyEducation = (): Education => ({ school: "", degree: "", field: "", start_date: "", end_date: "", description: "" });
const emptyExperience = (): Experience => ({ company: "", position: "", start_date: "", end_date: "", description: "" });
const emptyProject = (): Project => ({ name: "", description: "", url: "" });
const emptyCertification = (): Certification => ({ name: "", issuer: "", date: "" });
const emptyLanguage = (): Language => ({ name: "", proficiency: "" });

const AUTOSAVE_DELAY_MS = 2000;

function getSavedTemplate(): TemplateId {
  try {
    const v = localStorage.getItem("rf_template");
    if (v === "classic" || v === "modern" || v === "minimal") return v;
  } catch {
    // localStorage unavailable (private browsing, etc.) — fall back to default.
  }
  return "classic";
}

// Generic list-item helpers. These only close over the stable setResume/setSaved
// setters (never over `resume` itself), so wrapping calls to them in useCallback
// with an empty dependency array is safe and gives memoized section components a
// stable callback identity — letting React skip re-rendering unrelated sections
// while the user types in one section.
function updateListItem<T>(
  setResume: React.Dispatch<React.SetStateAction<Resume | null>>,
  field: keyof Resume,
  index: number,
  itemField: keyof T,
  value: string,
) {
  setResume((prev) => {
    if (!prev) return prev;
    const list = [...(prev[field] as unknown as T[])];
    list[index] = { ...list[index], [itemField]: value };
    return { ...prev, [field]: list } as Resume;
  });
}

function addListItem<T>(
  setResume: React.Dispatch<React.SetStateAction<Resume | null>>,
  field: keyof Resume,
  factory: () => T,
) {
  setResume((prev) => (prev ? ({ ...prev, [field]: [...(prev[field] as unknown as T[]), factory()] } as Resume) : prev));
}

function removeListItem(
  setResume: React.Dispatch<React.SetStateAction<Resume | null>>,
  field: keyof Resume,
  index: number,
) {
  setResume((prev) => {
    if (!prev) return prev;
    const list = [...(prev[field] as unknown as unknown[])];
    list.splice(index, 1);
    return { ...prev, [field]: list } as Resume;
  });
}

export function ResumeBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [template, setTemplate] = useState<TemplateId>(getSavedTemplate);
  const [mobileTab, setMobileTab] = useState<"form" | "preview">("form");
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const loadResume = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getResume(Number(id));
      setResume(data);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load resume");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadResume();
  }, [loadResume]);

  function onSelectTemplate(t: TemplateId) {
    setTemplate(t);
    try {
      localStorage.setItem("rf_template", t);
    } catch {
      // localStorage unavailable — template choice just won't persist across sessions.
    }
  }

  const handleSave = useCallback(async () => {
    if (!resume || saving) return;
    try {
      setSaving(true);
      setError("");
      const updated = await api.updateResume(resume.id, resume);
      setResume(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }, [resume, saving]);

  // Safe autosave: debounced 2s after the last edit, skipped whenever there is
  // nothing dirty to save or a save is already in flight. Manual Save remains
  // available and behaves identically to before.
  useEffect(() => {
    if (!resume || saved) return;
    const timer = setTimeout(() => {
      handleSave();
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [resume, saved, handleSave]);

  // Fallback safety net for the small window before autosave fires.
  useEffect(() => {
    function handler(e: BeforeUnloadEvent) {
      if (!saved) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [saved]);

  function handleTitleChange(value: string) {
    setResume((prev) => (prev ? { ...prev, title: value } : prev));
    setSaved(false);
  }

  const onPersonalChange = useCallback((field: keyof Pick<Resume,
    "full_name" | "job_title" | "email" | "phone" | "location" | "website" | "linkedin"
  >, value: string) => {
    setResume((prev) => (prev ? { ...prev, [field]: value } : prev));
    setSaved(false);
  }, []);

  const onSummaryChange = useCallback((value: string) => {
    setResume((prev) => (prev ? { ...prev, summary: value } : prev));
    setSaved(false);
  }, []);

  const onSkillAdd = useCallback((skill: string) => {
    setResume((prev) => (prev ? { ...prev, skills: [...prev.skills, skill] } : prev));
    setSaved(false);
  }, []);

  const onSkillRemove = useCallback((index: number) => {
    setResume((prev) => {
      if (!prev) return prev;
      const s = [...prev.skills];
      s.splice(index, 1);
      return { ...prev, skills: s };
    });
    setSaved(false);
  }, []);

  const onExperienceUpdate = useCallback((i: number, field: keyof Experience, value: string) => {
    updateListItem<Experience>(setResume, "experience", i, field, value);
    setSaved(false);
  }, []);
  const onExperienceAdd = useCallback(() => {
    addListItem<Experience>(setResume, "experience", emptyExperience);
    setSaved(false);
  }, []);
  const onExperienceRemove = useCallback((i: number) => {
    removeListItem(setResume, "experience", i);
    setSaved(false);
  }, []);

  const onEducationUpdate = useCallback((i: number, field: keyof Education, value: string) => {
    updateListItem<Education>(setResume, "education", i, field, value);
    setSaved(false);
  }, []);
  const onEducationAdd = useCallback(() => {
    addListItem<Education>(setResume, "education", emptyEducation);
    setSaved(false);
  }, []);
  const onEducationRemove = useCallback((i: number) => {
    removeListItem(setResume, "education", i);
    setSaved(false);
  }, []);

  const onProjectUpdate = useCallback((i: number, field: keyof Project, value: string) => {
    updateListItem<Project>(setResume, "projects", i, field, value);
    setSaved(false);
  }, []);
  const onProjectAdd = useCallback(() => {
    addListItem<Project>(setResume, "projects", emptyProject);
    setSaved(false);
  }, []);
  const onProjectRemove = useCallback((i: number) => {
    removeListItem(setResume, "projects", i);
    setSaved(false);
  }, []);

  const onCertificationUpdate = useCallback((i: number, field: keyof Certification, value: string) => {
    updateListItem<Certification>(setResume, "certifications", i, field, value);
    setSaved(false);
  }, []);
  const onCertificationAdd = useCallback(() => {
    addListItem<Certification>(setResume, "certifications", emptyCertification);
    setSaved(false);
  }, []);
  const onCertificationRemove = useCallback((i: number) => {
    removeListItem(setResume, "certifications", i);
    setSaved(false);
  }, []);

  const onLanguageUpdate = useCallback((i: number, field: keyof Language, value: string) => {
    updateListItem<Language>(setResume, "languages", i, field, value);
    setSaved(false);
  }, []);
  const onLanguageAdd = useCallback(() => {
    addListItem<Language>(setResume, "languages", emptyLanguage);
    setSaved(false);
  }, []);
  const onLanguageRemove = useCallback((i: number) => {
    removeListItem(setResume, "languages", i);
    setSaved(false);
  }, []);

  async function handleDownloadPdf() {
    if (!resume) return;
    try {
      setExporting(true);
      setError("");
      const safeName = (resume.full_name || "Resume").replace(/[^a-zA-Z0-9 ]/g, "").trim().replace(/\s+/g, "_");
      const filename = `${safeName || "Resume"}_Resume.pdf`;
      await api.downloadPdf(resume.id, filename, template);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export PDF");
    } finally {
      setExporting(false);
    }
  }

  const applyAiSummary = useCallback((summary: string) => {
    setResume((prev) => (prev ? { ...prev, summary } : prev));
    setSaved(false);
  }, []);

  const applyAiExperience = useCallback((index: number, description: string) => {
    setResume((prev) => {
      if (!prev) return prev;
      const exp = [...prev.experience];
      exp[index] = { ...exp[index], description };
      return { ...prev, experience: exp };
    });
    setSaved(false);
  }, []);

  const applyAiProject = useCallback((index: number, description: string) => {
    setResume((prev) => {
      if (!prev) return prev;
      const proj = [...prev.projects];
      proj[index] = { ...proj[index], description };
      return { ...prev, projects: proj };
    });
    setSaved(false);
  }, []);

  function handleBack() {
    if (!saved) {
      setShowLeaveConfirm(true);
    } else {
      navigate("/dashboard");
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center text-gray-400 dark:text-gray-500">Loading...</div>;
  if (error && !resume) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center text-red-500">{error}</div>;
  if (!resume) return null;

  const TemplateComponent = template === "modern" ? ModernProfessional : template === "minimal" ? MinimalClean : ClassicAts;
  const statusText = saving ? "Saving..." : saved ? "Saved" : "Unsaved changes";
  const statusClass = saving ? "text-gray-400 dark:text-gray-500" : saved ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <ConfirmDialog
        open={showLeaveConfirm}
        title="Discard unsaved changes?"
        message="You have unsaved changes that haven't been saved yet. Leave without saving?"
        confirmLabel="Leave"
        cancelLabel="Stay"
        danger
        onConfirm={() => navigate("/dashboard")}
        onCancel={() => setShowLeaveConfirm(false)}
      />

      {/* Top nav */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <div className="max-w-full mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
            <button
              onClick={handleBack}
              aria-label="Back to dashboard"
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            >
              &#8592;
            </button>
            <span className="text-gray-300 dark:text-gray-700 hidden sm:inline">|</span>
            <label htmlFor="resume-title" className="sr-only">Resume title</label>
            <input
              id="resume-title"
              value={resume.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="text-lg font-semibold text-gray-900 dark:text-white border-none outline-none bg-transparent min-w-0 w-full truncate"
            />
          </div>
          {/* Scrolls horizontally rather than overflowing the page if it doesn't
              all fit at very narrow widths — nothing is ever clipped or hidden. */}
          <div className="flex items-center gap-2 shrink-0 overflow-x-auto max-w-[62vw] sm:max-w-none scrollbar-none">
            <span className={`text-sm hidden lg:inline shrink-0 ${statusClass}`}>{statusText}</span>
            {error && <span className="text-sm text-red-500 hidden lg:inline shrink-0">{error}</span>}
            <TemplateSelector selected={template} onSelect={onSelectTemplate} />
            <button
              onClick={handleDownloadPdf}
              disabled={exporting}
              className="shrink-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 whitespace-nowrap"
            >
              {exporting ? "Exporting..." : <><span className="hidden sm:inline">Download </span>PDF</>}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="shrink-0 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 whitespace-nowrap"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
        {/* Save status surfaces below the toolbar on narrower screens where it's hidden above. */}
        <div className="lg:hidden px-4 sm:px-6 pb-2 -mt-1">
          <span className={`text-xs ${statusClass}`}>{statusText}</span>
          {error && <span className="text-xs text-red-500 ml-3">{error}</span>}
        </div>
      </nav>

      {/* Mobile tab switcher */}
      <div className="sm:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex" role="tablist" aria-label="Builder view">
        <button
          role="tab"
          aria-selected={mobileTab === "form"}
          onClick={() => setMobileTab("form")}
          className={`flex-1 py-2.5 text-sm font-medium text-center border-b-2 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            mobileTab === "form" ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-gray-500 dark:text-gray-400"
          }`}
        >
          Edit
        </button>
        <button
          role="tab"
          aria-selected={mobileTab === "preview"}
          onClick={() => setMobileTab("preview")}
          className={`flex-1 py-2.5 text-sm font-medium text-center border-b-2 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            mobileTab === "preview" ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-gray-500 dark:text-gray-400"
          }`}
        >
          Preview
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Form panel */}
        <div className={`${mobileTab === "form" ? "flex" : "hidden"} sm:flex flex-col w-full sm:w-1/2 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6`}>
          <PersonalInfoSection resume={resume} onChange={onPersonalChange} />
          <SummarySection summary={resume.summary} onChange={onSummaryChange} />
          <SkillsSection skills={resume.skills} onAdd={onSkillAdd} onRemove={onSkillRemove} />
          <ExperienceSection
            experience={resume.experience}
            onUpdate={onExperienceUpdate}
            onAdd={onExperienceAdd}
            onRemove={onExperienceRemove}
          />
          <EducationSection
            education={resume.education}
            onUpdate={onEducationUpdate}
            onAdd={onEducationAdd}
            onRemove={onEducationRemove}
          />
          <ProjectsSection
            projects={resume.projects}
            onUpdate={onProjectUpdate}
            onAdd={onProjectAdd}
            onRemove={onProjectRemove}
          />
          <CertificationsSection
            certifications={resume.certifications}
            onUpdate={onCertificationUpdate}
            onAdd={onCertificationAdd}
            onRemove={onCertificationRemove}
          />
          <LanguagesSection
            languages={resume.languages}
            onUpdate={onLanguageUpdate}
            onAdd={onLanguageAdd}
            onRemove={onLanguageRemove}
          />

          <div className="h-20" />

          <AtsAnalysisPanel resumeId={resume.id} />

          <AiAssistant
            resume={resume}
            onApplySummary={applyAiSummary}
            onApplyExperience={applyAiExperience}
            onApplyProject={applyAiProject}
          />
        </div>

        {/* Preview panel — the paper itself always renders light, like a printed page */}
        <div className={`${mobileTab === "preview" ? "flex" : "hidden"} sm:flex w-full sm:w-1/2 bg-gray-200 dark:bg-gray-900 overflow-y-auto p-4 sm:p-6`}>
          <div className="bg-white shadow-lg rounded-lg max-w-[595px] mx-auto min-h-[842px] sm:p-10 p-4 text-sm w-full text-black">
            <TemplateComponent resume={resume} />
          </div>
        </div>
      </div>
    </div>
  );
}
