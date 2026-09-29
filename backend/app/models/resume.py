from pydantic import BaseModel


class Education(BaseModel):
    school: str = ""
    degree: str = ""
    field: str = ""
    start_date: str = ""
    end_date: str = ""
    description: str = ""


class Experience(BaseModel):
    company: str = ""
    position: str = ""
    start_date: str = ""
    end_date: str = ""
    description: str = ""


class Project(BaseModel):
    name: str = ""
    description: str = ""
    url: str = ""


class Certification(BaseModel):
    name: str = ""
    issuer: str = ""
    date: str = ""


class Language(BaseModel):
    name: str = ""
    proficiency: str = ""


class ResumeBase(BaseModel):
    title: str = "Untitled Resume"
    full_name: str = ""
    job_title: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    website: str = ""
    linkedin: str = ""
    summary: str = ""
    skills: list[str] = []
    education: list[Education] = []
    experience: list[Experience] = []
    projects: list[Project] = []
    certifications: list[Certification] = []
    languages: list[Language] = []


class ResumeCreate(ResumeBase):
    pass


class ResumeUpdate(ResumeBase):
    title: str | None = None


class ResumeOut(ResumeBase):
    id: int
    user_id: str
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}
