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

    } catch (error) {
        // Only delete file if there was an error processing it
        await fs.promises.unlink(req.file.path).catch(() => { });
        throw error;
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

// controllers/resume.controller.js

export const deleteResumeController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        await deleteResumeService(id, userId);

        res.json({
            success: true,
            message: "Resume deleted successfully"
        });
    } catch (err) {
        next(err);
    }
};