'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('messages');
    
    if (!tableDescription.replyToId) {
      await queryInterface.addColumn('messages', 'replyToId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'messages',
          key: 'id'
        },
        onDelete: 'SET NULL'
      });

      await queryInterface.addIndex('messages', ['replyToId'], {
        name: 'messages_replyToId_idx'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('messages', 'messages_replyToId_idx');
    
    await queryInterface.removeColumn('messages', 'replyToId');
  }
};
