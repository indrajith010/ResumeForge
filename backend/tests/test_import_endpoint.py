import os
import sys
from io import BytesIO

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from fastapi.testclient import TestClient

from app.core.auth import get_current_user
from main import app

client = TestClient(app)


def _fake_user():
    return {"uid": "test-uid", "email": "test@example.com", "display_name": "Test User", "user": None}


@pytest.fixture(autouse=True)
def override_auth():
    app.dependency_overrides[get_current_user] = _fake_user
    yield
    app.dependency_overrides.pop(get_current_user, None)


def _docx_bytes(paragraphs: list[str]) -> bytes:
    from docx import Document

    doc = Document()
    for p in paragraphs:
        doc.add_paragraph(p)
    buf = BytesIO()
    doc.save(buf)
    return buf.getvalue()


def test_import_requires_auth():
    app.dependency_overrides.pop(get_current_user, None)
    resp = client.post("/api/resumes/import", files={"file": ("r.docx", b"x", "application/octet-stream")})
    assert resp.status_code == 401


def test_import_rejects_unsupported_extension():
    resp = client.post("/api/resumes/import", files={"file": ("resume.txt", b"hello", "text/plain")})
    assert resp.status_code == 415


def test_import_rejects_empty_file():
    resp = client.post("/api/resumes/import", files={"file": ("resume.docx", b"", "application/octet-stream")})
    assert resp.status_code == 400


def test_import_rejects_corrupted_pdf():
    resp = client.post("/api/resumes/import", files={"file": ("resume.pdf", b"not a real pdf", "application/pdf")})
    assert resp.status_code == 422


def test_import_docx_success_returns_parsed_fields():
    content = _docx_bytes([
        "Jordan Lee",
        "Senior Engineer",
        "jordan.lee@email.com",
        "",
        "Summary",
        "Experienced engineer.",
        "",
        "Skills",
        "Python, React",
    ])
    resp = client.post(
        "/api/resumes/import",
        files={"file": ("resume.docx", content, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["title"] == "Imported Resume"
    assert data["full_name"] == "Jordan Lee"
    assert data["email"] == "jordan.lee@email.com"
    assert "Python" in data["skills"]
    # Never includes id/user_id — this is unsaved data for the frontend to review.
    assert "id" not in data
    assert "user_id" not in data


def test_import_does_not_create_or_modify_any_resume():
    before = client.get("/api/resumes")
    assert before.status_code == 200
    before_count = len(before.json())

    content = _docx_bytes(["Someone", "someone@example.com"])
    resp = client.post("/api/resumes/import", files={"file": ("resume.docx", content, "application/octet-stream")})
    assert resp.status_code == 200

    after = client.get("/api/resumes")
    assert after.status_code == 200
    assert len(after.json()) == before_count
