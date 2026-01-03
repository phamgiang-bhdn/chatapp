'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE messages 
      MODIFY COLUMN type ENUM('text', 'image', 'file', 'location') DEFAULT 'text'
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE messages 
      MODIFY COLUMN type ENUM('text', 'image', 'file') DEFAULT 'text'
    `);
  }
};







