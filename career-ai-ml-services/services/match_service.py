"""
Job matching service
Handles skill gap and job match score
"""

from modules.scorer import skill_gap, job_match_score


def get_missing_skills(jd_skills, resume_skills):
    """
    Identify missing skills
    """
    return skill_gap(jd_skills, resume_skills)


def calculate_match_score(jd_skills, resume_skills):
    """
    Calculate job match score
    """
    return job_match_score(jd_skills, resume_skills)