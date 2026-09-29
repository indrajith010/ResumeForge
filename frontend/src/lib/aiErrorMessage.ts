/**
 * Maps a raw error (typically thrown from the AI API calls) to a friendly,
 * actionable message for display. The backend's LM Studio failure messages
 * always mention "unavailable"; this refines that into more specific guidance
 * so users know what to try next instead of seeing a raw error string.
 */
export function aiErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : "AI request failed";

  if (msg.includes("timed out")) {
    return "Local AI request timed out. The model may be slow or overloaded — try again or use a shorter input.";
  }
  if (msg.includes("could not connect") || msg.includes("503")) {
    return "Local AI is unavailable. Start LM Studio and load a compatible model to use AI assistance.";
  }
  if (msg.includes("unexpected response format")) {
    return "Local AI returned an unexpected response. Try again, or check that the loaded model supports chat completions.";
  }
  if (msg.includes("no model is loaded") || msg.includes("does not match")) {
    return "No model is loaded in LM Studio, or the configured model name doesn't match. Load a model in LM Studio and make sure LM_STUDIO_MODEL matches its exact model id.";
  }
  if (msg.includes("returned HTTP") || msg.includes("unavailable")) {
    return "Local AI is unavailable. Start LM Studio and load a compatible model to use AI assistance.";
  }
  return msg;
}
