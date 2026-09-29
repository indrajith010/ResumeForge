import re

from app.models.ats import AtsResponse

STOP_WORDS = frozenset(
    "a an the and or but if in on at to for of is it its that this these those "
    "be am are was were been being have has had do does did will would could should "
    "may might can shall with from by as into through during before after above below "
    "between out off over under again further then once here there when where why how "
    "all each every both few more most other some such no nor not only own same so "
    "than too very s t just don now d ll m o re ve y ain aren couldn didn doesn hadn "
    "hasn haven isn ma mightn mustn needn shan shouldn wasn weren won wouldn "
    "about up also used using use make makes made get gets got work working worked "
    "include includes including able like well need new".split()
)

TECH_SKILLS = {
    "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust", "ruby",
    "php", "swift", "kotlin", "scala", "r", "matlab", "perl", "haskell", "elixir",
    "react", "react.js", "reactjs", "react js", "angular", "angularjs", "vue", "vue.js",
    "vuejs", "vue js", "svelte", "next.js", "nextjs", "next js", "nuxt", "nuxt.js",
    "node.js", "nodejs", "node js", "express", "express.js", "django", "flask", "fastapi",
    "spring", "spring boot", "springboot", "ruby on rails", "rails", "laravel", "asp.net",
    "asp.net core", "dotnet", ".net", ".net core", "graphql", "rest", "rest api",
    "restful", "grpc", "websocket",
    "html", "css", "sass", "scss", "less", "tailwind", "tailwind css", "bootstrap",
    "material ui", "chakra ui", "styled-components",
    "postgresql", "postgres", "mysql", "sqlite", "mongodb", "redis", "elasticsearch",
    "dynamodb", "cassandra", "neo4j", "firebase", "supabase", "planetscale",
    "aws", "amazon web services", "gcp", "google cloud", "azure", "docker", "kubernetes",
    "k8s", "terraform", "ansible", "jenkins", "ci/cd", "github actions", "gitlab ci",
    "circleci", "travis ci",
    "git", "github", "gitlab", "bitbucket", "jira", "confluence",
    "machine learning", "deep learning", "nlp", "natural language processing",
    "tensorflow", "pytorch", "keras", "scikit-learn", "sklearn", "pandas", "numpy",
    "opencv", "hugging face", "huggingface", "openai", "langchain", "llm",
    "data science", "data analysis", "data engineering", "etl", "airflow",
    "spark", "hadoop", "kafka", "tableau", "power bi",
    "figma", "sketch", "adobe xd", "photoshop", "illustrator",
    "agile", "scrum", "kanban", "tdd", "bdd",
    "linux", "unix", "bash", "shell", "powershell",
    "http", "https", "tcp/ip", "dns", "vpn", "ssl", "tls",
    "oauth", "jwt", "cors", "xss", "csrf",
    "unit testing", "integration testing", "e2e testing", "cypress", "playwright",
    "selenium", "jest", "mocha", "pytest", "junit", "xunit",
    "microservices", "serverless", "lambda", "cloud functions",
    "vercel", "netlify", "heroku", "digitalocean",
}

ACTION_VERBS = {
    "achieved", "built", "created", "designed", "developed", "implemented", "improved",
    "increased", "led", "managed", "optimized", "reduced", "launched", "delivered",
    "automated", "migrated", "integrated", "architected", "established", "streamlined",
    "coordinated", "mentored", "spearheaded", "pioneered", "orchestrated", "negotiated",
    "resolved", "standardized", "consolidated", "scaled", "enhanced", "refactored",
    "debugged", "deployed", "configured", "maintained", "supported", "troubleshot",
    "analyzed", "evaluated", "researched", "documented", "presented", "facilitated",
    "executed", "planned", "organized", "prioritized", "supervised", "oversaw",
}

NUMERIC_PATTERN = re.compile(r"\b\d+[\d,.]*[%kmb]?\b", re.IGNORECASE)


