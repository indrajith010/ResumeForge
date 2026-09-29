import type { NavigateFunction } from "react-router-dom";
import type { User } from "firebase/auth";
import { api } from "./api";
import { defaultResumeInput } from "../types/resume";
import type { TemplateId } from "../types/template";

/**
 * "Use this template" flow shared by the Home and Templates pages: remembers
 * the chosen template (read by the builder on load), then either creates a
 * new resume and jumps straight into the builder for a signed-in user, or
 * sends a signed-out visitor to sign in first.
 */
export async function createResumeFromTemplate(
  templateId: TemplateId,
  user: User | null,
  navigate: NavigateFunction,
): Promise<void> {
  try {
    localStorage.setItem("rf_template", templateId);
  } catch {
    // localStorage unavailable — the builder will just fall back to the default template.
  }

  if (!user) {
    navigate("/login");
    return;
  }

  const resume = await api.createResume(defaultResumeInput);
  navigate(`/builder/${resume.id}`);
}
