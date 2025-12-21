const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Conversation = require('./Conversation');

const ConversationParticipant = sequelize.define('ConversationParticipant', {
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
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'member'),
    defaultValue: 'member'
  },
  lastReadAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  leftAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  addedBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'conversation_participants'
});

Conversation.hasMany(ConversationParticipant, { foreignKey: 'conversationId', as: 'participants' });
ConversationParticipant.belongsTo(Conversation, { foreignKey: 'conversationId' });

module.exports = ConversationParticipant;
