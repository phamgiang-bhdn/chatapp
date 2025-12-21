const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Conversation = require('./Conversation');
const Message = require('./Message');

const PinnedMessage = sequelize.define('PinnedMessage', {
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
  messageId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Message,
      key: 'id'
    }
  },
  pinnedBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'pinned_messages'
});

Conversation.hasMany(PinnedMessage, { foreignKey: 'conversationId', as: 'pinnedMessages' });
PinnedMessage.belongsTo(Conversation, { foreignKey: 'conversationId' });
PinnedMessage.belongsTo(Message, { foreignKey: 'messageId', as: 'message' });
Message.hasOne(PinnedMessage, { foreignKey: 'messageId', as: 'pinned' });

module.exports = PinnedMessage;
