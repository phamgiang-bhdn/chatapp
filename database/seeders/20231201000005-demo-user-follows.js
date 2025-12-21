'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('user_follows', [
      { id: 1, followerId: 1, followingId: 2, status: 'accepted', createdAt: new Date(), updatedAt: new Date() },
      { id: 2, followerId: 1, followingId: 3, status: 'accepted', createdAt: new Date(), updatedAt: new Date() },
      { id: 3, followerId: 1, followingId: 5, status: 'accepted', createdAt: new Date(), updatedAt: new Date() },

      { id: 4, followerId: 2, followingId: 1, status: 'accepted', createdAt: new Date(), updatedAt: new Date() },
      { id: 5, followerId: 2, followingId: 4, status: 'accepted', createdAt: new Date(), updatedAt: new Date() },
      { id: 6, followerId: 2, followingId: 6, status: 'accepted', createdAt: new Date(), updatedAt: new Date() },

      { id: 7, followerId: 3, followingId: 1, status: 'accepted', createdAt: new Date(), updatedAt: new Date() },
      { id: 8, followerId: 3, followingId: 4, status: 'accepted', createdAt: new Date(), updatedAt: new Date() },

      { id: 9, followerId: 4, followingId: 2, status: 'accepted', createdAt: new Date(), updatedAt: new Date() },
      { id: 10, followerId: 4, followingId: 3, status: 'accepted', createdAt: new Date(), updatedAt: new Date() },

      { id: 11, followerId: 5, followingId: 1, status: 'accepted', createdAt: new Date(), updatedAt: new Date() },
      { id: 12, followerId: 5, followingId: 7, status: 'accepted', createdAt: new Date(), updatedAt: new Date() },

      { id: 13, followerId: 6, followingId: 2, status: 'accepted', createdAt: new Date(), updatedAt: new Date() },
      { id: 14, followerId: 6, followingId: 8, status: 'accepted', createdAt: new Date(), updatedAt: new Date() },

      { id: 15, followerId: 7, followingId: 1, status: 'accepted', createdAt: new Date(), updatedAt: new Date() },
      { id: 16, followerId: 7, followingId: 5, status: 'accepted', createdAt: new Date(), updatedAt: new Date() },

      { id: 17, followerId: 8, followingId: 2, status: 'accepted', createdAt: new Date(), updatedAt: new Date() },
      { id: 18, followerId: 8, followingId: 6, status: 'accepted', createdAt: new Date(), updatedAt: new Date() }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('user_follows', null, {});
  }
};
