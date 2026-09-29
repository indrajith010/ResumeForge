import asyncio
import os
import sys
from unittest.mock import AsyncMock, MagicMock, patch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


def _mock_lm_response(content: str):
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json.return_value = {
        "choices": [{"message": {"content": content}}]
    }
    return mock_resp


def _run(coro):
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


# --- Config tests ---

def test_config_defaults():
    from app.core.config import LM_STUDIO_BASE_URL, LM_STUDIO_MODEL, LM_STUDIO_TIMEOUT
    assert LM_STUDIO_BASE_URL == "http://localhost:1234/v1"
    assert isinstance(LM_STUDIO_MODEL, str)
    assert isinstance(LM_STUDIO_TIMEOUT, int)


# --- lm_chat tests ---

@patch("app.services.ai_service.httpx.AsyncClient")
def test_lm_chat_success(mock_client_cls):
    from app.services.ai_service import lm_chat

    mock_resp = _mock_lm_response("Hello from LM Studio")
    mock_client = AsyncMock()
    mock_client.post = AsyncMock(return_value=mock_resp)
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=False)
    mock_client_cls.return_value = mock_client

    result = _run(lm_chat([{"role": "user", "content": "test"}]))
    assert result == "Hello from LM Studio"
    mock_client.post.assert_called_once()


@patch("app.services.ai_service.httpx.AsyncClient")
def test_lm_chat_timeout(mock_client_cls):
    import httpx

    from app.services.ai_service import lm_chat

    mock_client = AsyncMock()
    mock_client.post = AsyncMock(side_effect=httpx.TimeoutException("timeout"))
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=False)
    mock_client_cls.return_value = mock_client

    try:
        _run(lm_chat([{"role": "user", "content": "test"}]))
        assert False, "Should have raised"
    except httpx.TimeoutException:
        pass


@patch("app.services.ai_service.httpx.AsyncClient")
def test_lm_chat_connection_error(mock_client_cls):
    import httpx

    from app.services.ai_service import lm_chat

    mock_client = AsyncMock()
    mock_client.post = AsyncMock(side_effect=httpx.ConnectError("refused"))
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=False)
    mock_client_cls.return_value = mock_client

    try:
        _run(lm_chat([{"role": "user", "content": "test"}]))
        assert False, "Should have raised"
    except httpx.ConnectError:
        pass


# --- improve_summary tests ---

@patch("app.services.ai_service.lm_chat", new_callable=AsyncMock)
def test_improve_summary(mock_chat):
    from app.services.ai_service import improve_summary
    mock_chat.return_value = "Experienced engineer with expertise in Python and React."

    result = _run(improve_summary("I am a programmer", ""))
    assert "suggestion" in result
    assert "reason" in result
    assert len(result["suggestion"]) > 0
    mock_chat.assert_called_once()


@patch("app.services.ai_service.lm_chat", new_callable=AsyncMock)
def test_improve_summary_with_jd(mock_chat):
    from app.services.ai_service import improve_summary
    mock_chat.return_value = "Senior Python developer with 5+ years experience."

    result = _run(improve_summary("I code in Python", "Looking for a senior Python developer"))
    assert "suggestion" in result
    call_args = mock_chat.call_args
    assert "Python" in call_args[0][0][1]["content"]


@patch("app.services.ai_service.lm_chat", new_callable=AsyncMock)
def test_improve_summary_empty(mock_chat):
    from app.services.ai_service import improve_summary
    mock_chat.return_value = "Professional with relevant technical background."

    result = _run(improve_summary("", ""))
    assert "suggestion" in result


# --- improve_experience tests ---

@patch("app.services.ai_service.lm_chat", new_callable=AsyncMock)
def test_improve_experience(mock_chat):
    from app.services.ai_service import improve_experience
    mock_chat.return_value = "Developed scalable applications using Python and React."

    result = _run(improve_experience("Engineer", "Acme", "I wrote code"))
    assert "suggestion" in result
    assert "reason" in result


