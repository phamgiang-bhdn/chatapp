const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Conversation = require('./Conversation');

const ScheduledMessage = sequelize.define('ScheduledMessage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  conversationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Conversation,
      key: 'id'
    }
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('text', 'image', 'file', 'location'),
    defaultValue: 'text'
  },
  fileUrl: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  scheduledAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'sent', 'cancelled', 'failed'),
    defaultValue: 'pending'
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'scheduled_messages'
});

Conversation.hasMany(ScheduledMessage, { foreignKey: 'conversationId', as: 'scheduledMessages' });
ScheduledMessage.belongsTo(Conversation, { foreignKey: 'conversationId' });

module.exports = ScheduledMessage;


