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

    // Check if index already exists before adding
    const [results] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.STATISTICS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'user_follows' 
       AND INDEX_NAME = 'unique_follow'`
    );
    
    if (results[0].count === 0) {
      await queryInterface.addIndex('user_follows', ['followerId', 'followingId'], {
        name: 'unique_follow',
        unique: true
      });
    }
  }, down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_follows');
  }
};
