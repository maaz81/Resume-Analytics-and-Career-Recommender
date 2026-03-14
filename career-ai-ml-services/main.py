"""
MAIN AI ENGINE FILE
This file connects all modules and returns final analysis.
"""

from modules.skill_extractor import extract_skills
from modules.recommender import recommend_courses, recommend_projects

from services.match_service import get_missing_skills, calculate_match_score
from services.ats_service import calculate_ats_score


def analyze(resume_text, jd_text):
    """
    Main function called by backend API.
    Input: resume_text, jd_text (strings)
    Output: dictionary (JSON response)
    """

    # Extract skills
    resume_skills = extract_skills(resume_text)
    jd_skills = extract_skills(jd_text)

    # Find missing skills
    missing_skills = get_missing_skills(jd_skills, resume_skills)

    # Calculate scores
    match_score = calculate_match_score(jd_skills, resume_skills)
    ats = calculate_ats_score(resume_text, jd_skills)

    # Generate recommendations
    courses = recommend_courses(missing_skills)
    projects = recommend_projects(missing_skills)

    return {
        "resume_skills": resume_skills,
        "jd_skills": jd_skills,
        "missing_skills": missing_skills,
        "job_match_score": match_score,
        "ats_score": ats,
        "courses": courses,
        "projects": projects
    }