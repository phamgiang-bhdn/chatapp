import api from './axios';

export const userService = {
  getProfile: async () => {
    const response = await api.get('/api/users/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/api/users/profile', profileData);
    return response.data;
  },

  searchUsers: async (query) => {
    const response = await api.get('/api/users/search', {
      params: { query }
    });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  updateStatus: async (status) => {
    const response = await api.put('/api/users/status', { status });
    return response.data;
  },

  followUser: async (userId) => {
    const response = await api.post(`/api/users/${userId}/follow`);
    return response.data;
  },

  unfollowUser: async (userId) => {
    const response = await api.delete(`/api/users/${userId}/follow`);
    return response.data;
  },

  getFollowers: async (userId) => {
    const response = await api.get(`/api/users/${userId}/followers`);
    return response.data;
  },

  getFollowing: async (userId) => {
    const response = await api.get(`/api/users/${userId}/following`);
    return response.data;
  },

  checkFollowing: async (userId) => {
    const response = await api.get(`/api/users/${userId}/is-following`);
    return response.data;
  }
};
