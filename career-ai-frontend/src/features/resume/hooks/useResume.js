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
    deleteResumeService as deleteResumeApi,
} from '../services/resumeService';

const getError = (err) => err.response?.data?.message || err.message;

const useResume = () => {
    // ✅ Local state — sirf UI ke liye (non-upload flows)
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // ✅ Redux state
    const dispatch = useDispatch();
    const resume = useSelector((state) => state.resume);
    const auth = useSelector((state) => state.auth);

    // ─────────────────────────────────────────
    // Upload Resume
    // ─────────────────────────────────────────
    const uploadResume = useCallback(async (file) => {
        try {
            dispatch(uploadResumeStart()); // ✅ Redux handles loading for upload

            const defaultJd = auth.user?.targetRole || 'Software Engineer';
            const data = await uploadResumeService(file, defaultJd);
            
            dispatch(uploadResumeSuccess(data.resume));

            return { success: true, data: data.resume };

        } catch (err) {
            dispatch(uploadResumeFailure(err.message));
            return { success: false, error: err.message };
        }
    }, [dispatch, auth.user?.targetRole]);

    // ─────────────────────────────────────────
    // Get Resume Analysis
    // ─────────────────────────────────────────
    const getResumeAnalysis = useCallback(async (resumeId) => {
        try {
            setIsLoading(true);
            setError(null);

            const targetId = resumeId || 'latest';
            const data = await getResumeAnalysisService(targetId); // ✅ FIX

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

            const targetId = resumeId || 'latest';
            const data = await scoreResumeService(targetId, jdText);

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

    // ─────────────────────────────────────────
    // Get Resume Issues (MOCK)
    // ─────────────────────────────────────────
    const getResumeIssues = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Mock implementation since there is no backend API for it yet
            await new Promise(r => setTimeout(r, 500));

            const mockData = {
                totalIssues: 0,
                criticalIssues: 0,
                quickFixes: [],
                issues: []
            };

            return { success: true, data: mockData };

        } catch (err) {
            setError(getError(err));
            return { success: false, error: getError(err) };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const deleteResumeService = async (resumeId) => {
        try {
            const data = await deleteResumeApi(resumeId);
            return data; // Returns { success: true, message: ... }
        } catch (err) {
            return { success: false, message: getError(err) };
        }
    };

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
        getResumeIssues,
        deleteResumeService
    };
};

export default useResume;