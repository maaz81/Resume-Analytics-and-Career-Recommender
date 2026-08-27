import API from './api';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// LOGIN
export const loginService = async (email, password) => {
  const response = await API.post('/auth/login', {
    email,
    password,
  });

  return {
    user: response.data.data.user,
    token: response.data.data.accessToken,
  };
};

// SIGNUP
export const signupService = async (userData) => {
  const response = await API.post('/auth/register', {
    ...userData,
    fullName: userData.name,
  });

  return {
    user: response.data.data.user,
    token: response.data.data.accessToken,
  };
};

// OAUTH LOGIN
export const oauthLoginService = async (provider) => {
  // Redirect to backend OAuth route (uses VITE_API_URL env variable in production)
  window.location.href = `${BACKEND_URL}/api/v1/auth/${provider}`;
};

// LOGOUT
export const logoutService = async () => {
  await API.post('/auth/logout');
};

// FORGOT PASSWORD
export const forgotPasswordService = async (email) => {
  const response = await API.post('/auth/forgot-password', {
    email,
  });

  return response.data;
};

// RESET PASSWORD
export const resetPasswordService = async (token, newPassword) => {
  const response = await API.post('/auth/reset-password', {
    token,
    newPassword,
  });

  return response.data;
};