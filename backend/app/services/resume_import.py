"""Best-effort, local, non-AI extraction of resume content from an uploaded
PDF or DOCX file into ResumeForge's resume structure.

This is a heuristic text parser, not a machine-learning model: it looks for
common resume section headings and formatting patterns (dates, bullet lists,
"Position at Company" style lines) to structure the raw text. It is
deliberately conservative — when it can't confidently split a line into
separate fields, it keeps the original text intact (usually in a
`description`) rather than guessing and risking mangled data. The frontend
always shows the result in the builder for the user to review and correct
before saving.
"""

import re
from dataclasses import dataclass, field
from io import BytesIO

from docx import Document
from pypdf import PdfReader

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
SUPPORTED_EXTENSIONS = {".pdf", ".docx"}

_EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
_PHONE_RE = re.compile(r"(\+?\d[\d\s().-]{7,}\d)")
_LINKEDIN_RE = re.compile(r"(?:https?://)?(?:www\.)?linkedin\.com/\S+", re.IGNORECASE)
_URL_RE = re.compile(r"(?:https?://)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:/[^\s,;]*)?")
_YEAR_RE = r"(?:19|20)\d{2}"
_MONTH_RE = r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?"
_DATE_TOKEN_RE = rf"(?:{_YEAR_RE}(?:[/-]\d{{1,2}})?|{_MONTH_RE}\s+{_YEAR_RE})"
_DATE_RANGE_RE = re.compile(
    rf"({_DATE_TOKEN_RE})\s*(?:-|–|—|to)\s*({_DATE_TOKEN_RE}|[Pp]resent|[Cc]urrent)",
)

_SECTION_HEADINGS = {
    "summary": ["summary", "professional summary", "objective", "profile", "about me"],
    "skills": ["skills", "technical skills", "core competencies", "key skills"],
    "experience": [
        "experience", "work experience", "professional experience",
        "employment history", "work history",
    ],
    "education": ["education", "academic background", "academic history"],
    "projects": ["projects", "personal projects", "key projects"],
    "certifications": ["certifications", "certificates", "licenses", "licenses and certifications"],
    "languages": ["languages"],
}


class ResumeImportError(Exception):
    """Raised for user-facing extraction failures (unsupported file, empty, corrupt)."""


@dataclass
class ParsedResume:
    full_name: str = ""
    job_title: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    website: str = ""
    linkedin: str = ""
    summary: str = ""
    skills: list[str] = field(default_factory=list)
    education: list[dict] = field(default_factory=list)
    experience: list[dict] = field(default_factory=list)
    projects: list[dict] = field(default_factory=list)
    certifications: list[dict] = field(default_factory=list)
    languages: list[dict] = field(default_factory=list)


def extract_text(filename: str, content: bytes) -> str:
    ext = _extension(filename)
    if ext == ".pdf":
        return _extract_pdf_text(content)
    if ext == ".docx":
        return _extract_docx_text(content)
    raise ResumeImportError(f"Unsupported file type '{ext}'. Please upload a PDF or DOCX file.")


def _extension(filename: str) -> str:
    idx = filename.rfind(".")
    return filename[idx:].lower() if idx != -1 else ""


def _extract_pdf_text(content: bytes) -> str:
    try:
        reader = PdfReader(BytesIO(content))
    except Exception as e:
        raise ResumeImportError("Could not read this PDF file. It may be corrupted or password-protected.") from e

    pages_text = []
    for page in reader.pages:
        try:
            pages_text.append(page.extract_text() or "")
        except Exception:
            continue
    return "\n".join(pages_text)


def _extract_docx_text(content: bytes) -> str:
    try:
        document = Document(BytesIO(content))
    except Exception as e:
        raise ResumeImportError("Could not read this DOCX file. It may be corrupted or an unsupported format.") from e

    lines = [p.text for p in document.paragraphs]
    for table in document.tables:
        for row in table.rows:
            lines.append(" | ".join(cell.text for cell in row.cells))
    return "\n".join(lines)


