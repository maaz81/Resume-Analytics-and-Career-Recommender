"""
Extract skills from text using simple NLP logic.
"""

import spacy

# Load NLP model
nlp = spacy.load("en_core_web_sm")

# Predefined skill list (you can expand this)
SKILLS_DB = [
    "python", "machine learning", "nlp", "deep learning",
    "sql", "java", "react", "fastapi", "flask",
    "data science", "tensorflow", "pytorch"
]


def extract_skills(text):
    """
    Extract skills from resume or JD text.
    """
    text = text.lower()
    found_skills = []

    for skill in SKILLS_DB:
        if skill in text:
            found_skills.append(skill)

    return list(set(found_skills))
