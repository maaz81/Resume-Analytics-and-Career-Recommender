// ============================================
// services/resume.service.js
// ============================================

import crypto from 'crypto';
import Resume from '../models/Resume.js';
import { errors } from '../middleware/errorHandler.js';
import { query } from '../config/db.js';
import { analyzeResume } from './ai.service.js';
import { mapAIToATS, formatAnalysisResponse } from '../utils/resume.mapper.js';

export const uploadResumeService = async ({ userId, file, rawText }) => {
    const resume = await Resume.create({
        userId,
        originalFilename: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        rawText
    });

    return resume;
};


export const getResumeAnalysisService = async (resumeId, userId) => {
    let resume;
    if (resumeId === 'latest') {
        resume = await Resume.findActiveByUserId(userId);
        if (!resume) {
            const allResumes = await Resume.findAllByUserId(userId);
            if (allResumes.length > 0) resume = allResumes[0];
        }
    } else {
        resume = await Resume.findById(resumeId);
    }

    if (!resume) throw errors.notFound('Resume not found');
    if (resume.user_id !== userId) throw errors.forbidden('Unauthorized');

    // Use the actual resolved ID for all subsequent queries
    resumeId = resume.id;

    const scoreResult = await query(
        `SELECT * FROM ats_scores 
         WHERE resume_id = $1 
         ORDER BY scored_at DESC 
         LIMIT 1`,
        [resumeId]
    );

    const score = scoreResult.rows[0];

    return formatAnalysisResponse(resume, score);
};



export const scoreResumeService = async (resumeId, userId, jdText) => {
    let resume;
    if (resumeId === 'latest') {
        resume = await Resume.findActiveByUserId(userId);
        if (!resume) {
            const allResumes = await Resume.findAllByUserId(userId);
            if (allResumes.length > 0) resume = allResumes[0];
        }
    } else {
        resume = await Resume.findById(resumeId);
    }

    if (!resume) throw errors.notFound('Resume not found');
    if (resume.user_id !== userId) throw errors.forbidden('Unauthorized');

    // Use the actual resolved ID for all subsequent queries
    resumeId = resume.id;

    // ✅ JD ka hash banao
    const jdHash = crypto.createHash('sha256').update(jdText.trim()).digest('hex');

    // ✅ Sirf same JD ke liye duplicate check karo
    const existing = await query(
        `SELECT * FROM ats_scores 
         WHERE resume_id = $1 AND jd_hash = $2
         ORDER BY scored_at DESC 
         LIMIT 1`,
        [resumeId, jdHash]
    );

    if (existing.rows.length) {
        return existing.rows[0]; // same JD hai toh cache return karo
    }

    const aiResult = await analyzeResume(resume.raw_text, jdText);
    const mapped = mapAIToATS(aiResult);

    const result = await query(
        `INSERT INTO ats_scores 
        (resume_id, user_id, overall_score, keyword_score, formatting_score, 
         experience_score, missing_keywords, target_role, jd_hash)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING *`,
        [
            resumeId,
            userId,
            mapped.overall_score,
            mapped.keyword_score,
            mapped.formatting_score,
            mapped.experience_score,
            JSON.stringify(mapped.missing_keywords),
            aiResult.target_role || null,
            jdHash  // ✅ save karo
        ]
    );

    return result.rows[0];
};


export const getResumeHistoryService = async (userId) => {
    const result = await query(
        `SELECT r.id, r.version, r.original_filename, r.uploaded_at,
                r.is_active,
                a.overall_score
         FROM resumes r
         LEFT JOIN LATERAL (
             SELECT overall_score
             FROM ats_scores
             WHERE resume_id = r.id
             ORDER BY scored_at DESC
             LIMIT 1
         ) a ON TRUE
         WHERE r.user_id = $1
         ORDER BY r.version DESC`,
        [userId]
    );

    return result.rows.map(r => ({
        id: r.id,
        version: r.version,
        fileName: r.original_filename,
        uploadedAt: r.uploaded_at,
        atsScore: r.overall_score,
        status: r.is_active ? "current" : "archived"
    }));
};