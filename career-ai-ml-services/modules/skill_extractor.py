"""
Skill extraction module.
Loads skills from JSON and performs simple keyword matching.
Logic kept same as previous version to avoid breaking changes.
"""

import json
import spacy
from pathlib import Path
from utils.text_cleaner import clean_text

# Load spaCy model
nlp = spacy.load("en_core_web_sm")

# Load skills database
BASE_DIR = Path(__file__).resolve().parent.parent
SKILLS_PATH = BASE_DIR / "data" / "skills.json"

with open(SKILLS_PATH, "r", encoding="utf-8") as f:
    SKILLS_DB = json.load(f)


def extract_skills(text: str):
    """
    Extract skills from text using keyword matching.
    """
    text = clean_text(text)
    doc = nlp(text)

    found_skills = set()

    for skill, variants in SKILLS_DB.items():
        for variant in variants:
            if variant in text:
                found_skills.add(skill)

    return list(found_skills)