def analyze_resume(resume: dict, job_description: str = "") -> AtsResponse:
    resume_text = _full_text(resume).lower()
    has_jd = bool(job_description.strip())
    jd_text = job_description.lower() if has_jd else ""

    section_scores, section_analysis = _analyze_sections(resume)
    completeness_score = _score_completeness(section_scores)

    if has_jd:
        jd_keywords = _extract_keywords(jd_text)
        resume_keywords = _extract_keywords(resume_text)
        matched_kw = sorted(jd_keywords & resume_keywords)
        missing_kw = sorted(jd_keywords - resume_keywords)
        match_pct = int(len(matched_kw) / len(jd_keywords) * 100) if jd_keywords else 0

        jd_skills = _extract_tech_skills(jd_text)
        resume_skills_set = _extract_tech_skills(resume_text) | set(
            s.lower() for s in resume.get("skills", [])
        )
        matched_sk = sorted(jd_skills & resume_skills_set)
        missing_sk = sorted(jd_skills - resume_skills_set)
        skill_score = int(len(matched_sk) / len(jd_skills) * 20) if jd_skills else 10

        keyword_score = int(len(matched_kw) / len(jd_keywords) * 35) if jd_keywords else 0
    else:
        matched_kw, missing_kw, matched_sk, missing_sk = [], [], [], []
        match_pct = None
        keyword_score = 10
        skill_score = _score_skills_no_jd(resume)

    quality_score = _score_experience_quality(resume)
    format_score = _score_ats_format(resume, resume_text)

    total = completeness_score + keyword_score + skill_score + quality_score + format_score
    total = max(0, min(100, total))

    strengths, improvements, warnings = _generate_feedback(
        section_scores, has_jd, match_pct, matched_kw, missing_kw,
        matched_sk, missing_sk, quality_score, format_score, section_analysis,
    )

    return AtsResponse(
        score=total,
        score_label=_score_label(total),
        has_job_description=has_jd,
        job_match_percentage=match_pct,
        matched_keywords=matched_kw,
        missing_keywords=missing_kw,
        matched_skills=matched_sk,
        missing_skills=missing_sk,
        section_analysis=section_analysis,
        strengths=strengths,
        improvements=improvements,
        warnings=warnings,
    )


def _full_text(resume: dict) -> str:
    parts = [
        resume.get("full_name", ""),
        resume.get("job_title", ""),
        resume.get("email", ""),
        resume.get("phone", ""),
        resume.get("location", ""),
        resume.get("website", ""),
        resume.get("linkedin", ""),
        resume.get("summary", ""),
    ]
    for s in resume.get("skills", []):
        parts.append(s)
    for exp in resume.get("experience", []):
        parts.extend([exp.get("company", ""), exp.get("position", ""), exp.get("description", "")])
    for edu in resume.get("education", []):
        parts.extend([edu.get("school", ""), edu.get("degree", ""), edu.get("field", ""), edu.get("description", "")])
    for proj in resume.get("projects", []):
        parts.extend([proj.get("name", ""), proj.get("description", "")])
    for cert in resume.get("certifications", []):
        parts.extend([cert.get("name", ""), cert.get("issuer", "")])
    for lang in resume.get("languages", []):
        parts.append(lang.get("name", ""))
    return " ".join(parts)


def _extract_keywords(text: str) -> set[str]:
    words = re.findall(r"[a-z0-9][a-z0-9.\-+/]{1,40}", text)
    keywords = set()
    for w in words:
        w_clean = w.strip(".-+/")
        if len(w_clean) < 2 or w_clean in STOP_WORDS:
            continue
        keywords.add(w_clean)
    return keywords


def _extract_tech_skills(text: str) -> set[str]:
    found = set()
    text_lower = text.lower()
    for skill in TECH_SKILLS:
        pattern = r"(?<![a-z0-9])" + re.escape(skill) + r"(?![a-z0-9])"
        if re.search(pattern, text_lower):
            found.add(skill)
    return found


