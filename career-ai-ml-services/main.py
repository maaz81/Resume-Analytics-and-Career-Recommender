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


# # Testing without backend
# if __name__ == "__main__":
#     resume = "I know Python, SQL and worked on projects"
#     jd = "Need Python, Machine Learning, NLP, SQL"

#     result = analyze(resume, jd)
#     print(result)


# """
# MAIN AI ENGINE FILE
# This file connects all modules and returns final analysis.
# """

# import re
# from skill_extractor import extract_skills
# from scorer import skill_gap, job_match_score, ats_score
# from recommender import recommend_courses, recommend_projects
# from learning_path import generate_learning_path

# WEAK_VERBS = ["worked", "helped", "assisted", "responsible", "involved"]

# def analyze(resume_text, jd_text):

#     resume_text_lower = resume_text.lower()

#     # Skill extraction
#     resume_skills = extract_skills(resume_text)
#     jd_skills = extract_skills(jd_text)

#     strong_skills = list(set(resume_skills) & set(jd_skills))
#     missing_skills = skill_gap(jd_skills, resume_skills)

#     # -----------------------------
#     # Keyword Score
#     # -----------------------------
#     keyword_score = job_match_score(jd_skills, resume_skills)

#     # -----------------------------
#     # Formatting Score
#     # -----------------------------
#     sections = ["skills", "experience", "projects", "education"]
#     section_hits = sum(1 for sec in sections if sec in resume_text_lower)

#     bullet_points = resume_text.count("•") + resume_text.count("- ")
#     length_score = min(len(resume_text) / 1000, 1) * 20

#     formatting_score = min(40 + (section_hits * 10) + (bullet_points * 2) + length_score, 100)

#     # -----------------------------
#     # Experience Score
#     # -----------------------------
#     years = re.findall(r"\b\d+\+?\s*(years|yrs)\b", resume_text_lower)
#     experience_score = min(50 + (len(years) * 10), 100)

#     # -----------------------------
#     # Weak Action Verbs
#     # -----------------------------
#     weak_verbs_found = [verb for verb in WEAK_VERBS if verb in resume_text_lower]

#     # -----------------------------
#     # Overall Score
#     # -----------------------------
#     overall_score = round(
#         (keyword_score * 0.5) +
#         (formatting_score * 0.25) +
#         (experience_score * 0.25),
#         2
#     )

#     # -----------------------------
#     # Recommendations
#     # -----------------------------
#     courses = recommend_courses(missing_skills)
#     projects = recommend_projects(missing_skills)
#     learning_path = generate_learning_path(missing_skills)

#     return {
#         "overallScore": overall_score,
#         "formattingScore": round(formatting_score, 2),
#         "keywordScore": keyword_score,
#         "experienceScore": experience_score,
#         "issues": [],
#         "missingKeywords": missing_skills,
#         "weakActionVerbs": weak_verbs_found,
#         "strongSkills": strong_skills,
#         "weakSkills": [],
#         "missingSkills": missing_skills,
#         "learningPath": learning_path,
#         "modelVersion": "v2.0"
#     }

# # Testing without backend
# if __name__ == "__main__":
#     resume = "I know Python, SQL and worked on projects"
#     jd = "Need Python, Machine Learning, NLP, SQL"

#     result = analyze(resume, jd)
#     print(result)
