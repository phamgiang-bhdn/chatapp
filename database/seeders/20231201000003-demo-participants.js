'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('conversation_participants', [
      { id: 1, conversationId: 1, userId: 1, role: 'member', lastReadAt: new Date(), joinedAt: new Date(), isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, conversationId: 1, userId: 2, role: 'member', lastReadAt: new Date(), joinedAt: new Date(), isActive: true, createdAt: new Date(), updatedAt: new Date() },

      { id: 3, conversationId: 2, userId: 1, role: 'member', lastReadAt: new Date(), joinedAt: new Date(), isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 4, conversationId: 2, userId: 3, role: 'member', lastReadAt: new Date(Date.now() - 600000), joinedAt: new Date(), isActive: true, createdAt: new Date(), updatedAt: new Date() },

      { id: 5, conversationId: 3, userId: 1, role: 'admin', lastReadAt: new Date(), joinedAt: new Date(), isActive: true, addedBy: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 6, conversationId: 3, userId: 3, role: 'member', lastReadAt: new Date(), joinedAt: new Date(), isActive: true, addedBy: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 7, conversationId: 3, userId: 5, role: 'member', lastReadAt: new Date(), joinedAt: new Date(), isActive: true, addedBy: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 8, conversationId: 3, userId: 7, role: 'member', lastReadAt: new Date(Date.now() - 1800000), joinedAt: new Date(), isActive: true, addedBy: 1, createdAt: new Date(), updatedAt: new Date() },

      { id: 9, conversationId: 4, userId: 2, role: 'admin', lastReadAt: new Date(), joinedAt: new Date(), isActive: true, addedBy: 2, createdAt: new Date(), updatedAt: new Date() },
      { id: 10, conversationId: 4, userId: 4, role: 'member', lastReadAt: new Date(Date.now() - 3600000), joinedAt: new Date(), isActive: true, addedBy: 2, createdAt: new Date(), updatedAt: new Date() },
      { id: 11, conversationId: 4, userId: 6, role: 'member', lastReadAt: new Date(), joinedAt: new Date(), isActive: true, addedBy: 2, createdAt: new Date(), updatedAt: new Date() },
      { id: 12, conversationId: 4, userId: 8, role: 'member', lastReadAt: new Date(Date.now() - 7200000), joinedAt: new Date(), isActive: true, addedBy: 2, createdAt: new Date(), updatedAt: new Date() },

      { id: 13, conversationId: 5, userId: 3, role: 'member', lastReadAt: new Date(Date.now() - 3600000), joinedAt: new Date(), isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 14, conversationId: 5, userId: 4, role: 'member', lastReadAt: new Date(Date.now() - 3600000), joinedAt: new Date(), isActive: true, createdAt: new Date(), updatedAt: new Date() },

      { id: 15, conversationId: 6, userId: 5, role: 'admin', lastReadAt: new Date(Date.now() - 7200000), joinedAt: new Date(), isActive: true, addedBy: 5, createdAt: new Date(), updatedAt: new Date() },
      { id: 16, conversationId: 6, userId: 1, role: 'member', lastReadAt: new Date(Date.now() - 7200000), joinedAt: new Date(), isActive: true, addedBy: 5, createdAt: new Date(), updatedAt: new Date() },
      { id: 17, conversationId: 6, userId: 2, role: 'member', lastReadAt: new Date(Date.now() - 7200000), joinedAt: new Date(), isActive: true, addedBy: 5, createdAt: new Date(), updatedAt: new Date() },
      { id: 18, conversationId: 6, userId: 6, role: 'member', lastReadAt: new Date(Date.now() - 7200000), joinedAt: new Date(), isActive: true, addedBy: 5, createdAt: new Date(), updatedAt: new Date() }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('conversation_participants', null, {});
  }
};
