# """
# Extract skills from text using simple NLP logic.
# """

# import spacy

# # Load NLP model
# nlp = spacy.load("en_core_web_sm")

# # Predefined skill list (you can expand this)
# SKILLS_DB = [
#     "python", "machine learning", "nlp", "deep learning",
#     "sql", "java", "react", "fastapi", "flask",
#     "data science", "tensorflow", "pytorch"
# ]


# def extract_skills(text):
#     """
#     Extract skills from resume or JD text.
#     """
#     text = text.lower()
#     found_skills = []

#     for skill in SKILLS_DB:
#         if skill in text:
#             found_skills.append(skill)

#     return list(set(found_skills))
"""
Skill extraction using spaCy NLP (token + phrase matching)
"""

import spacy

nlp = spacy.load("en_core_web_sm")

SKILLS_DB = {
    "python": ["python"],
    "machine learning": ["machine learning", "ml"],
    "nlp": ["nlp", "natural language processing"],
    "deep learning": ["deep learning"],
    "sql": ["sql"],
    "react": ["react", "reactjs"],
    "fastapi": ["fastapi"],
    "flask": ["flask"],
    "tensorflow": ["tensorflow"],
    "pytorch": ["pytorch"]
}


def extract_skills(text: str):
    text = text.lower()
    doc = nlp(text)

    found_skills = set()

    # Token-based matching
    tokens = [token.text for token in doc]

    # Phrase-based matching
    noun_chunks = [chunk.text for chunk in doc.noun_chunks]

    for skill, variants in SKILLS_DB.items():
        for variant in variants:
            if variant in text:
                found_skills.add(skill)

    return list(found_skills)
