// ============================================
// models/Skill.js - Skills Management
// ============================================

import { query, transaction } from '../config/db.js';

export default class Skill {
  /**
   * Create new skill
   */
  static async create(skillData) {
    const { name, category, aliases, description } = skillData;

    const result = await query(
      `INSERT INTO skills (name, category, aliases, description)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (name) DO NOTHING
       RETURNING *`,
      [name, category, aliases || [], description]
    );

    return result.rows[0] || null;
  }

  /**
   * Find skill by name (case-insensitive)
   */
  static async findByName(name) {
    const result = await query(
      `SELECT * FROM skills WHERE LOWER(name) = LOWER($1)`,
      [name]
    );

    return result.rows[0] || null;
  }

  /**
   * Find skill by ID
   */
  static async findById(id) {
    const result = await query(`SELECT * FROM skills WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  /**
   * Search skills by name or alias
   */
  static async search(searchTerm, limit = 10) {
    const result = await query(
      `SELECT * FROM skills 
       WHERE LOWER(name) LIKE LOWER($1)
          OR $2 = ANY(aliases)
       ORDER BY popularity_score DESC
       LIMIT $3`,
      [`%${searchTerm}%`, searchTerm.toLowerCase(), limit]
    );

    return result.rows;
  }

  /**
   * Get skills by category
   */
  static async findByCategory(category) {
    const result = await query(
      `SELECT * FROM skills WHERE category = $1 ORDER BY popularity_score DESC`,
      [category]
    );

    return result.rows;
  }

  /**
   * Get all skills
   */
  static async findAll(limit = 100) {
    const result = await query(
      `SELECT * FROM skills ORDER BY popularity_score DESC LIMIT $1`,
      [limit]
    );

    return result.rows;
  }

  /**
   * Add user skill
   */
  static async addUserSkill(userSkillData) {
    const {
      userId,
      skillId,
      resumeId,
      proficiencyLevel,
      yearsOfExperience,
      source,
      confidenceScore,
      contextSnippets,
    } = userSkillData;

    const result = await query(
      `INSERT INTO user_skills (
        user_id, skill_id, resume_id, proficiency_level,
        years_of_experience, source, confidence_score, context_snippets
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (user_id, skill_id) 
      DO UPDATE SET 
        proficiency_level = EXCLUDED.proficiency_level,
        years_of_experience = EXCLUDED.years_of_experience,
        confidence_score = EXCLUDED.confidence_score,
        context_snippets = EXCLUDED.context_snippets,
        extracted_at = NOW()
      RETURNING *`,
      [
        userId,
        skillId,
        resumeId || null,
        proficiencyLevel || 'intermediate',
        yearsOfExperience || null,
        source || 'resume',
        confidenceScore || null,
        contextSnippets || [],
      ]
    );

    return result.rows[0];
  }

  /**
   * Get user skills
   */
  static async getUserSkills(userId) {
    const result = await query(
      `SELECT us.*, s.name, s.category 
       FROM user_skills us
       JOIN skills s ON us.skill_id = s.id
       WHERE us.user_id = $1
       ORDER BY us.extracted_at DESC`,
      [userId]
    );

    return result.rows;
  }

  /**
   * Bulk insert user skills from resume parsing
   */
  static async bulkInsertUserSkills(userId, resumeId, skills) {
    return await transaction(async (client) => {
      const inserted = [];

      for (const skillData of skills) {
        // Find or create skill
        let skill = await this.findByName(skillData.name);

        if (!skill) {
          const skillResult = await client.query(
            `INSERT INTO skills (name, category) 
             VALUES ($1, $2) 
             ON CONFLICT (name) DO NOTHING
             RETURNING *`,
            [skillData.name, skillData.category || 'technical']
          );
          skill = skillResult.rows[0];
        }

        if (!skill) {
          // If still null, it was a conflict, fetch it
          const fetchResult = await client.query(
            `SELECT * FROM skills WHERE LOWER(name) = LOWER($1)`,
            [skillData.name]
          );
          skill = fetchResult.rows[0];
        }

        // Insert user skill
        const userSkillResult = await client.query(
          `INSERT INTO user_skills (
            user_id, skill_id, resume_id, proficiency_level,
            years_of_experience, source, confidence_score
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (user_id, skill_id) 
          DO UPDATE SET 
            proficiency_level = EXCLUDED.proficiency_level,
            years_of_experience = EXCLUDED.years_of_experience,
            extracted_at = NOW()
          RETURNING *`,
          [
            userId,
            skill.id,
            resumeId,
            skillData.proficiency || 'intermediate',
            skillData.years || null,
            'resume',
            skillData.confidence || 0.9,
          ]
        );

        inserted.push(userSkillResult.rows[0]);
      }

      return inserted;
    });
  }

  /**
   * Create skill gap analysis
   */
  static async createSkillGap(gapData) {
    const {
      userId,
      targetRoleId,
      resumeId,
      missingSkills,
      weakSkills,
      strongSkills,
      gapScore,
      matchPercentage,
      immediateActions,
      learningPriorities,
      aiModelVersion,
    } = gapData;

    const result = await query(
      `INSERT INTO skill_gaps (
        user_id, target_role_id, resume_id, missing_skills,
        weak_skills, strong_skills, gap_score, match_percentage,
        immediate_actions, learning_priorities, ai_model_version
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        userId,
        targetRoleId || null,
        resumeId || null,
        JSON.stringify(missingSkills),
        JSON.stringify(weakSkills),
        JSON.stringify(strongSkills),
        gapScore,
        matchPercentage,
        JSON.stringify(immediateActions),
        learningPriorities,
        aiModelVersion || 'v1.0',
      ]
    );

    return result.rows[0];
  }

  /**
   * Get latest skill gap for user
   */
  static async getLatestSkillGap(userId) {
    const result = await query(
      `SELECT * FROM skill_gaps 
       WHERE user_id = $1 
       ORDER BY analyzed_at DESC 
       LIMIT 1`,
      [userId]
    );

    return result.rows[0] || null;
  }

  /**
   * Get all skill gaps for user (history)
   */
  static async getUserSkillGaps(userId) {
    const result = await query(
      `SELECT * FROM skill_gaps 
       WHERE user_id = $1 
       ORDER BY analyzed_at DESC`,
      [userId]
    );

    return result.rows;
  }
}