def _analyze_sections(resume: dict) -> tuple[dict[str, float], dict[str, dict]]:
    sections = {}
    analysis = {}

    name_present = bool(resume.get("full_name", "").strip())
    sections["name"] = 1.0 if name_present else 0.0
    analysis["name"] = {
        "present": name_present,
        "message": "Name is included" if name_present else "Name is missing",
    }

    contact_fields = ["email", "phone", "location"]
    contact_count = sum(1 for f in contact_fields if resume.get(f, "").strip())
    sections["contact"] = contact_count / len(contact_fields)
    analysis["contact"] = {
        "present": contact_count > 0,
        "fields_present": contact_count,
        "fields_total": len(contact_fields),
        "message": f"{contact_count}/{len(contact_fields)} contact fields provided",
    }

    summary = resume.get("summary", "").strip()
    summary_words = len(summary.split()) if summary else 0
    if summary_words >= 30:
        sections["summary"] = 1.0
    elif summary_words >= 10:
        sections["summary"] = 0.6
    elif summary_words > 0:
        sections["summary"] = 0.3
    else:
        sections["summary"] = 0.0
    analysis["summary"] = {
        "present": summary_words > 0,
        "word_count": summary_words,
        "message": (
            "Good summary length" if summary_words >= 30
            else f"Summary is short ({summary_words} words)" if summary_words > 0
            else "Professional summary is missing"
        ),
    }

    skills = resume.get("skills", [])
    if len(skills) >= 5:
        sections["skills"] = 1.0
    elif len(skills) > 0:
        sections["skills"] = len(skills) / 5
    else:
        sections["skills"] = 0.0
    analysis["skills"] = {
        "present": len(skills) > 0,
        "count": len(skills),
        "message": f"{len(skills)} skill(s) listed",
    }

    experience = resume.get("experience", [])
    if len(experience) >= 2:
        sections["experience"] = 1.0
    elif len(experience) == 1:
        sections["experience"] = 0.6
    else:
        sections["experience"] = 0.0
    analysis["experience"] = {
        "present": len(experience) > 0,
        "count": len(experience),
        "message": f"{len(experience)} experience entry/entries",
    }

    education = resume.get("education", [])
    sections["education"] = 1.0 if len(education) >= 1 else 0.0
    analysis["education"] = {
        "present": len(education) > 0,
        "count": len(education),
        "message": f"{len(education)} education entry/entries",
    }

    projects = resume.get("projects", [])
    sections["projects"] = min(1.0, len(projects) / 2) if projects else 0.3
    analysis["projects"] = {
        "present": len(projects) > 0,
        "count": len(projects),
        "message": f"{len(projects)} project(s) listed",
    }

    certifications = resume.get("certifications", [])
    sections["certifications"] = min(1.0, len(certifications) / 1) if certifications else 0.3
    analysis["certifications"] = {
        "present": len(certifications) > 0,
        "count": len(certifications),
        "message": f"{len(certifications)} certification(s)",
    }

    languages = resume.get("languages", [])
    sections["languages"] = min(1.0, len(languages) / 2) if languages else 0.3
    analysis["languages"] = {
        "present": len(languages) > 0,
        "count": len(languages),
        "message": f"{len(languages)} language(s)",
    }

    return sections, analysis


def _score_completeness(section_scores: dict[str, float]) -> int:
    weights = {
        "name": 3, "contact": 3, "summary": 4, "skills": 4,
        "experience": 5, "education": 3, "projects": 1, "certifications": 1, "languages": 1,
    }
    total_weight = sum(weights.values())
    weighted = sum(section_scores.get(k, 0) * w for k, w in weights.items())
    return int(weighted / total_weight * 25)


def _score_skills_no_jd(resume: dict) -> int:
    skills = set(s.lower() for s in resume.get("skills", []))
    resume_text = _full_text(resume).lower()
    tech_in_text = _extract_tech_skills(resume_text)
    all_tech = skills | tech_in_text
    if len(all_tech) >= 8:
        return 20
    if len(all_tech) >= 5:
        return 15
    if len(all_tech) >= 2:
        return 10
    return 3


def _score_experience_quality(resume: dict) -> int:
    score = 0
    experience = resume.get("experience", [])
    if not experience:
        return 2

    for exp in experience:
        desc = exp.get("description", "")
        words = desc.split()
        if len(words) >= 15:
            score += 3
        elif len(words) >= 5:
            score += 1.5

        desc_lower = desc.lower()
        if any(v in desc_lower for v in ACTION_VERBS):
            score += 2

        if NUMERIC_PATTERN.search(desc):
            score += 2

        if exp.get("company", "").strip() and exp.get("position", "").strip():
            score += 1

    max_score = len(experience) * 8
    return min(10, int(score / max_score * 10)) if max_score > 0 else 5


