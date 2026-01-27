// ============================================
// models/Resume.js - Resume Model
// ============================================

import { query, transaction } from '../config/db.js';

export default class Resume {
    /**
     * Create new resume
     */
    static async create(resumeData) {
        const {
            userId,
            originalFilename,
            filePath,
            fileSize,
            mimeType,
        } = resumeData;

        // Get next version number
        const versionResult = await query(
            'SELECT COALESCE(MAX(version), 0) + 1 as next_version FROM resumes WHERE user_id = $1',
            [userId]
        );

        const nextVersion = versionResult.rows[0].next_version;

        const result = await query(
            `INSERT INTO resumes (
        user_id, version, original_filename, file_path, 
        file_size, mime_type, parsing_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
            [userId, nextVersion, originalFilename, filePath, fileSize, mimeType, 'pending']
        );

        return result.rows[0];
    }

    /**
     * Find resume by ID
     */
    static async findById(id) {
        const result = await query(
            'SELECT * FROM resumes WHERE id = $1',
            [id]
        );

        return result.rows[0] || null;
    }

    /**
     * Find active resume for user
     */
    static async findActiveByUserId(userId) {
        const result = await query(
            'SELECT * FROM resumes WHERE user_id = $1 AND is_active = TRUE ORDER BY uploaded_at DESC LIMIT 1',
            [userId]
        );

        return result.rows[0] || null;
    }

    /**
     * Get all resumes for user
     */
    static async findAllByUserId(userId) {
        const result = await query(
            'SELECT * FROM resumes WHERE user_id = $1 ORDER BY version DESC',
            [userId]
        );

        return result.rows;
    }

    /**
     * Update parsing status and data
     */
    static async updateParsing(id, parsedData) {
        const result = await query(
            `UPDATE resumes 
       SET raw_text = $1, 
           parsed_data = $2, 
           parsing_status = $3,
           parsed_at = NOW()
       WHERE id = $4
       RETURNING *`,
            [
                parsedData.rawText,
                JSON.stringify(parsedData.structuredData),
                'completed',
                id,
            ]
        );

        return result.rows[0] || null;
    }

    /**
     * Set parsing error
     */
    static async setParsingError(id, error) {
        await query(
            `UPDATE resumes 
       SET parsing_status = 'failed', parsing_error = $1
       WHERE id = $2`,
            [error, id]
        );
    }

    /**
     * Set as active resume (deactivate others)
     */
    static async setActive(id, userId) {
        return await transaction(async (client) => {
            // Deactivate all resumes for user
            await client.query(
                'UPDATE resumes SET is_active = FALSE WHERE user_id = $1',
                [userId]
            );

            // Activate the selected resume
            const result = await client.query(
                'UPDATE resumes SET is_active = TRUE WHERE id = $1 RETURNING *',
                [id]
            );

            return result.rows[0];
        });
    }

    /**
     * Delete resume
     */
    static async delete(id) {
        await query('DELETE FROM resumes WHERE id = $1', [id]);
    }

    /**
     * Get resume with latest ATS score
     */
    static async findWithLatestScore(resumeId) {
        const result = await query(
            `SELECT 
        r.*,
        a.overall_score,
        a.issues,
        a.scored_at
       FROM resumes r
       LEFT JOIN LATERAL (
         SELECT * FROM ats_scores 
         WHERE resume_id = r.id 
         ORDER BY scored_at DESC 
         LIMIT 1
       ) a ON TRUE
       WHERE r.id = $1`,
            [resumeId]
        );

        return result.rows[0] || null;
    }
}