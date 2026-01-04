const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Conversation = require('./Conversation');

const Message = sequelize.define('Message', {
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
  replyToId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'messages',
      key: 'id'
    }
  },
  threadId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'threads',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'messages'
});

Message.belongsTo(Message, { foreignKey: 'replyToId', as: 'replyTo' });

Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId' });

// Define MessageMention associations after Message is defined to avoid circular dependency
const MessageMention = require('./MessageMention');
Message.hasMany(MessageMention, { foreignKey: 'messageId', as: 'mentions' });
MessageMention.belongsTo(Message, { foreignKey: 'messageId' });

module.exports = Message;