def parse_resume_text(text: str) -> ParsedResume:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    lines = [line.strip() for line in text.split("\n")]

    if not any(lines):
        raise ResumeImportError(
            "No readable text was found in this file. Scanned/image-only PDFs aren't supported — "
            "try a text-based export of your resume."
        )

    sections, header_lines = _split_sections(lines)

    parsed = ParsedResume()
    header_text = "\n".join(header_lines)
    parsed.email = _first_match(_EMAIL_RE, header_text)
    parsed.phone = _first_match(_PHONE_RE, header_text)
    parsed.linkedin = _first_match(_LINKEDIN_RE, header_text)
    parsed.website = _first_website(header_text, exclude=parsed.linkedin)
    parsed.full_name, parsed.job_title = _extract_name_and_title(header_lines)

    if "summary" in sections:
        parsed.summary = "\n".join(sections["summary"]).strip()
    elif not any(sections.values()):
        # No recognizable section headings at all — fall back to using the
        # whole document as the summary so nothing is lost. (header_lines is
        # only a heuristic guess at the contact block here, not a confirmed
        # structural split, so it's not excluded.)
        parsed.summary = "\n".join(line for line in lines if line).strip()[:2000]

    if "skills" in sections:
        parsed.skills = _parse_skills(sections["skills"])

    if "experience" in sections:
        parsed.experience = _parse_entries(sections["experience"], kind="experience")

    if "education" in sections:
        parsed.education = _parse_entries(sections["education"], kind="education")

    if "projects" in sections:
        parsed.projects = _parse_entries(sections["projects"], kind="projects")

    if "certifications" in sections:
        parsed.certifications = _parse_entries(sections["certifications"], kind="certifications")

    if "languages" in sections:
        parsed.languages = _parse_languages(sections["languages"])

    return parsed


def _split_sections(lines: list[str]) -> tuple[dict[str, list[str]], list[str]]:
    heading_lookup: dict[str, str] = {}
    for section, headings in _SECTION_HEADINGS.items():
        for heading in headings:
            heading_lookup[heading] = section

    boundaries: list[tuple[int, str]] = []
    for i, line in enumerate(lines):
        normalized = line.strip().lower().rstrip(":").strip()
        if normalized and len(normalized) <= 40 and normalized in heading_lookup:
            boundaries.append((i, heading_lookup[normalized]))

    if boundaries:
        header_lines = lines[: boundaries[0][0]]
    else:
        # No recognizable headings anywhere: only treat a small leading window
        # as the "header" (name/title/contact block) so the rest of the
        # document is still available to the summary fallback below, instead
        # of the whole file being swallowed as "header".
        header_lines = lines[:6]
    sections: dict[str, list[str]] = {}
    for idx, (start, section) in enumerate(boundaries):
        end = boundaries[idx + 1][0] if idx + 1 < len(boundaries) else len(lines)
        content = [line for line in lines[start + 1 : end]]
        sections.setdefault(section, [])
        sections[section].extend(content)

    return sections, header_lines


def _first_match(pattern: re.Pattern, text: str) -> str:
    m = pattern.search(text)
    return m.group(0).strip() if m else ""


def _first_website(text: str, exclude: str = "") -> str:
    for m in _URL_RE.finditer(text):
        candidate = m.group(0)
        if "@" in candidate:
            continue
        if exclude and candidate in exclude:
            continue
        if "linkedin.com" in candidate.lower():
            continue
        return candidate
    return ""


def _extract_name_and_title(header_lines: list[str]) -> tuple[str, str]:
    content_lines = [line for line in header_lines if line.strip()]
    if not content_lines:
        return "", ""

    name = content_lines[0].strip()
    # Guard against picking up a contact-info line as the name.
    if _EMAIL_RE.search(name) or _PHONE_RE.search(name) or len(name) > 60:
        name = ""

    title = ""
    if len(content_lines) > 1:
        candidate = content_lines[1].strip()
        if candidate and not _EMAIL_RE.search(candidate) and not _PHONE_RE.search(candidate) and len(candidate) <= 60:
            title = candidate

    return name, title


