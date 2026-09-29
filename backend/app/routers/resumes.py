import json
from dataclasses import asdict
from datetime import UTC, datetime

import aiosqlite
from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from fastapi.responses import Response

from app.core.auth import get_current_user
from app.core.database import DATABASE_PATH
from app.models.ats import AtsRequest, AtsResponse
from app.models.resume import ResumeBase, ResumeCreate, ResumeOut, ResumeUpdate
from app.services.ats_analyzer import analyze_resume
from app.services.pdf_generator import TemplateType, generate_resume_pdf
from app.services.resume_import import (
    MAX_FILE_SIZE_BYTES,
    SUPPORTED_EXTENSIONS,
    ResumeImportError,
    extract_text,
    parse_resume_text,
)

router = APIRouter(prefix="/api/resumes", tags=["resumes"])

_JSON_FIELDS = ["skills", "education", "experience", "projects", "certifications", "languages"]


def _row_to_dict(row: aiosqlite.Row) -> dict:
    d = dict(row)
    for field in _JSON_FIELDS:
        if field in d and isinstance(d[field], str):
            d[field] = json.loads(d[field])
    return d


async def _get_resume_or_404(resume_id: int, user_id: str) -> dict:
    db = await aiosqlite.connect(DATABASE_PATH)
    db.row_factory = aiosqlite.Row
    try:
        cursor = await db.execute("SELECT * FROM resumes WHERE id = ?", (resume_id,))
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Resume not found")
        resume = _row_to_dict(row)
        if resume["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        return resume
    finally:
        await db.close()


@router.post("/import", response_model=ResumeBase)
async def import_resume(
    file: UploadFile,
    current_user: dict = Depends(get_current_user),
):
    """Extract resume content from an uploaded PDF/DOCX for review in the builder.

    This never touches the database — it only returns parsed field values.
    The frontend creates a brand-new resume from the result (via the normal
    create-resume flow) once the user has reviewed it, so no existing resume
    is ever overwritten by an import.
    """
    filename = file.filename or ""
    ext = filename[filename.rfind(".") :].lower() if "." in filename else ""
    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail="Unsupported file type. Please upload a PDF (.pdf) or Word document (.docx).",
        )

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="File is too large. Please upload a file under 10 MB.")

    try:
        text = extract_text(filename, content)
        parsed = parse_resume_text(text)
    except ResumeImportError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e

    data = asdict(parsed)
    data["title"] = "Imported Resume"
    return ResumeBase(**data)


@router.post("", response_model=ResumeOut, status_code=status.HTTP_201_CREATED)
async def create_resume(
    data: ResumeCreate,
    current_user: dict = Depends(get_current_user),
):
    now = datetime.now(UTC).isoformat()
    db = await aiosqlite.connect(DATABASE_PATH)
    try:
        cursor = await db.execute(
            """INSERT INTO resumes
               (user_id, title, full_name, job_title, email, phone, location,
                website, linkedin, summary, skills, education, experience,
                projects, certifications, languages, created_at, updated_at)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (
                current_user["uid"],
                data.title,
                data.full_name,
                data.job_title,
                data.email,
                data.phone,
                data.location,
                data.website,
                data.linkedin,
                data.summary,
                json.dumps(data.skills),
                json.dumps([e.model_dump() for e in data.education]),
                json.dumps([e.model_dump() for e in data.experience]),
                json.dumps([e.model_dump() for e in data.projects]),
                json.dumps([e.model_dump() for e in data.certifications]),
                json.dumps([e.model_dump() for e in data.languages]),
                now,
                now,
            ),
        )
        await db.commit()
        resume_id = cursor.lastrowid
    finally:
        await db.close()

    resume = await _get_resume_or_404(resume_id, current_user["uid"])
    return ResumeOut(**resume)


@router.get("", response_model=list[ResumeOut])
async def list_resumes(current_user: dict = Depends(get_current_user)):
    db = await aiosqlite.connect(DATABASE_PATH)
    db.row_factory = aiosqlite.Row
    try:
        cursor = await db.execute(
            "SELECT * FROM resumes WHERE user_id = ? ORDER BY updated_at DESC",
            (current_user["uid"],),
        )
        rows = await cursor.fetchall()
        return [ResumeOut(**_row_to_dict(row)) for row in rows]
    finally:
        await db.close()


@router.get("/{resume_id}", response_model=ResumeOut)
async def get_resume(
    resume_id: int,
    current_user: dict = Depends(get_current_user),
):
    resume = await _get_resume_or_404(resume_id, current_user["uid"])
    return ResumeOut(**resume)


@router.put("/{resume_id}", response_model=ResumeOut)
async def update_resume(
    resume_id: int,
    data: ResumeUpdate,
    current_user: dict = Depends(get_current_user),
):
    existing = await _get_resume_or_404(resume_id, current_user["uid"])
    now = datetime.now(UTC).isoformat()
    title = data.title if data.title is not None else existing["title"]

    db = await aiosqlite.connect(DATABASE_PATH)
    try:
        await db.execute(
            """UPDATE resumes SET
               title=?, full_name=?, job_title=?, email=?, phone=?, location=?,
               website=?, linkedin=?, summary=?, skills=?, education=?,
               experience=?, projects=?, certifications=?, languages=?,
               updated_at=?
               WHERE id=?""",
            (
                title,
                data.full_name,
                data.job_title,
                data.email,
                data.phone,
                data.location,
                data.website,
                data.linkedin,
                data.summary,
                json.dumps(data.skills),
                json.dumps([e.model_dump() for e in data.education]),
                json.dumps([e.model_dump() for e in data.experience]),
                json.dumps([e.model_dump() for e in data.projects]),
                json.dumps([e.model_dump() for e in data.certifications]),
                json.dumps([e.model_dump() for e in data.languages]),
                now,
                resume_id,
            ),
        )
        await db.commit()
    finally:
        await db.close()

    resume = await _get_resume_or_404(resume_id, current_user["uid"])
    return ResumeOut(**resume)


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resume(
    resume_id: int,
    current_user: dict = Depends(get_current_user),
):
    await _get_resume_or_404(resume_id, current_user["uid"])
    db = await aiosqlite.connect(DATABASE_PATH)
    try:
        await db.execute("DELETE FROM resumes WHERE id = ?", (resume_id,))
        await db.commit()
    finally:
        await db.close()


@router.get("/{resume_id}/pdf")
async def export_resume_pdf(
    resume_id: int,
    template: TemplateType = "classic",
    current_user: dict = Depends(get_current_user),
):
    resume = await _get_resume_or_404(resume_id, current_user["uid"])
    pdf_bytes = generate_resume_pdf(resume, template=template)

    full_name = resume.get("full_name", "").strip()
    if full_name:
        safe_name = "".join(c if c.isalnum() or c in (" ", "-", "_") else "" for c in full_name)
        safe_name = "_".join(safe_name.split())
        filename = f"{safe_name}_Resume.pdf"
    else:
        filename = "Resume.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/{resume_id}/ats/analyze", response_model=AtsResponse)
async def analyze_resume_endpoint(
    resume_id: int,
    data: AtsRequest,
    current_user: dict = Depends(get_current_user),
):
    resume = await _get_resume_or_404(resume_id, current_user["uid"])
    return analyze_resume(resume, data.job_description)
