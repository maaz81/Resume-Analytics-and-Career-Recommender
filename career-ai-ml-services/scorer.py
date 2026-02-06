# """
# Scoring logic: Skill gap, job match score, ATS score
# """

# def skill_gap(jd_skills, resume_skills):
#     """
#     Returns missing skills
#     """
#     return list(set(jd_skills) - set(resume_skills))


# def job_match_score(jd_skills, resume_skills):
#     """
#     Calculates job match percentage
#     """
#     if len(jd_skills) == 0:
#         return 0

#     matched = set(jd_skills).intersection(set(resume_skills))
#     score = (len(matched) / len(jd_skills)) * 100
#     return round(score, 2)


# def ats_score(resume_text):
#     """
#     Simple ATS score based on keywords
#     """
#     keywords = ["skills", "experience", "projects", "education"]
#     score = 0

#     for word in keywords:
#         if word in resume_text.lower():
#             score += 25

#     return score
"""
Scoring logic: skill gap, job match, ATS score
"""

SKILL_WEIGHTS = {
    "machine learning": 5,
    "nlp": 4,
    "deep learning": 4,
    "python": 3,
    "sql": 2,
    "react": 2
}


def skill_gap(jd_skills, resume_skills):
    return list(set(jd_skills) - set(resume_skills))


def job_match_score(jd_skills, resume_skills):
    if not jd_skills:
        return 0

    matched = set(jd_skills).intersection(set(resume_skills))

    total_weight = sum(SKILL_WEIGHTS.get(skill, 1) for skill in jd_skills)
    matched_weight = sum(SKILL_WEIGHTS.get(skill, 1) for skill in matched)

    score = (matched_weight / total_weight) * 100
    return round(score, 2)


def ats_score(resume_text, jd_skills):
    score = 0
    resume_text = resume_text.lower()

    # Resume structure
    sections = ["skills", "experience", "projects", "education"]
    score += sum(10 for sec in sections if sec in resume_text)

    # JD keyword coverage
    for skill in jd_skills:
        if skill in resume_text:
            score += 5

    return min(score, 100)
