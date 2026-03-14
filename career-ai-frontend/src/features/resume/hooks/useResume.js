// src/features/resume/hooks/useResume.js
// import { useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   uploadResumeStart,
//   uploadResumeSuccess,
//   uploadResumeFailure,
//   setATSScore,
//   setAnalysis,
//   setIssues,
// } from '../slices/resumeSlice';
// import {
//   getResumeAnalysisService,
//   getResumeIssuesService,
//   getResumeHistoryService,
//   uploadResumeService,
// } from '../services/resumeService';

// export const useResume = () => {
//   const dispatch = useDispatch();
//   const resume = useSelector((state) => state.resume);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);

//   /**
//    * Upload resume file
//    * @param {File} file
//    */
//   const uploadResume = async (file) => {
//     try {
//       dispatch(uploadResumeStart());
//       const data = await uploadResumeService(file);
//       dispatch(uploadResumeSuccess(data.resume));
//       return { success: true, data };
//     } catch (err) {
//       const message = err.response?.data?.message || err.message;
//       dispatch(uploadResumeFailure(message));
//       return { success: false, error: message };
//     }
//   };

//   /**
//    * Get active resume + ATS score
//    */
//   const getResumeAnalysis = async () => {
//     try {
//       setIsLoading(true);
//       setError(null);
//       const data = await getResumeAnalysisService();
//       dispatch(setAnalysis(data.resume));
//       dispatch(setATSScore(data.resume?.ats_score ?? null));
//       setIsLoading(false);
//       return { success: true, data };
//     } catch (err) {
//       const message = err.response?.data?.message || err.message;
//       setError(message);
//       setIsLoading(false);
//       return { success: false, error: message };
//     }
//   };

//   /**
//    * Score resume against job description
//    * @param {string} resumeId
//    * @param {string} jdText
//    */
//   const getResumeIssues = async (resumeId, jdText) => {
//     try {
//       setIsLoading(true);
//       setError(null);
//       const data = await getResumeIssuesService(resumeId, jdText);
//       dispatch(setIssues(data.analysis));
//       setIsLoading(false);
//       return { success: true, data };
//     } catch (err) {
//       const message = err.response?.data?.message || err.message;
//       setError(message);
//       setIsLoading(false);
//       return { success: false, error: message };
//     }
//   };

//   /**
//    * Get all resume versions
//    */
//   const getResumeHistory = async () => {
//     try {
//       setIsLoading(true);
//       setError(null);
//       const data = await getResumeHistoryService();
//       setIsLoading(false);
//       return { success: true, data };
//     } catch (err) {
//       const message = err.response?.data?.message || err.message;
//       setError(message);
//       setIsLoading(false);
//       return { success: false, error: message };
//     }
//   };

//   return {
//     currentResume: resume.currentResume,
//     atsScore: resume.atsScore,
//     analysis: resume.analysis,
//     issues: resume.issues,
//     isLoading: isLoading || resume.isLoading,
//     error: error || resume.error,

//     uploadResume,
//     getResumeAnalysis,
//     getResumeIssues,
//     getResumeHistory,
//   };
// };
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    uploadResumeStart,
    uploadResumeSuccess,
    uploadResumeFailure,
    setATSScore,
    setAnalysis,
    setIssues,
    setResumeHistory,
} from '../slices/resumeSlice';
import {
    getResumeAnalysisService,
    getCurrentResumeService,
    getResumeIssuesService,
    getResumeHistoryService,
} from '../services/resumeService';

/**
 * useResume Hook
 * Manages resume analysis and issues
 */
export const useResume = () => {
    const dispatch = useDispatch();
    const resume = useSelector((state) => state.resume);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const getCurrentResume = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const data = await getCurrentResumeService();

            dispatch(uploadResumeSuccess(data));

            setIsLoading(false);
            return { success: true, data };

        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            return { success: false, error: err.message };
        }
    };

    /**
     * Get resume analysis
     */
    const getResumeAnalysis = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const data = await getResumeAnalysisService();
            dispatch(setAnalysis(data));
            dispatch(setATSScore(data.atsScore));

            setIsLoading(false);
            return { success: true, data };
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            return { success: false, error: err.message };
        }
    };

    /**
     * Get resume issues
     */
    const getResumeIssues = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const data = await getResumeIssuesService();
            dispatch(setIssues(data.issues));

            setIsLoading(false);
            return { success: true, data };
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            return { success: false, error: err.message };
        }
    };

    /**
     * Get resume history
     */
    const getResumeHistory = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await getResumeHistoryService();
            const resumes = response.data?.resumes || [];
            
            dispatch(setResumeHistory(resumes));

            setIsLoading(false);
            return { success: true, data: { resumes } };
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            return { success: false, error: err.message };
        }
    };

    return {
        // State
        currentResume: resume.currentResume,
        atsScore: resume.atsScore,
        analysis: resume.analysis,
        issues: resume.issues,
        isLoading: isLoading || resume.isLoading,
        error: error || resume.error,

        // Actions
        getResumeAnalysis,
        getResumeIssues,
        getResumeHistory,
        getCurrentResume,
    };
};