const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MessageMention = sequelize.define('MessageMention', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  messageId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'messages',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'message_mentions'
});

// Associations will be defined in Message.js to avoid circular dependency

module.exports = MessageMention;

