import {
    loadDashboardStart,
    loadDashboardSuccess,
    loadDashboardFailure,
} from "../slices/dashboardSlice";

import { getDashboardDataService } from "../services/dashboardApi";

export const fetchDashboardData = () => async (dispatch) => {
    try {
        dispatch(loadDashboardStart());

        const data = await getDashboardDataService();

        dispatch(
            loadDashboardSuccess({
                stats: data.stats,
                nextAction: data.nextAction,
                profile: data.profile,
                atsScore: data.atsScore,
                resume: data.resume,
            })
        );
    } catch (error) {
        dispatch(loadDashboardFailure(error.message));
    }
};