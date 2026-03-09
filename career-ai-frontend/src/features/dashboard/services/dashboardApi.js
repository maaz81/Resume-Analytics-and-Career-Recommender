/**
 * Dashboard API Service
 * Makes actual HTTP requests to backend
 * Uses the shared API instance which auto-attaches the Bearer token via interceptor.
 */
import API from '../../auth/services/api';

/**
 * Get Complete Dashboard Data
 * @returns {Promise} - Dashboard data from backend
 */
export const getDashboardDataService = async () => {
    try {
        const response = await API.get('/dashboard');
        return response.data.data; // return only the data object
    } catch (error) {
        console.error('Dashboard API Error:', error);
        if (error.response) {
            throw new Error(error.response.data.message || 'Failed to fetch dashboard data');
        } else if (error.request) {
            throw new Error('No response from server. Check if backend is running.');
        } else {
            throw new Error(error.message || 'Failed to fetch dashboard data');
        }
    }
};

/**
 * Get Quick Stats Only
 * @returns {Promise} - Quick stats from backend
 */
export const getQuickStatsService = async () => {
    try {
        const response = await API.get('/dashboard/stats');
        return response.data.data;
    } catch (error) {
        console.error('Stats API Error:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch stats');
    }
};