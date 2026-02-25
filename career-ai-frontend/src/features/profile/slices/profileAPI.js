// profileAPI.js
import API from '../../auth/services/api';

export const fetchProfileAPI = async () => {
  const response = await API.get('/auth/me');
  return response.data.data.user;
};

export const updateProfileAPI = async (data) => {
  const response = await API.patch('/auth/profile', data);
  return response.data.data.user;
};