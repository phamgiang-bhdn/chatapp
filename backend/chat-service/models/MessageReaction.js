const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Message = require('./Message');

const MessageReaction = sequelize.define('MessageReaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  messageId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Message,
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  emoji: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'message_reactions',
  indexes: [
    {
      unique: true,
      fields: ['messageId', 'userId', 'emoji']
    }
  ]
});

Message.hasMany(MessageReaction, { foreignKey: 'messageId', as: 'reactions' });
MessageReaction.belongsTo(Message, { foreignKey: 'messageId' });

module.exports = MessageReaction;


