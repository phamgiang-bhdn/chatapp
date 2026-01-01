import api from './axios';

export const chatService = {
  getConversations: async () => {
    const response = await api.get('/api/chat/conversations');
    return response.data;
  },

  createConversation: async (participantIds, type = 'private', name = null) => {
    const response = await api.post('/api/chat/conversations', {
      participantIds,
      type,
      name
    });
    return response.data;
  },

  getMessages: async (conversationId, limit = 50, offset = 0) => {
    const response = await api.get(`/api/chat/conversations/${conversationId}/messages`, {
      params: { limit, offset }
    });
    return response.data;
  },

  sendMessage: async (conversationId, content, type = 'text', fileUrl = null) => {
    const response = await api.post('/api/chat/messages', {
      conversationId,
      content,
      type,
      fileUrl
    });
    return response.data;
  },

  markAsRead: async (conversationId) => {
    const response = await api.put(`/api/chat/conversations/${conversationId}/read`);
    return response.data;
  },

  addMember: async (conversationId, userId) => {
    const response = await api.post(`/api/chat/conversations/${conversationId}/members`, {
      userId
    });
    return response.data;
  },

  removeMember: async (conversationId, userId) => {
    const response = await api.delete(`/api/chat/conversations/${conversationId}/members/${userId}`);
    return response.data;
  },

  updateMemberRole: async (conversationId, userId, role) => {
    const response = await api.put(`/api/chat/conversations/${conversationId}/members/${userId}/role`, {
      role
    });
    return response.data;
  },

  getMembers: async (conversationId) => {
    const response = await api.get(`/api/chat/conversations/${conversationId}/members`);
    return response.data;
  },

  updateGroupInfo: async (conversationId, name, description, avatar, adminOnlyChat) => {
    const response = await api.put(`/api/chat/conversations/${conversationId}/info`, {
      name,
      description,
      avatar,
      adminOnlyChat
    });
    return response.data;
  },

  leaveGroup: async (conversationId) => {
    const response = await api.post(`/api/chat/conversations/${conversationId}/leave`);
    return response.data;
  },

  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/api/chat/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  createThread: async (conversationId, parentMessageId, title) => {
    const response = await api.post(`/api/chat/conversations/${conversationId}/threads`, {
      parentMessageId,
      title
    });
    return response.data;
  },

  getThreads: async (conversationId) => {
    const response = await api.get(`/api/chat/conversations/${conversationId}/threads`);
    return response.data;
  },

  getThreadMessages: async (conversationId, threadId, limit = 50, offset = 0) => {
    const response = await api.get(`/api/chat/conversations/${conversationId}/threads/${threadId}/messages`, {
      params: { limit, offset }
    });
    return response.data;
  },

  pinMessage: async (conversationId, messageId) => {
    const response = await api.post(`/api/chat/conversations/${conversationId}/pin`, {
      messageId
    });
    return response.data;
  },

  unpinMessage: async (conversationId, messageId) => {
    const response = await api.delete(`/api/chat/conversations/${conversationId}/pin/${messageId}`);
    return response.data;
  },

  getPinnedMessages: async (conversationId) => {
    const response = await api.get(`/api/chat/conversations/${conversationId}/pinned`);
    return response.data;
  },

  // Reactions
  addReaction: async (messageId, emoji) => {
    const response = await api.post(`/api/chat/messages/${messageId}/reactions`, { emoji });
    return response.data;
  },

  removeReaction: async (messageId, emoji) => {
    const response = await api.delete(`/api/chat/messages/${messageId}/reactions`, { 
      data: { emoji } 
    });
    return response.data;
  },

  getReactions: async (messageId) => {
    const response = await api.get(`/api/chat/messages/${messageId}/reactions`);
    return response.data;
  },

  // Scheduled Messages
  createScheduledMessage: async (conversationId, content, scheduledAt, type = 'text', fileUrl = null) => {
    const response = await api.post('/api/chat/scheduled-messages', {
      conversationId,
      content,
      type,
      fileUrl,
      scheduledAt
    });
    return response.data;
  },

  getScheduledMessages: async (conversationId = null) => {
    const params = conversationId ? { conversationId } : {};
    const response = await api.get('/api/chat/scheduled-messages', { params });
    return response.data;
  },

  updateScheduledMessage: async (id, content, scheduledAt) => {
    const response = await api.put(`/api/chat/scheduled-messages/${id}`, {
      content,
      scheduledAt
    });
    return response.data;
  },

  cancelScheduledMessage: async (id) => {
    const response = await api.delete(`/api/chat/scheduled-messages/${id}`);
    return response.data;
  }
};