def _parse_skills(section_lines: list[str]) -> list[str]:
    joined = "\n".join(section_lines)
    parts = re.split(r"[,\n•|;·]+", joined)
    skills: list[str] = []
    seen = set()
    for part in parts:
        skill = part.strip(" \t-•")
        if not skill or len(skill) > 50:
            continue
        key = skill.lower()
        if key in seen:
            continue
        seen.add(key)
        skills.append(skill)
    return skills[:40]


def _parse_languages(section_lines: list[str]) -> list[dict]:
    joined = " ".join(section_lines)
    parts = [p.strip(" \t-•") for p in re.split(r"[,\n•|;]+", joined) if p.strip()]
    languages = []
    for part in parts:
        m = re.match(r"^(.+?)\s*\(([^)]+)\)$", part)
        if m:
            languages.append({"name": m.group(1).strip(), "proficiency": m.group(2).strip()})
        else:
            languages.append({"name": part, "proficiency": ""})
    return languages[:20]


def _split_paragraphs(section_lines: list[str]) -> list[list[str]]:
    paragraphs: list[list[str]] = []
    current: list[str] = []
    for line in section_lines:
        if not line.strip():
            if current:
                paragraphs.append(current)
                current = []
            continue
        current.append(line)
    if current:
        paragraphs.append(current)
    if not paragraphs and section_lines:
        paragraphs = [[line for line in section_lines if line.strip()]]
    return paragraphs


def _extract_date_range(text: str) -> tuple[str, str, str]:
    """Returns (start_date, end_date, text_with_dates_removed)."""
    m = _DATE_RANGE_RE.search(text)
    if not m:
        return "", "", text
    start, end = m.group(1), m.group(2)
    cleaned = (text[: m.start()] + text[m.end() :]).strip(" -–—,|\t")
    return start, end, cleaned


def _parse_entries(section_lines: list[str], kind: str) -> list[dict]:
    paragraphs = _split_paragraphs(section_lines)
    entries = []
    for para in paragraphs[:15]:
        if not para:
            continue
        header_line = para[0].strip(" \t-•")
        body_lines = [ln.strip(" \t-•") for ln in para[1:] if ln.strip()]
        start_date, end_date, header_clean = _extract_date_range(header_line)

        # Resumes often put the date range on its own line right after the
        # position/company (or school) line rather than on the same line.
        if not start_date and body_lines:
            s2, e2, cleaned2 = _extract_date_range(body_lines[0])
            if s2 and not cleaned2.strip():
                start_date, end_date = s2, e2
                body_lines = body_lines[1:]

        if kind == "experience":
            position, company = _split_title_line(header_clean, [" at ", " @ ", " - ", " – ", " | ", ", "])
            entries.append({
                "company": company,
                "position": position,
                "start_date": start_date,
                "end_date": end_date,
                "description": "\n".join(body_lines).strip(),
            })
        elif kind == "education":
            school, degree = _split_title_line(header_clean, [" - ", " – ", " | ", ", "])
            entries.append({
                "school": school,
                "degree": degree,
                "field": "",
                "start_date": start_date,
                "end_date": end_date,
                "description": "\n".join(body_lines).strip(),
            })
        elif kind == "projects":
            entries.append({
                "name": header_clean,
                "description": "\n".join(body_lines).strip(),
                "url": _first_website("\n".join(para)),
            })
        elif kind == "certifications":
            entries.append({
                "name": header_clean,
                "issuer": "\n".join(body_lines).strip()[:100],
                "date": end_date or start_date,
            })
    return entries


def _split_title_line(line: str, separators: list[str]) -> tuple[str, str]:
    """Best-effort split of a single header line into (primary, secondary).

    Falls back to (line, "") when no separator confidently applies, rather
    than guessing at a wrong split.
    """
    for sep in separators:
        if sep in line:
            first, _, rest = line.partition(sep)
            first, rest = first.strip(), rest.strip()
            if first and rest:
                return first, rest
    return line, ""
