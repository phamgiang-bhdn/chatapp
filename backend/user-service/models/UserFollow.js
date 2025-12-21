const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserFollow = sequelize.define('UserFollow', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  followerId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  followingId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'blocked'),
    defaultValue: 'accepted'
  }
}, {
  timestamps: true,
  tableName: 'user_follows',
  validate: {
    followersNotSame() {
      if (this.followerId === this.followingId) {
        throw new Error('User cannot follow themselves');
      }
    }
  }
});

module.exports = UserFollow;
