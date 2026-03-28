# """
# Skill extraction module.
# Loads skills from JSON and performs keyword matching.
# spaCy and skills DB are lazy-loaded on first use.
# """

# import json
# from pathlib import Path
# from utils.text_cleaner import clean_text

# BASE_DIR = Path(__file__).resolve().parent.parent
# SKILLS_PATH = BASE_DIR / "data" / "skills.json"

# _nlp = None
# _skills_db = None

# def _get_nlp():
#     global _nlp
#     if _nlp is None:
#         try:
#             import spacy
#             _nlp = spacy.load("en_core_web_sm")
#         except Exception as e:
#             raise RuntimeError(f"spaCy model not available: {e}")
#     return _nlp

# def _get_skills_db():
#     global _skills_db
#     if _skills_db is None:
#         try:
#             with open(SKILLS_PATH, "r", encoding="utf-8") as f:
#                 _skills_db = json.load(f)
#         except FileNotFoundError:
#             raise RuntimeError(f"skills.json not found at {SKILLS_PATH}")
#     return _skills_db

# def extract_skills(text: str):
#     text = clean_text(text)
#     skills_db = _get_skills_db()

#     found_skills = set()
#     for skill, variants in skills_db.items():
#         for variant in variants:
#             if variant in text:
#                 found_skills.add(skill)

#     return list(found_skills)

# """
# Skill extraction module.
# - Skill-safe cleaner use karta hai
# - Word boundary matching (no more false positives)
# - Lazy loading
# """

# import re
# import json
# from pathlib import Path
# from utils.text_cleaner import clean_text_for_skills

# BASE_DIR   = Path(__file__).resolve().parent.parent
# SKILLS_PATH = BASE_DIR / "data" / "skills_1000_plus.json"

# _skills_db = None

# def _get_skills_db():
#     global _skills_db
#     if _skills_db is None:
#         try:
#             with open(SKILLS_PATH, "r", encoding="utf-8") as f:
#                 _skills_db = json.load(f)
#         except FileNotFoundError:
#             raise RuntimeError(f"skills.json not found at {SKILLS_PATH}")
#     return _skills_db


# def _match_skill(variant: str, text: str) -> bool:
#     """
#     Word boundary match — 'c' ko 'communication' se alag karta hai.
#     Special chars wale skills (C++, C#) ke liye escaped regex.
#     """
#     escaped = re.escape(variant)
#     pattern = rf'\b{escaped}\b'
#     return bool(re.search(pattern, text))


# def extract_skills(text: str) -> list:
#     """
#     Extract skills using word-boundary matching on skill-safe cleaned text.
#     """
#     cleaned = clean_text_for_skills(text)
#     skills_db = _get_skills_db()

#     found_skills = set()

#     for skill, variants in skills_db.items():
#         for variant in variants:
#             if _match_skill(variant, cleaned):
#                 found_skills.add(skill)
#                 break  # ek variant match hua — aage mat dekho

#     return list(found_skills)


"""
Skill extraction module.
- Nested JSON ko flat karta hai automatically
- Word boundary matching
- Lazy loading
"""

import re
import json
from pathlib import Path
from utils.text_cleaner import clean_text_for_skills

BASE_DIR    = Path(__file__).resolve().parent.parent
SKILLS_PATH = BASE_DIR / "data" / "skills_1000_plus.json"

_skills_db = None


def _get_skills_db():
    global _skills_db
    if _skills_db is None:
        try:
            with open(SKILLS_PATH, "r", encoding="utf-8") as f:
                raw = json.load(f)
        except FileNotFoundError:
            raise RuntimeError(f"skills JSON not found at {SKILLS_PATH}")

        # ── Nested category structure ko flat karo ──────────────────────
        # Input:  { "programming_languages": { "python": ["python", "py"] } }
        # Output: { "python": ["python", "py"] }
        flat = {}
        for key, value in raw.items():
            if isinstance(value, dict):
                # Nested category — andar ki skills nikalo
                flat.update(value)
            elif isinstance(value, list):
                # Already flat format — seedha le lo
                flat[key] = value

        _skills_db = flat

    return _skills_db


def _match_skill(variant: str, text: str) -> bool:
    """
    Word boundary match.
    C++, C# jaise special chars ke liye re.escape use karo.
    """
    escaped = re.escape(variant)
    pattern = rf'\b{escaped}\b'
    return bool(re.search(pattern, text))


def extract_skills(text: str) -> list:
    """
    Skill-safe cleaned text pe word-boundary matching.
    """
    cleaned   = clean_text_for_skills(text)
    skills_db = _get_skills_db()

    found_skills = set()

    for skill, variants in skills_db.items():
        for variant in variants:
            if _match_skill(variant, cleaned):
                found_skills.add(skill)
                break  # ek match mila — aage mat dekho

    return list(found_skills)