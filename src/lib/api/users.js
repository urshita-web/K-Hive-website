import apiClient from './client';

export const usersApi = {
  // Get any user's public profile
  getUserProfile: async (userId) => {
    const { data } = await apiClient.get(`/users/${userId}`);
    return data;
  },
};