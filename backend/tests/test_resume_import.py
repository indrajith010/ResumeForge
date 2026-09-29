import os
import sys
from io import BytesIO

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.resume_import import (
    ResumeImportError,
    _extract_date_range,
    _parse_languages,
    _parse_skills,
    _split_sections,
    extract_text,
    parse_resume_text,
)

SAMPLE_RESUME_TEXT = """Jordan Lee
Senior Software Engineer
jordan.lee@email.com | (555) 012-3456
linkedin.com/in/jordanlee | jordanlee.dev

Summary
Experienced engineer focused on backend systems and developer tooling.

Skills
Python, FastAPI, PostgreSQL, Docker, React

Experience
Backend Engineer at Acme Corp
2021 - Present
Built internal APIs used by 40+ engineers.
Reduced deploy time by 60%.

Software Engineer - Globex Inc
2018 - 2021
Maintained legacy billing system.

Education
State University
2014 - 2018
Bachelor of Science, Computer Science

Certifications
AWS Certified Developer - Associate
2022

Languages
English (Native), Spanish (Conversational)
"""


# --- parse_resume_text: end-to-end heuristics ---

def test_parse_resume_text_extracts_contact_info():
    parsed = parse_resume_text(SAMPLE_RESUME_TEXT)
    assert parsed.full_name == "Jordan Lee"
    assert parsed.job_title == "Senior Software Engineer"
    assert parsed.email == "jordan.lee@email.com"
    assert "555" in parsed.phone
    assert "linkedin.com/in/jordanlee" in parsed.linkedin


def test_parse_resume_text_extracts_summary():
    parsed = parse_resume_text(SAMPLE_RESUME_TEXT)
    assert "backend systems" in parsed.summary


def test_parse_resume_text_extracts_skills():
    parsed = parse_resume_text(SAMPLE_RESUME_TEXT)
    assert "Python" in parsed.skills
    assert "Docker" in parsed.skills
    assert len(parsed.skills) == 5


def test_parse_resume_text_extracts_experience_entries():
    parsed = parse_resume_text(SAMPLE_RESUME_TEXT)
    assert len(parsed.experience) == 2
    first = parsed.experience[0]
    assert first["company"] == "Acme Corp"
    assert first["position"] == "Backend Engineer"
    assert first["start_date"] == "2021"
    assert first["end_date"].lower() == "present"
    assert "internal APIs" in first["description"]


def test_parse_resume_text_extracts_education():
    parsed = parse_resume_text(SAMPLE_RESUME_TEXT)
    assert len(parsed.education) == 1
    assert parsed.education[0]["school"] == "State University"
    assert parsed.education[0]["start_date"] == "2014"
    assert parsed.education[0]["end_date"] == "2018"


def test_parse_resume_text_extracts_certifications():
    parsed = parse_resume_text(SAMPLE_RESUME_TEXT)
    assert len(parsed.certifications) == 1
    assert "AWS Certified" in parsed.certifications[0]["name"]


def test_parse_resume_text_extracts_languages():
    parsed = parse_resume_text(SAMPLE_RESUME_TEXT)
    names = [lang["name"] for lang in parsed.languages]
    assert "English" in names
    assert "Spanish" in names
    proficiencies = {lang["name"]: lang["proficiency"] for lang in parsed.languages}
    assert proficiencies["English"] == "Native"


def test_parse_resume_text_empty_raises():
    try:
        parse_resume_text("   \n\n   ")
        assert False, "expected ResumeImportError"
    except ResumeImportError:
        pass


def test_parse_resume_text_no_sections_falls_back_to_summary():
    parsed = parse_resume_text("Just some plain unstructured resume text with no headings at all.")
    assert parsed.summary != ""


# --- smaller helper units ---

def test_split_sections_finds_headings():
    lines = ["Name", "Contact", "Summary", "Did stuff.", "Skills", "Python, Go"]
    sections, header = _split_sections(lines)
    assert header == ["Name", "Contact"]
    assert sections["summary"] == ["Did stuff."]
    assert sections["skills"] == ["Python, Go"]


def test_parse_skills_dedupes_and_splits():
    skills = _parse_skills(["Python, python, Go", "Docker | Kubernetes"])
    lowered = [s.lower() for s in skills]
    assert lowered.count("python") == 1
    assert "Go" in skills
    assert "Kubernetes" in skills


def test_parse_languages_with_and_without_proficiency():
    langs = _parse_languages(["English (Native), French"])
    by_name = {lang["name"]: lang["proficiency"] for lang in langs}
    assert by_name["English"] == "Native"
    assert by_name["French"] == ""


def test_extract_date_range_present():
    start, end, cleaned = _extract_date_range("Backend Engineer at Acme Corp 2021 - Present")
    assert start == "2021"
    assert end == "Present"
    assert "2021" not in cleaned


def test_extract_date_range_no_match_returns_original():
    start, end, cleaned = _extract_date_range("No dates here")
    assert start == "" and end == ""
    assert cleaned == "No dates here"


# --- file extraction round-trips (generated in-memory, no fixture files) ---

def test_extract_docx_text_roundtrip():
    from docx import Document

    doc = Document()
    doc.add_paragraph("Jordan Lee")
    doc.add_paragraph("jordan.lee@email.com")
    buf = BytesIO()
    doc.save(buf)

    text = extract_text("resume.docx", buf.getvalue())
    assert "Jordan Lee" in text
    assert "jordan.lee@email.com" in text


def test_extract_pdf_text_roundtrip():
    from fpdf import FPDF

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", size=12)
    pdf.cell(text="Jordan Lee - jordan.lee@email.com")
    pdf_bytes = bytes(pdf.output())

    text = extract_text("resume.pdf", pdf_bytes)
    assert "Jordan Lee" in text
    assert "jordan.lee@email.com" in text


def test_extract_text_unsupported_extension_raises():
    try:
        extract_text("resume.txt", b"hello")
        assert False, "expected ResumeImportError"
    except ResumeImportError:
        pass


def test_extract_pdf_text_corrupted_raises():
    try:
        extract_text("resume.pdf", b"not a real pdf")
        assert False, "expected ResumeImportError"
    except ResumeImportError:
        pass


if __name__ == "__main__":
    tests = [v for k, v in sorted(globals().items()) if k.startswith("test_")]
    passed = 0
    failed = 0
    for test in tests:
        try:
            test()
            print(f"  PASS: {test.__name__}")
            passed += 1
        except Exception as e:
            print(f"  FAIL: {test.__name__} - {e}")
            failed += 1
    print(f"\n{passed} passed, {failed} failed")
    if failed:
        sys.exit(1)
