"""
Recommends courses and projects based on missing skills.
"""

COURSES_DB = {
    "python": ["Python for Beginners - Coursera"],
    "machine learning": ["Machine Learning by Andrew Ng"],
    "nlp": ["NLP with Python - Udemy"],
    "sql": ["SQL Bootcamp - Udemy"],
    "deep learning": ["Deep Learning Specialization"]
}

PROJECTS_DB = {
    "python": ["Student Management System"],
    "machine learning": ["House Price Prediction"],
    "nlp": ["AI Chatbot"],
    "sql": ["Library Database System"],
    "deep learning": ["Image Classification App"]
}


def recommend_courses(missing_skills):
    """
    Suggest courses for missing skills
    """
    courses = []
    for skill in missing_skills:
        courses.extend(COURSES_DB.get(skill, []))
    return courses


def recommend_projects(missing_skills):
    """
    Suggest projects for missing skills
    """
    projects = []
    for skill in missing_skills:
        projects.extend(PROJECTS_DB.get(skill, []))
    return projects
