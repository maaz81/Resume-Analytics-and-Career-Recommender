"""
Scoring logic: skill gap, job match score, ATS score
"""

from utils.constants import RESUME_SECTIONS, DEFAULT_SKILL_WEIGHT, MAX_ATS_SCORE


# Skill importance weights
SKILL_WEIGHTS = {
    "machine learning": 5,
    "nlp": 4,
    "deep learning": 4,
    "python": 3,
    "sql": 2,
    "react": 2
}


def skill_gap(jd_skills, resume_skills):
    """
    Identify missing skills in resume compared to job description
    """
    return list(set(jd_skills) - set(resume_skills))


def job_match_score(jd_skills, resume_skills):
    """
    Calculate weighted skill match score
    """
    if not jd_skills:
        return 0

    matched = set(jd_skills).intersection(set(resume_skills))

    total_weight = sum(SKILL_WEIGHTS.get(skill, DEFAULT_SKILL_WEIGHT) for skill in jd_skills)
    matched_weight = sum(SKILL_WEIGHTS.get(skill, DEFAULT_SKILL_WEIGHT) for skill in matched)

    score = (matched_weight / total_weight) * 100

    return round(score, 2)


def ats_score(resume_text, jd_skills):
    """
    Simple ATS scoring based on resume sections and keyword coverage
    """
    score = 0
    resume_text = resume_text.lower()

    # Check if important sections exist
    score += sum(10 for sec in RESUME_SECTIONS if sec in resume_text)

    # Check JD keyword coverage
    for skill in jd_skills:
        if skill in resume_text:
            score += 5

    return min(score, MAX_ATS_SCORE)