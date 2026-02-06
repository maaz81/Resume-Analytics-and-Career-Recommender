# """
# Generates weekly learning plan.
# """

# def generate_learning_path(missing_skills):
#     """
#     Create week-wise learning plan
#     """
#     path = []
#     for i, skill in enumerate(missing_skills):
#         path.append(f"Week {i+1}: Learn {skill}")
#     return path

"""
Priority-based learning roadmap
"""

SKILL_PRIORITY = {
    "python": 1,
    "sql": 1,
    "machine learning": 2,
    "nlp": 3,
    "deep learning": 4
}


def generate_learning_path(missing_skills):
    sorted_skills = sorted(
        missing_skills,
        key=lambda s: SKILL_PRIORITY.get(s, 5)
    )

    path = []
    week = 1

    for skill in sorted_skills:
        path.append(f"Week {week}: Learn {skill}")
        week += 1

    return path
