import { useId, useRef, useState } from "react";
import { api } from "../lib/api";
import type { ResumeInput } from "../types/resume";

const ACCEPTED_EXTENSIONS = [".pdf", ".docx"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

interface Props {
  onImported: (resume: ResumeInput) => Promise<void>;
  className?: string;
}

type Status = "idle" | "uploading" | "error";

export function ResumeUploadButton({ onImported, className = "" }: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  function validate(file: File): string | null {
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      return "Unsupported file type. Please upload a PDF (.pdf) or Word document (.docx).";
    }
    if (file.size === 0) {
      return "That file is empty.";
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return "File is too large. Please upload a file under 10 MB.";
    }
    return null;
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file after an error
    if (!file) return;

    const validationError = validate(file);
    if (validationError) {
      setStatus("error");
      setError(validationError);
      return;
    }

    setStatus("uploading");
    setError("");
    try {
      const parsed = await api.importResume(file);
      await onImported(parsed);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to import resume");
    }
  }

  return (
    <div className={className}>
      <label htmlFor={inputId} className="sr-only">Upload an existing resume (PDF or DOCX)</label>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={status === "uploading"}
        className="w-full sm:w-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        {status === "uploading" ? "Extracting resume..." : "Upload Existing Resume"}
      </button>
      {status === "error" && (
        <div
          role="alert"
          className="mt-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 px-4 py-2.5 rounded-lg text-sm"
        >
          {error}
        </div>
      )}
    </div>
  );
}
