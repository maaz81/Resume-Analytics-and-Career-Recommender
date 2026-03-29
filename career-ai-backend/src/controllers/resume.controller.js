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


// export const uploadResume = catchAsync(async (req, res) => {
//     if (!req.file) throw errors.badRequest('No file uploaded');

//     let buffer;
//     try {
//         buffer = await fs.promises.readFile(req.file.path);
//         const pdfData = await pdf(buffer);

//         const resume = await uploadResumeService({
//             userId: req.user.id,
//             file: req.file,
//             rawText: pdfData.text
//         });

//         return createdResponse(res, { resume }, 'Uploaded successfully');

//     } catch (error) {
//         // Only delete file if there was an error processing it
//         await fs.promises.unlink(req.file.path).catch(() => { });
//         throw error;
//     }
// });

export const uploadResume = catchAsync(async (req, res) => {
    if (!req.file) throw errors.badRequest('No file uploaded');

    let buffer;
    try {
        buffer = await fs.promises.readFile(req.file.path);
        const pdfData = await pdf(buffer);

        const result = await uploadResumeService({
            userId: req.user.id,
            file: req.file,
            rawText: pdfData.text,
            jdText: req.body.jdText // optional but recommended
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

// Serve resume file (View / Download)
export const serveResumeFile = catchAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    // Import model directly for a lightweight lookup
    const { default: Resume } = await import('../models/Resume.js');
    const resume = await Resume.findById(id);

    if (!resume) throw errors.notFound('Resume not found');
    if (resume.user_id !== userId) throw errors.forbidden('Unauthorized');
    if (!resume.file_path) throw errors.notFound('File not available');

    // Check file exists on disk
    try {
        await fs.promises.access(resume.file_path, fs.constants.R_OK);
    } catch {
        throw errors.notFound('File no longer exists on disk');
    }

    // Determine if download was requested via query param
    const isDownload = req.query.download === 'true';

    res.setHeader('Content-Type', resume.mime_type || 'application/pdf');
    res.setHeader(
        'Content-Disposition',
        isDownload
            ? `attachment; filename="${resume.original_filename}"`
            : `inline; filename="${resume.original_filename}"`
    );

    const fileStream = fs.createReadStream(resume.file_path);
    fileStream.pipe(res);
});

export const deleteResumeController = catchAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    await deleteResumeService(id, userId);

    return successResponse(res, null, 'Resume deleted successfully');
});