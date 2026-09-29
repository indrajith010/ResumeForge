from pydantic import BaseModel


class AtsRequest(BaseModel):
    job_description: str = ""


class AtsResponse(BaseModel):
    score: int
    score_label: str
    has_job_description: bool
    job_match_percentage: int | None = None
    matched_keywords: list[str] = []
    missing_keywords: list[str] = []
    matched_skills: list[str] = []
    missing_skills: list[str] = []
    section_analysis: dict[str, dict] = {}
    strengths: list[str] = []
    improvements: list[str] = []
    warnings: list[str] = []
