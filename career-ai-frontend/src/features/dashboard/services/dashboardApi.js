import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/v1";

export const getDashboardDataService = async () => {
    // Temporary dummy data as requested
    return {
        "profile": {
            "id": 2,
            "email": "john.doe@example.com",
            "full_name": "John Doe",
            "current_role": "postgres",
            "years_of_experience": 4,
            "target_role": "Senior Frontend Developer",
            "industry": null,
            "created_at": "2026-02-20T18:39:27.051Z"
        },
        "resume": {
            "id": 5,
            "version": 5,
            "uploadedAt": "2026-02-27T09:43:07.078Z",
            "parsingStatus": "completed"
        },
        "atsScore": {
            "overall": 58.33,
            "breakdown": {
                "formatting": null,
                "keywords": 55,
                "experience": null
            },
            "topIssues": [],
            "scoredAt": "2026-03-07T19:24:38.123Z"
        },
        "skillGap": null,
        "roadmap": null,
        "stats": {
            "total_resumes": "7",
            "total_ats_scans": "5",
            "total_skill_analyses": "0",
            "total_roadmaps": "0",
            "total_conversations": "0"
        },
        "nextAction": {
            "type": "improve_ats_score",
            "title": "Improve Your ATS Score",
            "description": "Your score is 58.33/100. Fix critical issues to improve.",
            "priority": "high",
            "actionUrl": "/resume/edit"
        }
    };
};