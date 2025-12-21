const User = require('../models/User');
const UserFollow = require('../models/UserFollow');
const { Op } = require('sequelize');

exports.getProfile = async (req, res) => {
  try {
    console.log('[USER] Get profile request:', req.user.userId);
    const user = await User.findByPk(req.user.userId);

    if (!user) {
      console.log('[USER] User not found:', req.user.userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('[USER] Profile retrieved:', user.id);
    res.json({ user });
  } catch (error) {
    console.error('[USER] Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, bio, avatar } = req.body;

    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (fullName !== undefined) user.fullName = fullName;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    console.log('[USER] Search users request:', req.query.query);
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const users = await User.findAll({
      where: {
        [Op.or]: [
          { username: { [Op.like]: `%${query}%` } },
          { fullName: { [Op.like]: `%${query}%` } },
          { email: { [Op.like]: `%${query}%` } }
        ]
      },
      limit: 20,
      attributes: ['id', 'username', 'fullName', 'avatar', 'status']
    });

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: ['id', 'username', 'fullName', 'avatar', 'bio', 'status', 'lastSeen']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['online', 'offline', 'away'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = status;
    if (status === 'offline') {
      user.lastSeen = new Date();
    }
    await user.save();

    res.json({ message: 'Status updated successfully', user });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.userId;

    if (followerId === parseInt(userId)) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const userToFollow = await User.findByPk(userId);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingFollow = await UserFollow.findOne({
      where: { followerId, followingId: userId }
    });

    if (existingFollow) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    const follow = await UserFollow.create({
      followerId,
      followingId: userId,
      status: 'accepted'
    });

    res.status(201).json({ message: 'User followed successfully', follow });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.userId;

    const follow = await UserFollow.findOne({
      where: { followerId, followingId: userId }
    });

    if (!follow) {
      return res.status(404).json({ message: 'Not following this user' });
    }

    await follow.destroy();

    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getFollowers = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;

    const followers = await UserFollow.findAll({
      where: { followingId: userId, status: 'accepted' },
      attributes: ['id', 'followerId', 'createdAt']
    });

    const followerIds = followers.map(f => f.followerId);
    const users = await User.findAll({
      where: { id: followerIds },
      attributes: ['id', 'username', 'fullName', 'avatar', 'status']
    });

    res.json({ followers: users, count: users.length });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getFollowing = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;

    const following = await UserFollow.findAll({
      where: { followerId: userId, status: 'accepted' },
      attributes: ['id', 'followingId', 'createdAt']
    });

    const followingIds = following.map(f => f.followingId);
    const users = await User.findAll({
      where: { id: followingIds },
      attributes: ['id', 'username', 'fullName', 'avatar', 'status']
    });

    res.json({ following: users, count: users.length });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.checkFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.userId;

    const follow = await UserFollow.findOne({
      where: { followerId, followingId: userId, status: 'accepted' }
    });

    res.json({ isFollowing: !!follow });
  } catch (error) {
    console.error('Check following error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
