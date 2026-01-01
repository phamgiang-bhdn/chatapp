const Conversation = require('../models/Conversation');
const ConversationParticipant = require('../models/ConversationParticipant');
const Message = require('../models/Message');
const Thread = require('../models/Thread');
const PinnedMessage = require('../models/PinnedMessage');
const MessageReaction = require('../models/MessageReaction');
const { Op } = require('sequelize');
const ioInstance = require('../socket/ioInstance');
const { SOCKET_EVENTS } = require('../constants/socketEvents');
const axios = require('axios');
const { getMessageReactions } = require('./reactionController');

exports.getConversations = async (req, res) => {
  try {
    console.log('[CHAT] Get conversations request:', req.user.userId);
    const userId = req.user.userId;

    const participants = await ConversationParticipant.findAll({
      where: {
        userId,
        isActive: true
      },
      include: [{
        model: Conversation,
        include: [{
          model: ConversationParticipant,
          as: 'participants',
          where: { isActive: true }
        }]
      }],
      order: [[Conversation, 'lastMessageAt', 'DESC']]
    });

    const conversationsWithUnread = await Promise.all(
      participants.map(async (p) => {
        const conversation = p.Conversation;
        const lastReadAt = p.lastReadAt;
        
        const unreadCount = await Message.count({
          where: {
            conversationId: conversation.id,
            senderId: { [Op.ne]: userId },
            ...(lastReadAt ? {
              createdAt: { [Op.gt]: lastReadAt }
            } : {})
          }
        });

        const conversationData = conversation.toJSON();
        conversationData.unreadCount = unreadCount;
        
        return conversationData;
      })
    );

    res.json({ conversations: conversationsWithUnread });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createConversation = async (req, res) => {
  try {
    console.log('[CHAT] Create conversation request:', { type: req.body.type, userId: req.user.userId });
    const { participantIds, type, name, description, avatar } = req.body;
    const userId = req.user.userId;

    if (type === 'group') {
      if (!name) {
        return res.status(400).json({ message: 'Group name is required' });
      }
      if (!participantIds || participantIds.length < 1) {
        return res.status(400).json({ message: 'At least 2 members required for group chat' });
      }
    }

    const allParticipants = [...new Set([userId, ...(participantIds || [])])];

    if (type === 'private' && allParticipants.length === 2) {
      const existingConversations = await ConversationParticipant.findAll({
        where: { userId: allParticipants[0], isActive: true },
        include: [{
          model: Conversation,
          where: { type: 'private' },
          include: [{
            model: ConversationParticipant,
            as: 'participants',
            where: { isActive: true }
          }]
        }]
      });

      for (let participant of existingConversations) {
        const conv = participant.Conversation;
        const participantUserIds = conv.participants.map(p => p.userId);

        if (participantUserIds.length === 2 &&
          participantUserIds.includes(allParticipants[0]) &&
          participantUserIds.includes(allParticipants[1])) {
          return res.json({ conversation: conv });
        }
      }
    }

    const conversation = await Conversation.create({
      type,
      name,
      description,
      avatar,
      createdBy: userId
    });

    const participantPromises = allParticipants.map((pId, index) =>
      ConversationParticipant.create({
        conversationId: conversation.id,
        userId: pId,
        role: pId === userId ? 'admin' : 'member',
        addedBy: userId,
        isActive: true
      })
    );

    await Promise.all(participantPromises);

    const fullConversation = await Conversation.findByPk(conversation.id, {
      include: [{
        model: ConversationParticipant,
        as: 'participants',
        where: { isActive: true }
      }]
    });

    res.status(201).json({ conversation: fullConversation });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const userId = req.user.userId;

    const participant = await ConversationParticipant.findOne({
      where: { conversationId, userId }
    });

    if (!participant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.findAll({
      where: { 
        conversationId,
        threadId: null
      },
      include: [{
        model: Message,
        as: 'replyTo',
        required: false,
        attributes: ['id', 'content', 'type', 'senderId']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const messagesWithSenders = await Promise.all(messages.map(async (message) => {
      const messageData = message.toJSON();
      if (messageData.replyTo) {
        messageData.replyTo = message.replyTo ? message.replyTo.toJSON() : null;
      }
      try {
        const userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:3003';
        const response = await axios.get(`${userServiceUrl}/api/users/${message.senderId}`, {
          headers: {
            'Authorization': req.headers.authorization || ''
          }
        });
        messageData.sender = response.data.user;
      } catch (error) {
        console.error(`Failed to load sender ${message.senderId}:`, error);
        messageData.sender = { id: message.senderId, username: 'Unknown', fullName: 'Unknown User' };
      }
      
      // Get reactions for this message
      messageData.reactions = await getMessageReactions(message.id);
      
      return messageData;
    }));

    res.json({ messages: messagesWithSenders.reverse() });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, content, type, fileUrl, replyToId } = req.body;
    const userId = req.user.userId;

    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const participant = await ConversationParticipant.findOne({
      where: { conversationId, userId, isActive: true }
    });

    if (!participant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (conversation.type === 'group' && conversation.adminOnlyChat && participant.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin mới có quyền gửi tin nhắn trong nhóm này' });
    }

    if (replyToId) {
      const replyToMessage = await Message.findOne({
        where: { id: replyToId, conversationId }
      });
      if (!replyToMessage) {
        return res.status(400).json({ message: 'Reply message not found in this conversation' });
      }
    }

    const message = await Message.create({
      conversationId,
      senderId: userId,
      content,
      type: type || 'text',
      fileUrl,
      replyToId: replyToId || null
    });

    await Conversation.update(
      { lastMessageAt: new Date() },
      { where: { id: conversationId } }
    );

    res.status(201).json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    await ConversationParticipant.update(
      { lastReadAt: new Date() },
      { where: { conversationId, userId } }
    );

    const io = ioInstance.getIO();
    if (io) {
      io.to(`conversation_${conversationId}`).emit(SOCKET_EVENTS.MESSAGES_READ, {
        userId,
        conversationId
      });
    }

    res.json({ message: 'Marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId: newUserId } = req.body;
    const userId = req.user.userId;

    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (conversation.type !== 'group') {
      return res.status(400).json({ message: 'Can only add members to group conversations' });
    }

    const currentUserParticipant = await ConversationParticipant.findOne({
      where: { conversationId, userId, isActive: true }
    });

    if (!currentUserParticipant || currentUserParticipant.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can add members' });
    }

    const existingParticipant = await ConversationParticipant.findOne({
      where: { conversationId, userId: newUserId }
    });

    if (existingParticipant && existingParticipant.isActive) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    if (existingParticipant) {
      existingParticipant.isActive = true;
      existingParticipant.leftAt = null;
      existingParticipant.joinedAt = new Date();
      existingParticipant.addedBy = userId;
      await existingParticipant.save();
    } else {
      await ConversationParticipant.create({
        conversationId,
        userId: newUserId,
        role: 'member',
        addedBy: userId,
        isActive: true
      });
    }

    res.json({ message: 'Member added successfully' });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { conversationId, userId: memberUserId } = req.params;
    const userId = req.user.userId;

    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (conversation.type !== 'group') {
      return res.status(400).json({ message: 'Can only remove members from group conversations' });
    }

    const currentUserParticipant = await ConversationParticipant.findOne({
      where: { conversationId, userId, isActive: true }
    });

    const isSelfLeaving = userId === parseInt(memberUserId);
    const isAdmin = currentUserParticipant && currentUserParticipant.role === 'admin';

    if (!isSelfLeaving && !isAdmin) {
      return res.status(403).json({ message: 'Only admins can remove members' });
    }

    const memberParticipant = await ConversationParticipant.findOne({
      where: { conversationId, userId: memberUserId, isActive: true }
    });

    if (!memberParticipant) {
      return res.status(404).json({ message: 'Member not found in conversation' });
    }

    memberParticipant.isActive = false;
    memberParticipant.leftAt = new Date();
    await memberParticipant.save();

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateMemberRole = async (req, res) => {
  try {
    const { conversationId, userId: memberUserId } = req.params;
    const { role } = req.body;
    const userId = req.user.userId;

    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const currentUserParticipant = await ConversationParticipant.findOne({
      where: { conversationId, userId, isActive: true }
    });

    if (!currentUserParticipant || currentUserParticipant.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update member roles' });
    }

    const memberParticipant = await ConversationParticipant.findOne({
      where: { conversationId, userId: memberUserId, isActive: true }
    });

    if (!memberParticipant) {
      return res.status(404).json({ message: 'Member not found in conversation' });
    }

    memberParticipant.role = role;
    await memberParticipant.save();

    res.json({ message: 'Member role updated successfully', participant: memberParticipant });
  } catch (error) {
    console.error('Update member role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMembers = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    const participant = await ConversationParticipant.findOne({
      where: { conversationId, userId, isActive: true }
    });

    if (!participant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const members = await ConversationParticipant.findAll({
      where: { conversationId, isActive: true },
      attributes: ['id', 'userId', 'role', 'joinedAt', 'addedBy']
    });

    res.json({ members });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateGroupInfo = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { name, description, avatar } = req.body;
    const userId = req.user.userId;

    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (conversation.type !== 'group') {
      return res.status(400).json({ message: 'Can only update group conversations' });
    }

    const participant = await ConversationParticipant.findOne({
      where: { conversationId, userId, isActive: true }
    });

    if (!participant || participant.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update group info' });
    }

    if (name !== undefined) conversation.name = name;
    if (description !== undefined) conversation.description = description;
    if (avatar !== undefined) conversation.avatar = avatar;
    if (req.body.adminOnlyChat !== undefined) conversation.adminOnlyChat = req.body.adminOnlyChat;

    await conversation.save();

    res.json({ message: 'Group info updated successfully', conversation });
  } catch (error) {
    console.error('Update group info error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.leaveGroup = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (conversation.type !== 'group') {
      return res.status(400).json({ message: 'Can only leave group conversations' });
    }

    const participant = await ConversationParticipant.findOne({
      where: { conversationId, userId, isActive: true }
    });

    if (!participant) {
      return res.status(404).json({ message: 'Not a member of this group' });
    }

    participant.isActive = false;
    participant.leftAt = new Date();
    await participant.save();

    if (participant.role === 'admin') {
      const otherAdmins = await ConversationParticipant.findAll({
        where: {
          conversationId,
          isActive: true,
          role: 'admin',
          userId: { [Op.ne]: userId }
        }
      });

      if (otherAdmins.length === 0) {
        const firstMember = await ConversationParticipant.findOne({
          where: { conversationId, isActive: true },
          order: [['joinedAt', 'ASC']]
        });

        if (firstMember) {
          firstMember.role = 'admin';
          await firstMember.save();
        }
      }
    }

    res.json({ message: 'Left group successfully' });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createThread = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { parentMessageId, title } = req.body;
    const userId = req.user.userId;

    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (conversation.type !== 'group') {
      return res.status(400).json({ message: 'Threads can only be created in group conversations' });
    }

    const participant = await ConversationParticipant.findOne({
      where: { conversationId, userId, isActive: true }
    });

    if (!participant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const parentMessage = await Message.findOne({
      where: { id: parentMessageId, conversationId }
    });

    if (!parentMessage) {
      return res.status(404).json({ message: 'Parent message not found' });
    }

    const thread = await Thread.create({
      conversationId,
      parentMessageId,
      title: title || null,
      createdBy: userId
    });

    await thread.reload({
      include: [{
        model: Message,
        as: 'parentMessage',
        required: false,
        attributes: ['id', 'content', 'type', 'senderId', 'createdAt']
      }]
    });

    const threadData = thread.toJSON();
    threadData.unreadCount = 0;

    const io = ioInstance.getIO();
    if (io) {
      io.to(`conversation_${conversationId}`).emit(SOCKET_EVENTS.THREAD_CREATED, {
        thread: threadData
      });
    }

    res.status(201).json({ thread: threadData });
  } catch (error) {
    console.error('Create thread error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getThreads = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    const participant = await ConversationParticipant.findOne({
      where: { conversationId, userId, isActive: true }
    });

    if (!participant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const threads = await Thread.findAll({
      where: { conversationId },
      include: [{
        model: Message,
        as: 'parentMessage',
        required: false,
        attributes: ['id', 'content', 'type', 'senderId', 'createdAt']
      }],
      order: [['createdAt', 'DESC']]
    });

    const threadsWithUnread = await Promise.all(threads.map(async (thread) => {
      const threadData = thread.toJSON();
      
      const participant = await ConversationParticipant.findOne({
        where: { conversationId, userId, isActive: true }
      });
      
      const lastReadAt = participant?.lastReadAt || new Date(0);
      
      const unreadCount = await Message.count({
        where: {
          threadId: thread.id,
          senderId: { [Op.ne]: userId },
          createdAt: { [Op.gt]: lastReadAt }
        }
      });
      
      threadData.unreadCount = unreadCount;
      return threadData;
    }));

    res.json({ threads: threadsWithUnread });
  } catch (error) {
    console.error('Get threads error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getThreadMessages = async (req, res) => {
  try {
    const { conversationId, threadId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const userId = req.user.userId;

    const participant = await ConversationParticipant.findOne({
      where: { conversationId, userId, isActive: true }
    });

    if (!participant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const thread = await Thread.findOne({
      where: { id: threadId, conversationId }
    });

    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    const messages = await Message.findAll({
      where: { threadId },
      include: [{
        model: Message,
        as: 'replyTo',
        required: false,
        attributes: ['id', 'content', 'type', 'senderId']
      }],
      order: [['createdAt', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const messagesWithSenders = await Promise.all(messages.map(async (message) => {
      const messageData = message.toJSON();
      if (messageData.replyTo) {
        messageData.replyTo = message.replyTo ? message.replyTo.toJSON() : null;
      }
      try {
        const userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:3003';
        const response = await axios.get(`${userServiceUrl}/api/users/${message.senderId}`, {
          headers: {
            'Authorization': req.headers.authorization || ''
          }
        });
        messageData.sender = response.data.user;
      } catch (error) {
        console.error(`Failed to load sender ${message.senderId}:`, error);
        messageData.sender = { id: message.senderId, username: 'Unknown', fullName: 'Unknown User' };
      }
      return messageData;
    }));

    if (thread.parentMessageId) {
      const parentMessage = await Message.findByPk(thread.parentMessageId, {
        include: [{
          model: Message,
          as: 'replyTo',
          required: false,
          attributes: ['id', 'content', 'type', 'senderId']
        }]
      });

      if (parentMessage) {
        const parentMessageData = parentMessage.toJSON();
        if (parentMessageData.replyTo) {
          parentMessageData.replyTo = parentMessage.replyTo ? parentMessage.replyTo.toJSON() : null;
        }
        try {
          const userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:3003';
          const response = await axios.get(`${userServiceUrl}/api/users/${parentMessage.senderId}`, {
            headers: {
              'Authorization': req.headers.authorization || ''
            }
          });
          parentMessageData.sender = response.data.user;
        } catch (error) {
          console.error(`Failed to load sender ${parentMessage.senderId}:`, error);
          parentMessageData.sender = { id: parentMessage.senderId, username: 'Unknown', fullName: 'Unknown User' };
        }
        messagesWithSenders.unshift(parentMessageData);
      }
    }

    res.json({ messages: messagesWithSenders });
  } catch (error) {
    console.error('Get thread messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.pinMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { messageId } = req.body;
    const userId = req.user.userId;

    const participant = await ConversationParticipant.findOne({
      where: { conversationId, userId, isActive: true }
    });

    if (!participant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const message = await Message.findOne({
      where: { id: messageId, conversationId }
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const existingPin = await PinnedMessage.findOne({
      where: { messageId }
    });

    if (existingPin) {
      return res.status(400).json({ message: 'Message is already pinned' });
    }

    const pinnedMessage = await PinnedMessage.create({
      conversationId,
      messageId,
      pinnedBy: userId
    });

    await pinnedMessage.reload({
      include: [{
        model: Message,
        as: 'message',
        required: false
      }]
    });

    res.status(201).json({ pinnedMessage });
  } catch (error) {
    console.error('Pin message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.unpinMessage = async (req, res) => {
  try {
    const { conversationId, messageId } = req.params;
    const userId = req.user.userId;

    const participant = await ConversationParticipant.findOne({
      where: { conversationId, userId, isActive: true }
    });

    if (!participant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const pinnedMessage = await PinnedMessage.findOne({
      where: { messageId, conversationId }
    });

    if (!pinnedMessage) {
      return res.status(404).json({ message: 'Pinned message not found' });
    }

    await pinnedMessage.destroy();

    res.json({ message: 'Message unpinned successfully' });
  } catch (error) {
    console.error('Unpin message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPinnedMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    const participant = await ConversationParticipant.findOne({
      where: { conversationId, userId, isActive: true }
    });

    if (!participant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const pinnedMessages = await PinnedMessage.findAll({
      where: { conversationId },
      include: [{
        model: Message,
        as: 'message',
        required: true,
        include: [{
          model: Message,
          as: 'replyTo',
          required: false,
          attributes: ['id', 'content', 'type', 'senderId']
        }]
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({ pinnedMessages });
  } catch (error) {
    console.error('Get pinned messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
