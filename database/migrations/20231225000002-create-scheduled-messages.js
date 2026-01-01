'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('scheduled_messages', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      conversationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'conversations',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      senderId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('text', 'image', 'file', 'location'),
        defaultValue: 'text'
      },
      fileUrl: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      scheduledAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'sent', 'cancelled', 'failed'),
        defaultValue: 'pending'
      },
      sentAt: {
        type: Sequelize.DATE,
        allowNull: true
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

    await queryInterface.addIndex('scheduled_messages', ['conversationId']);
    await queryInterface.addIndex('scheduled_messages', ['senderId']);
    await queryInterface.addIndex('scheduled_messages', ['scheduledAt']);
    await queryInterface.addIndex('scheduled_messages', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('scheduled_messages');
  }
};

