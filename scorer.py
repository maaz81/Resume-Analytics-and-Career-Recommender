"""
Scoring logic: Skill gap, job match score, ATS score
"""

def skill_gap(jd_skills, resume_skills):
    """
    Returns missing skills
    """
    return list(set(jd_skills) - set(resume_skills))


def job_match_score(jd_skills, resume_skills):
    """
    Calculates job match percentage
    """
    if len(jd_skills) == 0:
        return 0

    matched = set(jd_skills).intersection(set(resume_skills))
    score = (len(matched) / len(jd_skills)) * 100
    return round(score, 2)


def ats_score(resume_text):
    """
    Simple ATS score based on keywords
    """
    keywords = ["skills", "experience", "projects", "education"]
    score = 0

    for word in keywords:
        if word in resume_text.lower():
            score += 25

    return score
