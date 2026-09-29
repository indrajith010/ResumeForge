import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.ats_analyzer import analyze_resume


def _minimal_resume():
    return {
        "full_name": "",
        "job_title": "",
        "email": "",
        "phone": "",
        "location": "",
        "website": "",
        "linkedin": "",
        "summary": "",
        "skills": [],
        "experience": [],
        "education": [],
        "projects": [],
        "certifications": [],
        "languages": [],
    }


def _complete_resume():
    return {
        "full_name": "Jane Smith",
        "job_title": "Senior Software Engineer",
        "email": "jane@example.com",
        "phone": "+1-555-1234",
        "location": "New York, NY",
        "website": "https://janesmith.dev",
        "linkedin": "linkedin.com/in/janesmith",
        "summary": "Experienced software engineer with 7 years building scalable web applications. Led teams and delivered high-impact products.",
        "skills": ["Python", "React", "TypeScript", "PostgreSQL", "Docker", "AWS", "Node.js", "FastAPI"],
        "experience": [
            {
                "company": "Big Tech Co",
                "position": "Senior Engineer",
                "start_date": "2020-01",
                "end_date": "Present",
                "description": "Led development of microservices architecture serving 5M requests per day. Reduced latency by 40% through optimization. Built React dashboard used by 10K users.",
            },
            {
                "company": "StartupXYZ",
                "position": "Full Stack Developer",
                "start_date": "2017-06",
                "end_date": "2019-12",
                "description": "Developed customer-facing web application using React and Node.js. Implemented CI/CD pipeline reducing deployment time by 60%.",
            },
        ],
        "education": [
            {
                "school": "MIT",
                "degree": "Bachelor of Science",
                "field": "Computer Science",
                "start_date": "2013",
                "end_date": "2017",
                "description": "",
            }
        ],
        "projects": [
            {
                "name": "Open Source Tool",
                "url": "github.com/jane/tool",
                "description": "CLI tool for automating deployments with 500+ GitHub stars.",
            }
        ],
        "certifications": [
            {"name": "AWS Solutions Architect", "issuer": "Amazon", "date": "2022"}
        ],
        "languages": [
            {"name": "English", "proficiency": "Native"},
            {"name": "Spanish", "proficiency": "Intermediate"},
        ],
    }


JD_FULL = """
We are looking for a Senior Software Engineer to join our team.
Requirements:
- 5+ years of experience in software development
- Strong proficiency in Python and JavaScript
- Experience with React and Node.js
- Knowledge of PostgreSQL and Redis
- Familiarity with Docker and Kubernetes
- Experience with AWS cloud services
- Understanding of REST API design
- Agile/Scrum experience
- Strong communication skills
- BS in Computer Science or related field
"""

JD_MINIMAL = "Looking for a Python developer with Django experience."


def test_empty_resume_no_jd():
    result = analyze_resume(_minimal_resume())
    assert result.score < 30
    assert result.has_job_description is False
    assert result.job_match_percentage is None
    assert len(result.improvements) > 0


def test_complete_resume_no_jd():
    result = analyze_resume(_complete_resume())
    assert result.score >= 60
    assert result.has_job_description is False
    assert result.job_match_percentage is None
    assert len(result.strengths) > 0


def test_complete_resume_with_jd():
    result = analyze_resume(_complete_resume(), JD_FULL)
    assert result.has_job_description is True
    assert result.job_match_percentage is not None
    assert result.job_match_percentage > 30
    assert len(result.matched_keywords) > 0
    assert len(result.matched_skills) > 0
    assert result.score > 40


def test_minimal_resume_with_jd():
    result = analyze_resume(_minimal_resume(), JD_FULL)
    assert result.has_job_description is True
    assert result.job_match_percentage is not None
    assert len(result.missing_keywords) > 0
    assert result.score < 40


def test_case_insensitive_matching():
    resume = _complete_resume()
    resume["skills"] = ["PYTHON", "react", "Typescript"]
    result = analyze_resume(resume, "Need Python and React developers")
    assert "python" in [s.lower() for s in result.matched_skills]
    assert "react" in [s.lower() for s in result.matched_skills]


def test_multiword_technical_skills():
    resume = _complete_resume()
    resume["skills"] = ["Node.js", "React.js", "ASP.NET Core", "PostgreSQL"]
    result = analyze_resume(resume, "Experience with Node.js, React.js, ASP.NET Core, and PostgreSQL required")
    assert len(result.matched_skills) >= 3


def test_no_job_description():
    resume = _complete_resume()
    result = analyze_resume(resume, "")
    assert result.has_job_description is False
    assert result.job_match_percentage is None
    assert result.matched_keywords == []
    assert result.missing_keywords == []
    assert result.score > 0


def test_score_range():
    result = analyze_resume(_complete_resume(), JD_FULL)
    assert 0 <= result.score <= 100


def test_score_label():
    result = analyze_resume(_complete_resume(), JD_FULL)
    assert result.score_label in ["Excellent", "Very Good", "Good", "Fair", "Needs Improvement"]


def test_section_analysis_populated():
    result = analyze_resume(_complete_resume())
    assert "name" in result.section_analysis
    assert "contact" in result.section_analysis
    assert "summary" in result.section_analysis
    assert "skills" in result.section_analysis
    assert "experience" in result.section_analysis
    assert "education" in result.section_analysis


def test_action_verb_detection():
    resume = _minimal_resume()
    resume["experience"] = [
        {
            "company": "Acme",
            "position": "Engineer",
            "start_date": "2020",
            "end_date": "2022",
            "description": "Built and deployed scalable applications using Python and React.",
        }
    ]
    result = analyze_resume(resume)
    assert result.score > 10


def test_numeric_achievement_detection():
    resume = _minimal_resume()
    resume["experience"] = [
        {
            "company": "Acme",
            "position": "Engineer",
            "start_date": "2020",
            "end_date": "2022",
            "description": "Increased performance by 50% and reduced costs by 30K.",
        }
    ]
    result = analyze_resume(resume)
    assert result.score > 10


def test_deterministic():
    resume = _complete_resume()
    r1 = analyze_resume(resume, JD_FULL)
    r2 = analyze_resume(resume, JD_FULL)
    assert r1.score == r2.score
    assert r1.matched_keywords == r2.matched_keywords
    assert r1.missing_skills == r2.missing_skills


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