def _score_ats_format(resume: dict, full_text: str) -> int:
    score = 10
    warnings = []

    unusual_chars = re.findall(r"[^\x00-\x7F\s]", full_text)
    if len(unusual_chars) > 5:
        score -= 2
        warnings.append("Unusual characters detected")

    if len(full_text.split()) < 30:
        score -= 3
        warnings.append("Very short content")

    if resume.get("summary", "") and len(resume["summary"]) > 2000:
        score -= 1
        warnings.append("Summary is very long")

    for exp in resume.get("experience", []):
        if len(exp.get("description", "")) > 1500:
            score -= 1
            break

    if not resume.get("email", "").strip() and not resume.get("phone", "").strip():
        score -= 2

    return max(0, score)


def _generate_feedback(
    section_scores, has_jd, match_pct, matched_kw, missing_kw,
    matched_sk, missing_sk, quality_score, format_score, section_analysis,
):
    strengths = []
    improvements = []
    warnings = []

    if section_scores.get("name", 0) >= 1.0:
        strengths.append("Full name is present")
    else:
        improvements.append("Add your full name")

    if section_scores.get("contact", 0) >= 0.67:
        strengths.append("Contact information is well provided")
    elif section_scores.get("contact", 0) > 0:
        improvements.append("Consider adding more contact details (email, phone, location)")
    else:
        improvements.append("Add contact information (email, phone, location)")

    if section_scores.get("summary", 0) >= 1.0:
        strengths.append("Professional summary is comprehensive")
    elif section_scores.get("summary", 0) >= 0.6:
        improvements.append("Consider expanding your professional summary to 30+ words")
    else:
        improvements.append("Add a professional summary (aim for 30-50 words)")

    if section_scores.get("skills", 0) >= 1.0:
        strengths.append("Skills section is well populated")
    elif section_scores.get("skills", 0) > 0:
        improvements.append("Consider adding more skills (aim for 5+)")
    else:
        improvements.append("Add relevant technical and soft skills")

    if section_scores.get("experience", 0) >= 1.0:
        strengths.append("Experience section has good coverage")
    elif section_scores.get("experience", 0) > 0:
        improvements.append("Consider adding more work experience entries")
    else:
        improvements.append("Add work experience entries")

    if section_scores.get("education", 0) >= 1.0:
        strengths.append("Education section is present")
    else:
        improvements.append("Add your educational background")

    if has_jd:
        if match_pct is not None and match_pct >= 70:
            strengths.append(f"Strong keyword match with job description ({match_pct}%)")
        elif match_pct is not None and match_pct >= 40:
            improvements.append(f"Moderate keyword match ({match_pct}%) — add more relevant keywords")
        elif match_pct is not None:
            improvements.append(f"Low keyword match ({match_pct}%) — incorporate more job-specific terms")

        if matched_kw:
            strengths.append(f"Matched {len(matched_kw)} keyword(s) from job description")
        if missing_kw:
            improvements.append(f"Add missing keywords: {', '.join(missing_kw[:5])}")

        if matched_sk:
            strengths.append(f"Matched skills: {', '.join(matched_sk[:5])}")
        if missing_sk:
            improvements.append(f"Consider adding skills: {', '.join(missing_sk[:5])}")

    if quality_score >= 7:
        strengths.append("Experience descriptions use strong action verbs and metrics")
    elif quality_score <= 4:
        improvements.append("Use action verbs and quantify achievements in experience descriptions")

    if format_score < 8:
        warnings.append("Resume formatting could be improved for ATS parsing")

    return strengths, improvements, warnings


def _score_label(score: int) -> str:
    if score >= 90:
        return "Excellent"
    if score >= 75:
        return "Very Good"
    if score >= 60:
        return "Good"
    if score >= 40:
        return "Fair"
    return "Needs Improvement"
