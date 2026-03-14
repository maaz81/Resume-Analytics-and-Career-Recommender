"""
ATS scoring service
Acts as a wrapper around scorer.ats_score
"""

from modules.scorer import ats_score


def calculate_ats_score(resume_text, jd_skills):
    """
    Wrapper service for ATS score calculation
    """
    return ats_score(resume_text, jd_skills)