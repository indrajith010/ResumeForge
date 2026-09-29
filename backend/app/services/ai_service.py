import json
import re

import httpx

from app.core.config import LM_STUDIO_BASE_URL, LM_STUDIO_MODEL, LM_STUDIO_TIMEOUT

_SYSTEM_PROMPT = (
    "You are a professional resume-writing assistant for ResumeForge. "
    "You must use ONLY information supplied in the user's request. "
    "Never fabricate facts, metrics, employers, skills, technologies, certifications, or education. "
    "Never invent achievements or responsibilities. "
    "Preserve all factual information from the original content. "
    "Use concise, professional language. "
    "Optimize for ATS (Applicant Tracking System) readability. "
    "Avoid excessive buzzwords and cliches. "
    "Prefer strong action verbs. "
    "Keep content factual and specific to the provided information."
)


async def lm_chat(messages: list[dict], temperature: float = 0.3) -> str:
    payload = {
        "messages": messages,
        "temperature": temperature,
        "max_tokens": 1024,
    }
    if LM_STUDIO_MODEL:
        payload["model"] = LM_STUDIO_MODEL

    async with httpx.AsyncClient(timeout=LM_STUDIO_TIMEOUT) as client:
        resp = await client.post(f"{LM_STUDIO_BASE_URL}/chat/completions", json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"].strip()


def _parse_json_response(text: str) -> dict | None:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return None


def _lm_error(e: Exception) -> RuntimeError:
    """Map a raw LM Studio call failure to a clearer, user-facing message."""
    if isinstance(e, (httpx.ConnectError, httpx.ConnectTimeout)):
        return RuntimeError(
            "LM Studio unavailable: could not connect. Make sure LM Studio is running "
            "with a model loaded and reachable at the configured URL."
        )
    if isinstance(e, httpx.TimeoutException):
        return RuntimeError(
            "LM Studio unavailable: the request timed out. The model may be slow or "
            "overloaded — try again or use a shorter input."
        )
    if isinstance(e, httpx.HTTPStatusError):
        if e.response.status_code == 400:
            return RuntimeError(
                "LM Studio unavailable: no model is loaded, or LM_STUDIO_MODEL does not match "
                "a model available in LM Studio. Load a model in LM Studio (or update "
                "LM_STUDIO_MODEL to match its exact model id) and try again."
            )
        return RuntimeError(
            f"LM Studio unavailable: the server returned HTTP {e.response.status_code}."
        )
    if isinstance(e, (KeyError, IndexError, ValueError)):
        return RuntimeError(
            "LM Studio unavailable: received an unexpected response format from the model."
        )
    return RuntimeError(f"LM Studio unavailable: {e}")


async def improve_summary(current_summary: str, job_description: str = "") -> dict:
    jd_part = f"\n\nTarget job description:\n{job_description}" if job_description.strip() else ""
    user_msg = (
        f"Improve the following professional summary for a resume. "
        f"Make it concise, professional, and ATS-friendly. "
        f"Do not invent any experience, skills, or achievements not mentioned. "
        f"Preserve all factual information.{jd_part}\n\n"
        f"Current summary:\n{current_summary or '(empty)'}"
    )
    messages = [
        {"role": "system", "content": _SYSTEM_PROMPT},
        {"role": "user", "content": user_msg},
    ]
    try:
        raw = await lm_chat(messages)
        return {"suggestion": raw, "reason": "AI-improved professional summary optimized for ATS readability."}
    except Exception as e:
        raise _lm_error(e) from e


async def improve_experience(
    position: str, company: str, description: str, job_description: str = ""
) -> dict:
    jd_part = f"\n\nTarget job description:\n{job_description}" if job_description.strip() else ""
    user_msg = (
        f"Improve the following work experience description for a resume. "
        f"Use strong action verbs, keep bullets concise, and highlight impact where evidence exists. "
        f"Do NOT invent metrics, responsibilities, or technologies. "
        f"Preserve the original meaning and factual content.{jd_part}\n\n"
        f"Position: {position}\n"
        f"Company: {company}\n"
        f"Current description:\n{description}"
    )
    messages = [
        {"role": "system", "content": _SYSTEM_PROMPT},
        {"role": "user", "content": user_msg},
    ]
    try:
        raw = await lm_chat(messages)
        return {"suggestion": raw, "reason": "AI-improved experience description with stronger action verbs and clearer impact."}
    except Exception as e:
        raise _lm_error(e) from e


async def improve_project(
    name: str, description: str, technologies: str = "", job_description: str = ""
) -> dict:
    jd_part = f"\n\nTarget job description:\n{job_description}" if job_description.strip() else ""
    tech_part = f"\nTechnologies used: {technologies}" if technologies.strip() else ""
    user_msg = (
        f"Improve the following project description for a resume. "
        f"Make it professional, concise, and ATS-friendly. "
        f"Focus on impact and achievements where supported by the text. "
        f"Do NOT invent features, technologies, or metrics.{tech_part}{jd_part}\n\n"
        f"Project: {name}\n"
        f"Current description:\n{description}"
    )
    messages = [
        {"role": "system", "content": _SYSTEM_PROMPT},
        {"role": "user", "content": user_msg},
    ]
    try:
        raw = await lm_chat(messages)
        return {"suggestion": raw, "reason": "AI-improved project description optimized for professional presentation."}
    except Exception as e:
        raise _lm_error(e) from e


async def tailor_resume(resume_text: str, job_description: str) -> dict:
    user_msg = (
        "Analyze the following resume against the target job description. "
        "Provide specific, actionable improvement suggestions. "
        "Do NOT fabricate any information. Base suggestions ONLY on the provided content.\n\n"
        "Return a JSON object with these keys:\n"
        '- "summary_suggestion": improved summary text\n'
        '- "keyword_suggestions": list of keywords to add\n'
        '- "experience_suggestions": list of experience improvement suggestions\n'
        '- "project_suggestions": list of project improvement suggestions\n'
        '- "overall_notes": list of general improvement notes\n\n'
        f"Resume content:\n{resume_text}\n\n"
        f"Job description:\n{job_description}"
    )
    messages = [
        {"role": "system", "content": _SYSTEM_PROMPT + "\nReturn valid JSON only."},
        {"role": "user", "content": user_msg},
    ]
    try:
        raw = await lm_chat(messages, temperature=0.4)
        parsed = _parse_json_response(raw)
        if parsed is None:
            return {
                "summary_suggestion": raw,
                "keyword_suggestions": [],
                "experience_suggestions": [],
                "project_suggestions": [],
                "overall_notes": [
                    "The AI response could not be parsed into structured suggestions, "
                    "so the raw response is shown as the summary suggestion instead."
                ],
            }
        return {
            "summary_suggestion": parsed.get("summary_suggestion", raw),
            "keyword_suggestions": parsed.get("keyword_suggestions", []),
            "experience_suggestions": parsed.get("experience_suggestions", []),
            "project_suggestions": parsed.get("project_suggestions", []),
            "overall_notes": parsed.get("overall_notes", []),
        }
    except Exception as e:
        raise _lm_error(e) from e
