import { query } from '../config/db.js';

export default class AtsScore {
    /**
     * Create new ATS score
     */
    static async create(scoreData) {
        const {
            resumeId, userId, overallScore, formattingScore,
            keywordScore, experienceScore, issues, missingKeywords,
            weakActionVerbs, targetRole, modelVersion
        } = scoreData;

        const result = await query(
            `INSERT INTO ats_scores (
                resume_id, user_id, overall_score, formatting_score,
                keyword_score, experience_score, issues, missing_keywords,
                weak_action_verbs, target_role, ai_model_version
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *`,
            [
                resumeId, userId, overallScore, formattingScore,
                keywordScore, experienceScore, JSON.stringify(issues),
                JSON.stringify(missingKeywords), JSON.stringify(weakActionVerbs), 
                targetRole, modelVersion
            ]
        );

        return result.rows[0];
    }

    /**
     * Find latest score for a user
     */
    static async findLatestByUserId(userId) {
        const result = await query(
            `SELECT * FROM ats_scores 
             WHERE user_id = $1 
             ORDER BY scored_at DESC 
             LIMIT 1`,
            [userId]
        );

        return result.rows[0] || null;
    }

    /**
     * Find latest score for a specific resume
     */
    static async findLatestByResumeId(resumeId, userId) {
        const result = await query(
            `SELECT * FROM ats_scores 
             WHERE resume_id = $1 AND user_id = $2 
             ORDER BY scored_at DESC LIMIT 1`,
            [resumeId, userId]
        );

        return result.rows[0] || null;
    }
}