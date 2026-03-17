// ============================================
// models/User.js - User Model
// ============================================

import { query } from '../config/db.js';
import bcrypt from 'bcryptjs';

export default class User {
    /**
     * Create new user
     */
    static async create(userData) {
        const {
            email,
            password,
            fullName,
            currentRole,
            yearsOfExperience,
            targetRole,
            industry,
            oauthProvider,
            oauthId,
        } = userData;

        // Hash password if provided
        let passwordHash = null;
        if (password) {
            passwordHash = await bcrypt.hash(password, 12);
        }

        const result = await query(
            `INSERT INTO "users" (
        "email", "password_hash", "full_name", "current_role", 
        "years_of_experience", "target_role", "industry",
        "oauth_provider", "oauth_id"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING "id", "email", "full_name", "current_role", "target_role", "created_at"`,
            [
                email,
                passwordHash,
                fullName,
                currentRole || null,
                yearsOfExperience || null,
                targetRole || null,
                industry || null,
                oauthProvider || null,
                oauthId || null,
            ]
        );

        return result.rows[0];
    }

    /**
     * Find user by ID
     */
    static async findById(id) {
        const result = await query(
            `SELECT "id", "email", "full_name", "current_role", "years_of_experience",
              "target_role", "industry", "profile_picture_url", "bio", "location",
              "is_email_verified", "is_active", "last_login_at", "created_at"
       FROM "users" WHERE "id" = $1`,
            [id]
        );

        return result.rows[0] || null;
    }

    /**
     * Find user by email
     */
    static async findByEmail(email) {
        const result = await query(
            `SELECT * FROM "users" WHERE "email" = $1`,
            [email]
        );

        return result.rows[0] || null;
    }

    /**
     * Find user by OAuth credentials
     */
    static async findByOAuth(provider, oauthId) {
        const result = await query(
            `SELECT * FROM "users" WHERE "oauth_provider" = $1 AND "oauth_id" = $2`,
            [provider, oauthId]
        );

        return result.rows[0] || null;
    }

    /**
     * Update user
     */
    static async update(id, updates) {
        const allowedFields = [
            'full_name',
            'current_role',
            'years_of_experience',
            'target_role',
            'industry',
            'profile_picture_url',
            'bio',
            'location',
        ];

        const updateFields = [];
        const values = [];
        let paramIndex = 1;

        Object.keys(updates).forEach((key) => {
            if (allowedFields.includes(key)) {
                updateFields.push(`"${key}" = $${paramIndex}`);
                values.push(updates[key]);
                paramIndex++;
            }
        });

        if (updateFields.length === 0) {
            return null;
        }

        values.push(id);

        const result = await query(
            `UPDATE "users" 
       SET ${updateFields.join(', ')}, "updated_at" = NOW()
       WHERE "id" = $${paramIndex}
       RETURNING "id", "email", "full_name", "current_role", "years_of_experience",
        "target_role", "industry", "profile_picture_url", "bio", "location",
        "is_email_verified", "is_active", "last_login_at", "created_at", "updated_at"`,
            values
        );

        return result.rows[0] || null;
    }

    /**
     * Update last login
     */
    static async updateLastLogin(id) {
        await query(
            'UPDATE "users" SET "last_login_at" = NOW() WHERE "id" = $1',
            [id]
        );
    }

    /**
     * Verify password
     */
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    /**
     * Change password
     */
    static async changePassword(id, newPassword) {
        const passwordHash = await bcrypt.hash(newPassword, 12);

        await query(
            'UPDATE "users" SET "password_hash" = $1, "updated_at" = NOW() WHERE "id" = $2',
            [passwordHash, id]
        );
    }

    /**
     * Delete user (soft delete)
     */
    static async softDelete(id) {
        await query(
            'UPDATE "users" SET "is_active" = FALSE, "updated_at" = NOW() WHERE "id" = $1',
            [id]
        );
    }

    /**
     * Get user stats
     */
    static async getStats(userId) {
        const result = await query(
            `SELECT 
        (SELECT COUNT(*) FROM "resumes" WHERE "user_id" = $1) as resume_count,
        (SELECT COUNT(*) FROM "learning_roadmaps" WHERE "user_id" = $1 AND "status" = 'active') as active_roadmaps,
        (SELECT COUNT(*) FROM "ai_conversations" WHERE "user_id" = $1) as conversation_count
       FROM "users" WHERE "id" = $1`,
            [userId]
        );

        return result.rows[0] || null;
    }

    static async attachOAuth(userId, provider, oauthId) {
        await query(
            `UPDATE "users"
         SET "oauth_provider" = $1,
             "oauth_id" = $2,
             "updated_at" = NOW()
         WHERE "id" = $3`,
            [provider, oauthId, userId]
        );
    }

    static async getPersonalInfo(id) {
        const result = await query(
            `SELECT 
            "full_name",
            "email",
            "target_role",
            "years_of_experience",
            "location"
         FROM "users"
         WHERE "id" = $1`,
            [id]
        );

        return result.rows[0] || null;
    }
}