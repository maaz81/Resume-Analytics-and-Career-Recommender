// ============================================
// controllers/resume.controller.js
// ============================================

import fs from 'fs';
import pdf from 'pdf-parse';

import {
    uploadResumeService,
    getResumeAnalysisService,
    scoreResumeService,
    getResumeHistoryService
} from '../services/resume.service.js';

import { successResponse, createdResponse } from '../utils/response.js';
import { errors, catchAsync } from '../middleware/errorHandler.js';


export const uploadResume = catchAsync(async (req, res) => {
    if (!req.file) throw errors.badRequest('No file uploaded');

    let buffer;
    try {
        buffer = await fs.promises.readFile(req.file.path);
        const pdfData = await pdf(buffer);

        const resume = await uploadResumeService({
            userId: req.user.id,
            file: req.file,
            rawText: pdfData.text
        });

        return createdResponse(res, { resume }, 'Uploaded successfully');

    } finally {
        // ✅ success ho ya error — file hamesha delete hogi
        await fs.promises.unlink(req.file.path).catch(() => { });
    }
});


export const getResumeAnalysis = catchAsync(async (req, res) => {
    const data = await getResumeAnalysisService(req.params.id, req.user.id);
    return successResponse(res, data);
});


export const scoreResume = catchAsync(async (req, res) => {
    const { jdText } = req.body;
    if (!jdText) throw errors.badRequest('Job description required');

    const data = await scoreResumeService(req.params.id, req.user.id, jdText);

    return successResponse(res, { score: data });
});


export const getResumeHistory = catchAsync(async (req, res) => {
    const data = await getResumeHistoryService(req.user.id);
    return successResponse(res, { resumes: data });
});