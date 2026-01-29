// ============================================
// models/AuditLog.js - Audit Log Model
// ============================================

import { query } from '../config/db.js';

export default class AuditLog {
    /**
     * Create new audit log entry
     * @param {Object} logData - The audit log data
     * @param {string} logData.userId - ID of the user performing the action
     * @param {string} logData.action - Action performed
     * @param {string} [logData.entityType] - Type of entity affected
     * @param {string} [logData.entityId] - ID of entity affected
     * @param {Object} [logData.metadata] - Additional metadata
     * @param {string} [logData.ipAddress] - IP address of the request
     * @param {string} [logData.userAgent] - User agent of the request
     */
    static async create(logData) {
        const {
            userId,
            action,
            entityType,
            entityId,
            metadata,
            ipAddress,
            userAgent
        } = logData;

        try {
            const result = await query(
                `INSERT INTO audit_logs (
                    user_id, 
                    action, 
                    entity_type, 
                    entity_id, 
                    metadata, 
                    ip_address, 
                    user_agent
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id, created_at`,
                [
                    userId,
                    action,
                    entityType || null,
                    entityId || null,
                    metadata || null,
                    ipAddress || null,
                    userAgent || null
                ]
            );

            return result.rows[0];
        } catch (error) {
            // We don't want audit logging to break the main flow, so we catch errors
            // but we might want to log them to a file or stdout
            console.error('Failed to create audit log:', error.message);
            return null;
        }
    }

    /**
     * Get audit logs for a user
     */
    static async getByUserId(userId, limit = 50, offset = 0) {
        const result = await query(
            `SELECT * FROM audit_logs 
            WHERE user_id = $1 
            ORDER BY created_at DESC 
            LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        return result.rows;
    }
}
