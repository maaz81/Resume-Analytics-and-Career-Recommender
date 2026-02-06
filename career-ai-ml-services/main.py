"""
MAIN AI ENGINE FILE
This file connects all modules and returns final analysis.
"""

from skill_extractor import extract_skills
from scorer import skill_gap, job_match_score, ats_score
from recommender import recommend_courses, recommend_projects
from learning_path import generate_learning_path


def analyze(resume_text, jd_text):
    """
    Main function called by backend API.
    Input: resume_text, jd_text (strings)
    Output: dictionary (JSON response)
    """

    # Extract skills from resume and JD
    resume_skills = extract_skills(resume_text)
    jd_skills = extract_skills(jd_text)

    # Find missing skills
    missing_skills = skill_gap(jd_skills, resume_skills)

    # Calculate scores
    match_score = job_match_score(jd_skills, resume_skills)
    ats = ats_score(resume_text, jd_skills)

    # Generate recommendations
    courses = recommend_courses(missing_skills)
    projects = recommend_projects(missing_skills)
    learning_path = generate_learning_path(missing_skills)

    return {
        "resume_skills": resume_skills,
        "jd_skills": jd_skills,
        "missing_skills": missing_skills,
        "job_match_score": match_score,
        "ats_score": ats,
        "courses": courses,
        "projects": projects,
        "learning_path": learning_path
    }


# Testing without backend
if __name__ == "__main__":
    resume = "I know Python, SQL and worked on projects"
    jd = "Need Python, Machine Learning, NLP, SQL"

    result = analyze(resume, jd)
    print(result)
