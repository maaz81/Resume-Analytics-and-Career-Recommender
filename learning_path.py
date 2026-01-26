"""
Generates weekly learning plan.
"""

def generate_learning_path(missing_skills):
    """
    Create week-wise learning plan
    """
    path = []
    for i, skill in enumerate(missing_skills):
        path.append(f"Week {i+1}: Learn {skill}")
    return path
