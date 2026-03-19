// /**
//  * Authentication Service
//  * Handles all auth-related API calls (DUMMY DATA FOR NOW)
//  */

// // Simulated delay for realistic API behavior
// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// // Dummy user database (in-memory for MVP)
// const users = [
//   {
//     id: '1',
//     name: 'John Doe',
//     email: 'john@example.com',
//     password: 'password123', // In production, this would be hashed
//     careerGoal: {
//       targetRole: 'Senior Software Engineer',
//       experience: 'intermediate',
//       targetCompanies: ['Google', 'Microsoft'],
//     },
//     createdAt: new Date('2024-01-15').toISOString(),
//   },
// ];

// // Generate dummy JWT token
// const generateToken = (userId) => {
//   return `dummy_token_${userId}_${Date.now()}`;
// };

// /**
//  * Login Service
//  * @param {string} email - User email
//  * @param {string} password - User password
//  * @returns {Promise} - User data and token
//  */
// export const loginService = async (email, password) => {
//   await delay(1500); // Simulate network delay

//   // Find user by email
//   const user = users.find((u) => u.email === email);

//   if (!user) {
//     throw new Error('User not found. Please check your email.');
//   }

//   if (user.password !== password) {
//     throw new Error('Incorrect password. Please try again.');
//   }

//   // Generate token
//   const token = generateToken(user.id);

//   // Return user data without password
//   const { password: _, ...userWithoutPassword } = user;

//   return {
//     user: userWithoutPassword,
//     token,
//     message: 'Login successful',
//   };
// };

// /**
//  * Signup Service
//  * @param {Object} userData - User registration data
//  * @returns {Promise} - New user data and token
//  */
// export const signupService = async ({ name, email, password }) => {
//   await delay(1500); // Simulate network delay

//   // Check if user already exists
//   const existingUser = users.find((u) => u.email === email);
//   if (existingUser) {
//     throw new Error('An account with this email already exists.');
//   }

//   // Create new user
//   const newUser = {
//     id: `${users.length + 1}`,
//     name,
//     email,
//     password, // In production, hash this
//     careerGoal: null,
//     createdAt: new Date().toISOString(),
//   };

//   // Add to database
//   users.push(newUser);

//   // Generate token
//   const token = generateToken(newUser.id);

//   // Return user data without password
//   const { password: _, ...userWithoutPassword } = newUser;

//   return {
//     user: userWithoutPassword,
//     token,
//     message: 'Account created successfully',
//   };
// };

// /**
//  * OAuth Login Service (Google/GitHub)
//  * @param {string} provider - OAuth provider (google/github)
//  * @returns {Promise} - User data and token
//  */
// export const oauthLoginService = async (provider) => {
//   await delay(1500); // Simulate OAuth flow

//   // Simulate OAuth user data
//   const oauthUser = {
//     id: `oauth_${Date.now()}`,
//     name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
//     email: `user@${provider}.com`,
//     careerGoal: null,
//     createdAt: new Date().toISOString(),
//   };

//   // Check if user exists
//   let user = users.find((u) => u.email === oauthUser.email);

//   if (!user) {
//     // Create new user
//     users.push({ ...oauthUser, password: 'oauth_no_password' });
//     user = oauthUser;
//   }

//   // Generate token
//   const token = generateToken(user.id);

//   return {
//     user,
//     token,
//     message: `Logged in with ${provider}`,
//   };
// };

// /**
//  * Validate Token Service
//  * @param {string} token - JWT token
//  * @returns {Promise} - User data
//  */
// export const validateTokenService = async (token) => {
//   await delay(500);

//   // Extract user ID from token (simplified)
//   const userId = token.split('_')[2];
//   const user = users.find((u) => u.id === userId);

//   if (!user) {
//     throw new Error('Invalid token');
//   }

//   const { password: _, ...userWithoutPassword } = user;
//   return userWithoutPassword;
// };

// /**
//  * Logout Service
//  * @returns {Promise} - Success message
//  */
// export const logoutService = async () => {
//   await delay(300);
//   return { message: 'Logged out successfully' };
// };

import API from './api';

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
  // Redirect to backend OAuth route
  window.location.href = `http://localhost:5000/api/v1/auth/${provider}`;
};

// LOGOUT
export const logoutService = async () => {
  await API.post('/auth/logout');
};