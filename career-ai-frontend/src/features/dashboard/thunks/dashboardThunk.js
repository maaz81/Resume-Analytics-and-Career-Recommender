/**
 * Dashboard Thunks
 * Redux async actions for dashboard
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getDashboardDataService, getQuickStatsService } from '../services/dashboardApi';

/**
 * Fetch Complete Dashboard Data
 */
export const fetchDashboardData = createAsyncThunk(
    'dashboard/fetchDashboardData',
    async (_, { rejectWithValue }) => {
        try {
            const data = await getDashboardDataService();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Fetch Quick Stats Only
 */
export const fetchQuickStats = createAsyncThunk(
    'dashboard/fetchQuickStats',
    async (_, { rejectWithValue }) => {
        try {
            const data = await getQuickStatsService();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Refresh Dashboard (force reload)
 */
export const refreshDashboard = createAsyncThunk(
    'dashboard/refreshDashboard',
    async (_, { rejectWithValue }) => {
        try {
            const data = await getDashboardDataService();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);