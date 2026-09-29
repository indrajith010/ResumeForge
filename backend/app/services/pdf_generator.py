from io import BytesIO
from typing import Literal

from fpdf import FPDF

_MARGIN = 15
_PAGE_W = 210
_CONTENT_W = _PAGE_W - 2 * _MARGIN

TemplateType = Literal["classic", "modern", "minimal"]

# --- Color palettes per template ---
_COLORS = {
    "classic": {
        "accent": (0, 0, 0),
        "heading": (0, 0, 0),
        "text": (51, 51, 51),
        "muted": (102, 102, 102),
        "line": (180, 180, 180),
        "header_bg": None,
    },
    "modern": {
        "accent": (30, 64, 175),
        "heading": (30, 64, 175),
        "text": (51, 51, 51),
        "muted": (107, 114, 128),
        "line": (30, 64, 175),
        "header_bg": (239, 246, 255),
    },
    "minimal": {
        "accent": (87, 87, 87),
        "heading": (31, 41, 55),
        "text": (55, 65, 81),
        "muted": (107, 114, 128),
        "line": (209, 213, 219),
        "header_bg": None,
    },
}


class ResumePDF(FPDF):
    def __init__(self, template: TemplateType = "classic"):
        super().__init__(format="A4")
        self.template = template
        self.colors = _COLORS[template]
        self.set_auto_page_break(auto=True, margin=_MARGIN)
        self.set_margins(_MARGIN, _MARGIN, _MARGIN)
        self.set_x(_MARGIN)
        self.set_y(_MARGIN)

    def _check_space(self, needed: float):
        if self.get_y() + needed > self.h - _MARGIN:
            self.add_page()

    # ── Header ──────────────────────────────────────────────────────────

    def header_block(self, name: str, job_title: str, contact_parts: list[str]):
        if self.template == "modern":
            self._header_modern(name, job_title, contact_parts)
        elif self.template == "minimal":
            self._header_minimal(name, job_title, contact_parts)
        else:
            self._header_classic(name, job_title, contact_parts)

    def _header_classic(self, name: str, job_title: str, contact_parts: list[str]):
        if name:
            self.set_font("Helvetica", "B", 20)
            self.cell(0, 9, name, new_x="LMARGIN", new_y="NEXT")
        if job_title:
            self.set_font("Helvetica", "", 11)
            self.set_text_color(*self.colors["muted"])
            self.cell(0, 6, job_title, new_x="LMARGIN", new_y="NEXT")
            self.set_text_color(*self.colors["text"])
        if contact_parts:
            self.set_font("Helvetica", "", 9)
            self.set_text_color(*self.colors["muted"])
            self.cell(0, 5, " | ".join(contact_parts), new_x="LMARGIN", new_y="NEXT")
            self.set_text_color(*self.colors["text"])
        self.ln(3)
        self._draw_line()

    def _header_modern(self, name: str, job_title: str, contact_parts: list[str]):
        bg = self.colors["header_bg"]
        self.set_fill_color(*bg)
        self.rect(0, 0, _PAGE_W, 42, "F")

        self.set_y(10)
        if name:
            self.set_font("Helvetica", "B", 22)
            self.set_text_color(*self.colors["heading"])
            self.cell(0, 9, name, new_x="LMARGIN", new_y="NEXT")
        if job_title:
            self.set_font("Helvetica", "", 11)
            self.set_text_color(*self.colors["accent"])
            self.cell(0, 6, job_title, new_x="LMARGIN", new_y="NEXT")
        if contact_parts:
            self.set_font("Helvetica", "", 8.5)
            self.set_text_color(*self.colors["muted"])
            self.cell(0, 5, "  |  ".join(contact_parts), new_x="LMARGIN", new_y="NEXT")
        self.set_text_color(*self.colors["text"])
        self.set_y(46)

    def _header_minimal(self, name: str, job_title: str, contact_parts: list[str]):
        if name:
            self.set_font("Helvetica", "B", 16)
            self.set_text_color(*self.colors["heading"])
            self.cell(0, 8, name, new_x="LMARGIN", new_y="NEXT")
        parts = []
        if job_title:
            parts.append(job_title)
        if contact_parts:
            parts.extend(contact_parts)
        if parts:
            self.set_font("Helvetica", "", 9)
            self.set_text_color(*self.colors["muted"])
            self.cell(0, 5, "  ·  ".join(parts), new_x="LMARGIN", new_y="NEXT")
        self.set_text_color(*self.colors["text"])
        self.ln(2)
        self._draw_line()

    # ── Section heading ────────────────────────────────────────────────

    def section_heading(self, title: str):
        self._check_space(14)
        self.ln(4)

        if self.template == "modern":
            self.set_font("Helvetica", "B", 11)
            self.set_text_color(*self.colors["heading"])
            self.cell(0, 6, title.upper(), new_x="LMARGIN", new_y="NEXT")
            self.set_draw_color(*self.colors["line"])
            y = self.get_y()
            self.line(_MARGIN, y, _MARGIN + 40, y)
            self.ln(3)
        elif self.template == "minimal":
            self.set_font("Helvetica", "B", 10)
            self.set_text_color(*self.colors["heading"])
            self.cell(0, 6, title.upper(), new_x="LMARGIN", new_y="NEXT")
            self.ln(1)
        else:
            self.set_font("Helvetica", "B", 11)
            self.set_text_color(*self.colors["heading"])
            self.cell(0, 6, title.upper(), new_x="LMARGIN", new_y="NEXT")
            self._draw_line()

        self.set_text_color(*self.colors["text"])

    def _draw_line(self):
        self.set_draw_color(*self.colors["line"])
        self.line(_MARGIN, self.get_y(), _PAGE_W - _MARGIN, self.get_y())
        self.ln(2)

    # ── Body text ──────────────────────────────────────────────────────

    def body_text(self, text: str, size: int = 10):
        if not text:
            return
        self.set_font("Helvetica", "", size)
        self.set_text_color(*self.colors["text"])
        self.multi_cell(0, 5, text)
        self.set_text_color(*self.colors["text"])
        self.ln(1)

    # ── Bullet list ────────────────────────────────────────────────────

    def bullet_list(self, items: list[str], size: int = 10):
        self.set_font("Helvetica", "", size)
        self.set_text_color(*self.colors["text"])
        for item in items:
            self._check_space(6)
            x0 = _MARGIN
            self.set_x(x0)
            if self.template == "minimal":
                self.cell(5, 5, "- ")
            else:
                self.cell(5, 5, "- ")
            self.multi_cell(_CONTENT_W - 5, 5, item)
            self.set_x(x0)

    # ── Entry header ───────────────────────────────────────────────────

    def entry_header(self, left: str, right: str, subtitle: str = ""):
        self._check_space(12)

        if self.template == "modern":
            self.set_font("Helvetica", "B", 10)
            self.set_text_color(*self.colors["heading"])
            self.cell(0, 5, left, new_x="LMARGIN", new_y="NEXT")
            if subtitle:
                self.set_font("Helvetica", "I", 9)
                self.set_text_color(*self.colors["muted"])
                self.cell(0, 5, subtitle, new_x="LMARGIN", new_y="NEXT")
            if right:
                self.set_font("Helvetica", "", 9)
                self.set_text_color(*self.colors["accent"])
                self.cell(0, 5, right, new_x="LMARGIN", new_y="NEXT")
            self.set_text_color(*self.colors["text"])
            self.ln(1)
        elif self.template == "minimal":
            self.set_font("Helvetica", "B", 10)
            self.set_text_color(*self.colors["heading"])
            self.cell(0, 5, left, new_x="LMARGIN", new_y="NEXT")
            sub_parts = []
            if subtitle:
                sub_parts.append(subtitle)
            if right:
                sub_parts.append(right)
            if sub_parts:
                self.set_font("Helvetica", "", 9)
                self.set_text_color(*self.colors["muted"])
                self.cell(0, 5, "  |  ".join(sub_parts), new_x="LMARGIN", new_y="NEXT")
            self.set_text_color(*self.colors["text"])
            self.ln(1)
        else:
            self.set_font("Helvetica", "B", 10)
            self.set_text_color(*self.colors["text"])
            self.cell(0, 5, left, new_x="LMARGIN", new_y="NEXT")
            if right:
                self.set_font("Helvetica", "", 9)
                self.set_text_color(*self.colors["muted"])
                y_before = self.get_y()
                self.set_y(y_before - 5)
                self.set_x(_MARGIN + _CONTENT_W - self.get_string_width(right))
                self.cell(0, 5, right, new_x="LMARGIN")
                self.set_xy(_MARGIN, y_before)
                self.set_text_color(*self.colors["text"])
            if subtitle:
                self.set_font("Helvetica", "I", 9)
                self.set_text_color(*self.colors["muted"])
                self.cell(0, 5, subtitle, new_x="LMARGIN", new_y="NEXT")
                self.set_text_color(*self.colors["text"])
            self.ln(1)


