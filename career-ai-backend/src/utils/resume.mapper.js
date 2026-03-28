// ============================================
// utils/resume.mapper.js
// ============================================

export const mapAIToATS = (ai) => ({
    overall_score: ai.ats_score ?? 0,
    keyword_score: ai.job_match_score ?? 0, // closest match
    formatting_score: null,   // Python abhi return nahi karta — DB mein NULL rakho
    experience_score: null,   // same
    missing_keywords: ai.missing_skills ?? []
});
export const getGrade = (score) => {
    if (score >= 85) return 'A';
    if (score >= 70) return 'B';
    if (score >= 50) return 'C';
    return 'D';
};

export const formatAnalysisResponse = (resume, score) => {
    const overall = score?.overall_score || 0;

    return {
        resumeId: resume.id,
        fileName: resume.original_filename,
        uploadedAt: resume.uploaded_at,
        version: resume.version,

        atsScore: {
            overall,
            breakdown: {
                keywordMatch: score?.keyword_score || 0,
                skillCoverage: score?.experience_score || 0,
                formattingScore: score?.formatting_score || 0,
                experienceAlignment: score?.experience_score || 0
            },
            grade: getGrade(overall)
        },

        targetRoleComparison: {
            role: score?.target_role || "Not specified",
            matchPercentage: overall,
            strengths: [],
            gaps: score?.missing_keywords || []
        }
    };
};