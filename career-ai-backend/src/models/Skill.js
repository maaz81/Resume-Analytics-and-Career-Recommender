import { query } from '../config/db.js';

export default class Skill {
    static async getUserSkills(userId) {
        const result = await query(
            `SELECT * FROM user_skills WHERE user_id = $1 ORDER BY proficiency_level DESC`,
            [userId]
        );
        return result.rows;
    }

    static async bulkInsertUserSkills(userId, resumeId, skills) {
        if (!skills.length) return [];
        
        // Note: In production, use a proper bulk insert query generation
        // This is a simplified loop for safety
        const inserted = [];
        for (const skill of skills) {
            const result = await query(
                `INSERT INTO user_skills (user_id, resume_id, name, category, proficiency_level, years_of_experience)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 ON CONFLICT (user_id, name) DO UPDATE 
                 SET proficiency_level = EXCLUDED.proficiency_level
                 RETURNING *`,
                [userId, resumeId, skill.name, skill.category, skill.proficiency, skill.years]
            );
            inserted.push(result.rows[0]);
        }
        return inserted;
    }

    static async createSkillGap(data) {
        const {
            userId, resumeId, gapScore, matchPercentage,
            missingSkills, weakSkills, strongSkills,
            immediateActions, learningPriorities, aiModelVersion
        } = data;

        const result = await query(
            `INSERT INTO skill_gaps (
                user_id, resume_id, gap_score, match_percentage,
                missing_skills, weak_skills, strong_skills,
                immediate_actions, learning_priorities, ai_model_version
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *`,
            [
                userId, resumeId, gapScore, matchPercentage,
                JSON.stringify(missingSkills), JSON.stringify(weakSkills), JSON.stringify(strongSkills),
                JSON.stringify(immediateActions), JSON.stringify(learningPriorities), aiModelVersion
            ]
        );
        return result.rows[0];
    }

    static async getLatestGap(userId) {
        const result = await query(
            `SELECT * FROM skill_gaps WHERE user_id = $1 ORDER BY analyzed_at DESC LIMIT 1`,
            [userId]
        );
        return result.rows[0];
    }
}