def generate_resume_pdf(resume: dict, template: TemplateType = "classic") -> bytes:
    pdf = ResumePDF(template=template)
    pdf.add_page()

    name = resume.get("full_name", "")
    job_title = resume.get("job_title", "")
    contact = [p for p in [
        resume.get("email"),
        resume.get("phone"),
        resume.get("location"),
        resume.get("website"),
        resume.get("linkedin"),
    ] if p]

    pdf.header_block(name, job_title, contact)

    summary = resume.get("summary", "")
    if summary:
        pdf.section_heading("Professional Summary")
        pdf.body_text(summary)

    skills = resume.get("skills") or []
    if skills:
        pdf.section_heading("Skills")
        if template == "modern":
            pdf.set_font("Helvetica", "", 9)
            pdf.set_text_color(*pdf.colors["text"])
            pdf.cell(0, 5, "  ·  ".join(skills), new_x="LMARGIN", new_y="NEXT")
            pdf.set_text_color(*pdf.colors["text"])
            pdf.ln(1)
        else:
            pdf.bullet_list(skills)

    experience = resume.get("experience") or []
    if experience:
        pdf.section_heading("Experience")
        for exp in experience:
            left = exp.get("position", "")
            right = _format_date_range(exp.get("start_date", ""), exp.get("end_date", ""))
            subtitle = exp.get("company", "")
            pdf.entry_header(left, right, subtitle)
            desc = exp.get("description", "")
            if desc:
                pdf.body_text(desc, size=9)
            pdf.ln(1)

    education = resume.get("education") or []
    if education:
        pdf.section_heading("Education")
        for edu in education:
            left = edu.get("school", "")
            right = _format_date_range(edu.get("start_date", ""), edu.get("end_date", ""))
            parts = [p for p in [edu.get("degree"), edu.get("field")] if p]
            subtitle = " in ".join(parts) if parts else ""
            pdf.entry_header(left, right, subtitle)
            pdf.ln(1)

    projects = resume.get("projects") or []
    if projects:
        pdf.section_heading("Projects")
        for proj in projects:
            left = proj.get("name", "")
            right = proj.get("url", "")
            pdf.entry_header(left, right)
            desc = proj.get("description", "")
            if desc:
                pdf.body_text(desc, size=9)
            pdf.ln(1)

    certifications = resume.get("certifications") or []
    if certifications:
        pdf.section_heading("Certifications")
        for cert in certifications:
            left = cert.get("name", "")
            right = cert.get("date", "")
            subtitle = cert.get("issuer", "")
            pdf.entry_header(left, right, subtitle)
            pdf.ln(1)

    languages = resume.get("languages") or []
    if languages:
        pdf.section_heading("Languages")
        if template == "modern":
            pdf.set_font("Helvetica", "", 9)
            pdf.set_text_color(*pdf.colors["text"])
            lang_strs = [
                f"{lang.get('name', '')} ({lang.get('proficiency', '')})"
                for lang in languages if lang.get("name")
            ]
            pdf.cell(0, 5, "  ·  ".join(lang_strs), new_x="LMARGIN", new_y="NEXT")
            pdf.set_text_color(*pdf.colors["text"])
            pdf.ln(1)
        else:
            parts = [
                f"{lang.get('name', '')} ({lang.get('proficiency', '')})"
                for lang in languages if lang.get("name")
            ]
            if parts:
                pdf.bullet_list(parts)

    buf = BytesIO()
    pdf.output(buf)
    return buf.getvalue()


def _format_date_range(start: str, end: str) -> str:
    if start and end:
        return f"{start} - {end}"
    if start:
        return f"{start} - Present"
    return end
