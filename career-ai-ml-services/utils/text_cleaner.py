# """
# Utility for cleaning text before NLP processing
# """

# import re


# def clean_text(text: str) -> str:
#     """
#     Basic text preprocessing
#     """
#     text = text.lower()
#     text = re.sub(r'\s+', ' ', text)
#     text = re.sub(r'[^\w\s]', ' ', text)

#     return text.strip()

"""
Utility for cleaning text before NLP processing.
Skill-sensitive characters (+, #, .) are preserved.
"""

import re

def clean_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r'\s+', ' ', text)
    # Sirf actual garbage remove karo — +, #, . preserve karo
    text = re.sub(r'[^\w\s\+\#\.]', ' ', text)
    return text.strip()


def clean_text_for_skills(text: str) -> str:
    """
    Skill matching ke liye alag cleaner.
    C++, C#, Node.js, ASP.NET — sab preserve hoga.
    """
    text = text.lower()
    text = re.sub(r'\s+', ' ', text)
    # Kuch bhi mat hatao — skills ko raw text pe match karo
    return text.strip()