'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('message_reactions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      messageId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'messages',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      emoji: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add unique constraint - one reaction per user per message per emoji
    await queryInterface.addIndex('message_reactions', ['messageId', 'userId', 'emoji'], {
      unique: true,
      name: 'unique_user_message_emoji'
    });

    await queryInterface.addIndex('message_reactions', ['messageId']);
    await queryInterface.addIndex('message_reactions', ['userId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('message_reactions');
  }
};

