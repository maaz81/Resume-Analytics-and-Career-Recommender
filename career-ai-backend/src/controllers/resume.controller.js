// ============================================
// controllers/resume.controller.js
// ============================================

import fs from 'fs';
import pdf from 'pdf-parse';

import {
    uploadResumeService,
    getResumeAnalysisService,
    scoreResumeService,
    getResumeHistoryService,
    deleteResumeService
} from '../services/resume.service.js';

import { successResponse, createdResponse } from '../utils/response.js';
import { errors, catchAsync } from '../middleware/errorHandler.js';


export const uploadResume = catchAsync(async (req, res) => {
    if (!req.file) throw errors.badRequest('No file uploaded');

    try {
        const buffer = await fs.promises.readFile(req.file.path);
        const pdfData = await pdf(buffer);

        const result = await uploadResumeService({
            userId: req.user.id,
            file: req.file,
            rawText: pdfData.text,
            jdText: req.body.jdText   // optional but recommended
        });

        return createdResponse(res, result, 'Resume analyzed successfully');

    } catch (error) {
        await fs.promises.unlink(req.file.path).catch(() => { });
        throw error;
    }
});


export const getResumeAnalysis = catchAsync(async (req, res) => {
    const data = await getResumeAnalysisService(req.params.id, req.user.id);
    return successResponse(res, data);
});


// ─────────────────────────────────────────────
// SCORE
// Body: { jdText: string, isAuto?: boolean }
//
//   isAuto = false (default) → jdText is a full job description pasted by the user
//   isAuto = true            → jdText is just a role title; backend calls LLM to
//                              generate a full JD before scoring
// ─────────────────────────────────────────────
export const scoreResume = catchAsync(async (req, res) => {
    const { jdText, isAuto = false } = req.body;

    if (!jdText?.trim()) throw errors.badRequest('Job description (or target role title) required');

    const data = await scoreResumeService(
        req.params.id,
        req.user.id,
        jdText,
        Boolean(isAuto)     // coerce in case the client sends "true" as a string
    );

    // data = { score: <ats_scores row>, generatedJD: string | null }
    return successResponse(res, {
        score: data.score,
        generatedJD: data.generatedJD ?? undefined,   // omit key entirely when null
    });
});


export const getResumeHistory = catchAsync(async (req, res) => {
    const data = await getResumeHistoryService(req.user.id);
    return successResponse(res, { resumes: data });
});


export const serveResumeFile = catchAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const { default: Resume } = await import('../models/Resume.js');
    const resume = await Resume.findById(id);

    if (!resume) throw errors.notFound('Resume not found');
    if (resume.user_id !== userId) throw errors.forbidden('Unauthorized');
    if (!resume.file_path) throw errors.notFound('File not available');

    try {
        await fs.promises.access(resume.file_path, fs.constants.R_OK);
    } catch {
        throw errors.notFound('File no longer exists on disk');
    }

    const isDownload = req.query.download === 'true';

    res.setHeader('Content-Type', resume.mime_type || 'application/pdf');
    res.setHeader(
        'Content-Disposition',
        isDownload
            ? `attachment; filename="${resume.original_filename}"`
            : `inline; filename="${resume.original_filename}"`
    );

    fs.createReadStream(resume.file_path).pipe(res);
});


export const deleteResumeController = catchAsync(async (req, res) => {
    await deleteResumeService(req.params.id, req.user.id);
    return successResponse(res, null, 'Resume deleted successfully');
});