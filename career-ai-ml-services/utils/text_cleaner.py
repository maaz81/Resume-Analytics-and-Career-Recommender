"""
Utility for cleaning text before NLP processing
"""

import re


def clean_text(text: str) -> str:
    """
    Basic text preprocessing
    """
    text = text.lower()
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[^\w\s]', ' ', text)

    return text.strip()