@patch("app.services.ai_service.lm_chat", new_callable=AsyncMock)
def test_improve_experience_with_jd(mock_chat):
    from app.services.ai_service import improve_experience
    mock_chat.return_value = "Built microservices with Python and Docker."

    result = _run(improve_experience(
        "Backend Dev", "TechCo", "Built services",
        "Need Docker and Python experience"
    ))
    assert "suggestion" in result
    call_content = mock_chat.call_args[0][0][1]["content"]
    assert "Docker" in call_content or "docker" in call_content


# --- improve_project tests ---

@patch("app.services.ai_service.lm_chat", new_callable=AsyncMock)
def test_improve_project(mock_chat):
    from app.services.ai_service import improve_project
    mock_chat.return_value = "Built a CLI tool that automates deployments using Python and Docker."

    result = _run(improve_project("DeployTool", "Automates deployments", "Python, Docker"))
    assert "suggestion" in result
    assert "reason" in result


# --- tailor_resume tests ---

@patch("app.services.ai_service.lm_chat", new_callable=AsyncMock)
def test_tailor_resume_json_response(mock_chat):
    from app.services.ai_service import tailor_resume
    mock_chat.return_value = '{"summary_suggestion": "Improved summary", "keyword_suggestions": ["Python", "Docker"], "experience_suggestions": ["Use action verbs"], "project_suggestions": ["Add metrics"], "overall_notes": ["Good foundation"]}'

    result = _run(tailor_resume("Resume content", "Job description"))
    assert result["summary_suggestion"] == "Improved summary"
    assert "Python" in result["keyword_suggestions"]
    assert "Docker" in result["keyword_suggestions"]
    assert len(result["experience_suggestions"]) > 0


@patch("app.services.ai_service.lm_chat", new_callable=AsyncMock)
def test_tailor_resume_malformed_json(mock_chat):
    from app.services.ai_service import tailor_resume
    mock_chat.return_value = "This is not valid JSON but here are some suggestions..."

    result = _run(tailor_resume("Resume", "JD"))
    assert "summary_suggestion" in result
    assert "keyword_suggestions" in result


# --- Fabrication prevention ---

@patch("app.services.ai_service.lm_chat", new_callable=AsyncMock)
def test_system_prompt_prevents_fabrication(mock_chat):
    from app.services.ai_service import improve_summary
    mock_chat.return_value = "Improved text"

    _run(improve_summary("Short summary", ""))
    call_args = mock_chat.call_args
    system_msg = call_args[0][0][0]["content"]
    assert "Never fabricate" in system_msg or "fabricate" in system_msg.lower()


@patch("app.services.ai_service.lm_chat", new_callable=AsyncMock)
def test_improve_experience_prompt_includes_facts(mock_chat):
    from app.services.ai_service import improve_experience
    mock_chat.return_value = "Improved"

    _run(improve_experience("Engineer", "Acme", "Built API"))
    call_content = mock_chat.call_args[0][0][1]["content"]
    assert "Acme" in call_content
    assert "Engineer" in call_content
    assert "Built API" in call_content


# --- Pydantic model tests ---

def test_improve_summary_request_model():
    from app.models.ai import ImproveSummaryRequest
    r = ImproveSummaryRequest(current_summary="test", job_description="jd")
    assert r.current_summary == "test"
    assert r.job_description == "jd"


def test_improve_experience_request_model():
    from app.models.ai import ImproveExperienceRequest
    r = ImproveExperienceRequest(position="Eng", company="Acme", description="desc")
    assert r.position == "Eng"


def test_improve_project_request_model():
    from app.models.ai import ImproveProjectRequest
    r = ImproveProjectRequest(name="Proj", description="desc", technologies="Python")
    assert r.name == "Proj"


def test_tailor_resume_request_model():
    from app.models.ai import TailorResumeRequest
    r = TailorResumeRequest(resume_text="resume", job_description="jd")
    assert r.resume_text == "resume"


def test_ai_suggestion_response_model():
    from app.models.ai import AiSuggestionResponse
    r = AiSuggestionResponse(suggestion="text", reason="because")
    assert r.suggestion == "text"


def test_tailor_resume_response_model():
    from app.models.ai import TailorResumeResponse
    r = TailorResumeResponse(
        summary_suggestion="s", keyword_suggestions=["k"],
        experience_suggestions=["e"], project_suggestions=["p"],
        overall_notes=["n"]
    )
    assert len(r.keyword_suggestions) == 1


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
