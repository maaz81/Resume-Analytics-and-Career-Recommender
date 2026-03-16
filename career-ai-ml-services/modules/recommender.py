"""
Recommends courses and projects based on missing skills.
Data is loaded from JSON files instead of hardcoded dictionaries.
"""

import json
from pathlib import Path

# Resolve project root
BASE_DIR = Path(__file__).resolve().parent.parent

COURSES_PATH = BASE_DIR / "data" / "courses.json"
PROJECTS_PATH = BASE_DIR / "data" / "projects.json"

# Load databases
with open(COURSES_PATH, "r", encoding="utf-8") as f:
    COURSES_DB = json.load(f)

with open(PROJECTS_PATH, "r", encoding="utf-8") as f:
    PROJECTS_DB = json.load(f)


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