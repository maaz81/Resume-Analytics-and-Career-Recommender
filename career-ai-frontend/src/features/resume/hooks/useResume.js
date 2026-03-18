// ===== src/features/resume/hooks/useResume.js =====

import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    uploadResumeStart,
    uploadResumeSuccess,
    uploadResumeFailure,
    setAnalysis,
    setATSScore,
    setResumeHistory,
} from '../slices/resumeSlice';
import {
    uploadResumeService,
    getResumeAnalysisService,
    getResumeHistoryService,
    scoreResumeService,
} from '../services/resumeService';

const useResume = () => {
    // ✅ Local state — sirf UI ke liye (non-upload flows)
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // ✅ Redux state
    const dispatch = useDispatch();
    const resume = useSelector((state) => state.resume);

    // ─────────────────────────────────────────
    // Upload Resume
    // ─────────────────────────────────────────
    const uploadResume = useCallback(async (file) => {
        try {
            dispatch(uploadResumeStart()); // ✅ Redux handles loading for upload

            const data = await uploadResumeService(file);
            dispatch(uploadResumeSuccess(data.resume));

            return { success: true, data: data.resume };

        } catch (err) {
            dispatch(uploadResumeFailure(err.message));
            return { success: false, error: err.message };
        }
    }, [dispatch]);

    // ─────────────────────────────────────────
    // Get Resume Analysis
    // ─────────────────────────────────────────
    const getResumeAnalysis = useCallback(async (resumeId) => {
        try {
            setIsLoading(true);
            setError(null);

            const data = await getResumeAnalysisService(resumeId); // ✅ FIX

            dispatch(setAnalysis(data));
            dispatch(setATSScore(data.atsScore));

            return { success: true, data };

        } catch (err) {
            setError(getError(err));
            return { success: false, error: getError(err) };

        } finally {
            setIsLoading(false);
        }
    }, [dispatch]);

    // ─────────────────────────────────────────
    // Score Resume
    // ─────────────────────────────────────────
    const scoreResume = useCallback(async (resumeId, jdText) => {
        try {
            setIsLoading(true);
            setError(null);

            const data = await scoreResumeService(resumeId, jdText);

            return { success: true, data };

        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };

        } finally {
            setIsLoading(false); // ✅
        }
    }, []);

    // ─────────────────────────────────────────
    // Get Resume History
    // ─────────────────────────────────────────
    const getResumeHistory = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const data = await getResumeHistoryService();

            dispatch(setResumeHistory(data.resumes));

            return { success: true, data: data.resumes }; // ✅ FIX

        } catch (err) {
            setError(getError(err));
            return { success: false, error: getError(err) };

        } finally {
            setIsLoading(false);
        }
    }, [dispatch]);

    return {
        // Redux state
        currentResume: resume.currentResume,
        atsScore: resume.atsScore,
        analysis: resume.analysis,
        issues: resume.issues,
        resumeHistory: resume.resumeHistory,

        // ✅ Single source of truth:
        // upload ke liye Redux isLoading, baaki ke liye local
        isLoading: resume.isLoading || isLoading,
        error: resume.error || error,

        // Actions
        uploadResume,
        getResumeAnalysis,
        getResumeHistory,
        scoreResume,
    };
};

export default useResume;