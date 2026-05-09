import axios from 'axios';

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const API = axios.create({
    baseURL: `${BACKEND_URL}/api/v1`,
});

// Attach token automatically
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;