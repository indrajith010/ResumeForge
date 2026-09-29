import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import type { Resume, ResumeInput } from "../types/resume";
import { defaultResumeInput } from "../types/resume";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Logo } from "../components/Logo";
import { ThemeToggle } from "../components/ThemeToggle";
import { ResumeUploadButton } from "../components/ResumeUploadButton";

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Resume | null>(null);

  async function loadResumes() {
    try {
      setLoading(true);
      const data = await api.listResumes();
      setResumes(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load resumes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadResumes(); }, []);

  async function handleCreate() {
    try {
      setCreating(true);
      const resume = await api.createResume(defaultResumeInput);
      navigate(`/builder/${resume.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create resume");
    } finally {
      setCreating(false);
    }
  }

  async function handleImported(parsed: ResumeInput) {
    const resume = await api.createResume(parsed);
    navigate(`/builder/${resume.id}`);
  }

  function requestDelete(resume: Resume, e: React.MouseEvent) {
    e.stopPropagation();
    setDeleteTarget(resume);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);
    try {
      await api.deleteResume(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete resume");
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete resume?"
        message={`Delete "${deleteTarget?.title ?? "this resume"}"? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg">
            <Logo />
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user?.photoURL && <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />}
            <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:inline">{user?.displayName || user?.email}</span>
            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Resumes</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{resumes.length} resume{resumes.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <ResumeUploadButton onImported={handleImported} />
            <button
              onClick={handleCreate}
              disabled={creating}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {creating ? "Creating..." : "+ New Resume"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-400 dark:text-gray-500">Loading resumes...</div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-300 dark:text-gray-700 text-6xl mb-4">&#128196;</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No resumes yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first resume, or upload one you already have.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleCreate}
                disabled={creating}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {creating ? "Creating..." : "Create Resume"}
              </button>
              <ResumeUploadButton onImported={handleImported} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/builder/${resume.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/builder/${resume.id}`);
                  }
                }}
                aria-label={`Open resume "${resume.title}"`}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                    {resume.title}
                  </h3>
                  <button
                    onClick={(e) => requestDelete(resume, e)}
                    aria-label={`Delete resume "${resume.title}"`}
                    className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer shrink-0 ml-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
                    title="Delete"
                  >
                    &#128465;
                  </button>
                </div>
                {resume.full_name && <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{resume.full_name}</p>}
                {resume.job_title && <p className="text-sm text-gray-400 dark:text-gray-500 mb-3">{resume.job_title}</p>}
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <span>Updated {formatDate(resume.updated_at)}</span>
                  {resume.experience.length > 0 && (
                    <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded">{resume.experience.length} exp</span>
                  )}
                  {resume.skills.length > 0 && (
                    <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded">{resume.skills.length} skills</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
