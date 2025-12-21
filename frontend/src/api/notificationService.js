import api from './axios';

export const notificationService = {
  getNotifications: async (limit = 50, offset = 0) => {
    const response = await api.get('/api/chat/notifications', {
      params: { limit, offset }
    });
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await api.put(`/api/chat/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/api/chat/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/api/chat/notifications/${notificationId}`);
    return response.data;
  }
};
