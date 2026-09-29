from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import get_current_user
from app.models.ai import (
    AiSuggestionResponse,
    ImproveExperienceRequest,
    ImproveProjectRequest,
    ImproveSummaryRequest,
    TailorResumeRequest,
    TailorResumeResponse,
)
from app.services.ai_service import (
    improve_experience,
    improve_project,
    improve_summary,
    tailor_resume,
)

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/improve-summary", response_model=AiSuggestionResponse)
async def api_improve_summary(
    data: ImproveSummaryRequest,
    current_user: dict = Depends(get_current_user),
):
    try:
        result = await improve_summary(data.current_summary, data.job_description)
        return AiSuggestionResponse(**result)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e


@router.post("/improve-experience", response_model=AiSuggestionResponse)
async def api_improve_experience(
    data: ImproveExperienceRequest,
    current_user: dict = Depends(get_current_user),
):
    try:
        result = await improve_experience(
            data.position, data.company, data.description, data.job_description
        )
        return AiSuggestionResponse(**result)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e


@router.post("/improve-project", response_model=AiSuggestionResponse)
async def api_improve_project(
    data: ImproveProjectRequest,
    current_user: dict = Depends(get_current_user),
):
    try:
        result = await improve_project(
            data.name, data.description, data.technologies, data.job_description
        )
        return AiSuggestionResponse(**result)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e


@router.post("/tailor-resume", response_model=TailorResumeResponse)
async def api_tailor_resume(
    data: TailorResumeRequest,
    current_user: dict = Depends(get_current_user),
):
    try:
        result = await tailor_resume(data.resume_text, data.job_description)
        return TailorResumeResponse(**result)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
