'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_follows', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      followerId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      followingId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'accepted', 'blocked'),
        defaultValue: 'accepted',
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('user_follows', ['followerId', 'followingId'], {
      name: 'unique_follow',
      unique: true
    });
  }, down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_follows');
  }
};
