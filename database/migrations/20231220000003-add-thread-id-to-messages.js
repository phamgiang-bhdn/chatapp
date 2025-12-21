'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('messages');
    
    if (!tableDescription.threadId) {
      await queryInterface.addColumn('messages', 'threadId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'threads',
          key: 'id'
        },
        onDelete: 'SET NULL'
      });

      await queryInterface.addIndex('messages', ['threadId'], {
        name: 'messages_threadId_idx'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('messages', 'messages_threadId_idx');
    
    await queryInterface.removeColumn('messages', 'threadId');
  }
};
