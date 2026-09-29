from pydantic import BaseModel


class ImproveSummaryRequest(BaseModel):
    current_summary: str = ""
    job_description: str = ""


class ImproveExperienceRequest(BaseModel):
    position: str = ""
    company: str = ""
    description: str = ""
    job_description: str = ""


class ImproveProjectRequest(BaseModel):
    name: str = ""
    description: str = ""
    technologies: str = ""
    job_description: str = ""


class TailorResumeRequest(BaseModel):
    resume_text: str
    job_description: str


class AiSuggestionResponse(BaseModel):
    suggestion: str
    reason: str


class TailorResumeResponse(BaseModel):
    summary_suggestion: str = ""
    keyword_suggestions: list[str] = []
    experience_suggestions: list[str] = []
    project_suggestions: list[str] = []
    overall_notes: list[str] = []
