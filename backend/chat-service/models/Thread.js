const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Conversation = require('./Conversation');
const Message = require('./Message');

const Thread = sequelize.define('Thread', {
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
  parentMessageId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Message,
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'threads'
});

Conversation.hasMany(Thread, { foreignKey: 'conversationId', as: 'threads' });
Thread.belongsTo(Conversation, { foreignKey: 'conversationId' });
Thread.belongsTo(Message, { foreignKey: 'parentMessageId', as: 'parentMessage' });
Message.hasMany(Thread, { foreignKey: 'parentMessageId', as: 'threads' });

module.exports = Thread;
