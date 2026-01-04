'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if column already exists
    const tableDescription = await queryInterface.describeTable('conversations');
    
    if (!tableDescription.adminOnlyChat) {
      await queryInterface.addColumn('conversations', 'adminOnlyChat', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('conversations');
    
    if (tableDescription.adminOnlyChat) {
      await queryInterface.removeColumn('conversations', 'adminOnlyChat');
    }
  }
};

