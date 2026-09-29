import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Reveal } from "../../components/Reveal";
import { TemplatePreviewCard } from "../../components/TemplatePreviewCard";
import { SAMPLE_RESUME } from "../../content/sampleResume";
import { TEMPLATES } from "../../types/template";
import { createResumeFromTemplate } from "../../lib/templateCta";

export function TemplatesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [creatingTemplate, setCreatingTemplate] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleUseTemplate(templateId: (typeof TEMPLATES)[number]["id"]) {
    setError("");
    setCreatingTemplate(templateId);
    try {
      await createResumeFromTemplate(templateId, user, navigate);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create a resume from this template");
    } finally {
      setCreatingTemplate(null);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Reveal className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Resume Templates</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Every template below shares the same ATS-safe, single-column structure — pick the one that fits
          your industry and personal style, then start filling it in right away.
        </p>
      </Reveal>

      {error && (
        <div className="max-w-lg mx-auto bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-8 text-sm text-center">
          {error}
        </div>
      )}

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

      <Reveal className="mt-16 text-center bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 rounded-2xl p-10">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Not sure which one to pick?</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          All three are equally ATS-friendly — the choice is purely stylistic, and you can switch between
          them at any time from inside the builder without losing any content.
        </p>
      </Reveal>
    </div>
  );
}
