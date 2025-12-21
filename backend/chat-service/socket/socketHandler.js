const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const ConversationParticipant = require('../models/ConversationParticipant');
const { Op } = require('sequelize');
const { SOCKET_EVENTS, USER_STATUS, NOTIFICATION_TYPES } = require('../constants/socketEvents');
const ioInstance = require('./ioInstance');

const onlineUsers = new Map();

module.exports = (io) => {
  ioInstance.setIO(io);
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    console.log(`User connected: ${socket.userId}`);

    onlineUsers.set(socket.userId, socket.id);

    io.emit(SOCKET_EVENTS.USER_STATUS_CHANGE, {
      userId: socket.userId,
      status: USER_STATUS.ONLINE
    });

    socket.join(`user_${socket.userId}`);

    socket.on(SOCKET_EVENTS.JOIN_CONVERSATION, async (conversationId) => {
      try {
        const participant = await ConversationParticipant.findOne({
          where: { conversationId, userId: socket.userId }
        });

        if (participant) {
          socket.join(`conversation_${conversationId}`);
          console.log(`User ${socket.userId} joined conversation ${conversationId}`);
        }
      } catch (error) {
        console.error('Join conversation error:', error);
      }
    });

    socket.on(SOCKET_EVENTS.SEND_MESSAGE, async (data) => {
      try {
        const { conversationId, content, type, fileUrl, replyToId, threadId } = data;

        const conversation = await Conversation.findByPk(conversationId);
        if (!conversation) {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Conversation not found' });
          return;
        }

        const participant = await ConversationParticipant.findOne({
          where: { conversationId, userId: socket.userId, isActive: true }
        });

        if (!participant) {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Access denied' });
          return;
        }

        if (conversation.type === 'group' && conversation.adminOnlyChat && participant.role !== 'admin') {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Chỉ admin mới có quyền gửi tin nhắn trong nhóm này' });
          return;
        }

        if (replyToId) {
          const replyToMessage = await Message.findOne({
            where: { id: replyToId, conversationId }
          });
          if (!replyToMessage) {
            socket.emit(SOCKET_EVENTS.ERROR, { message: 'Reply message not found' });
            return;
          }
        }

        if (threadId) {
          const Thread = require('../models/Thread');
          const thread = await Thread.findOne({
            where: { id: threadId, conversationId }
          });
          if (!thread) {
            socket.emit(SOCKET_EVENTS.ERROR, { message: 'Thread not found' });
            return;
          }
        }

        const message = await Message.create({
          conversationId,
          senderId: socket.userId,
          content,
          type: type || 'text',
          fileUrl,
          replyToId: replyToId || null,
          threadId: threadId || null
        });

        if (replyToId) {
          await message.reload({
            include: [{
              model: Message,
              as: 'replyTo',
              required: false,
              attributes: ['id', 'content', 'type', 'senderId']
            }]
          });
        }

        await Conversation.update(
          { lastMessageAt: new Date() },
          { where: { id: conversationId } }
        );

        let messageData = message.toJSON();
        if (messageData.replyTo) {
          messageData.replyTo = message.replyTo ? message.replyTo.toJSON() : null;
        }
        
        try {
          const axios = require('axios');
          const userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:3003';
          const token = socket.handshake.auth.token;
          const response = await axios.get(`${userServiceUrl}/api/users/${socket.userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          messageData.sender = response.data.user;
        } catch (error) {
          console.error(`Failed to load sender ${socket.userId}:`, error);
          messageData.sender = { id: socket.userId, username: 'Unknown', fullName: 'Unknown User' };
        }
        
        io.to(`conversation_${conversationId}`).emit(SOCKET_EVENTS.NEW_MESSAGE, {
          message: messageData
        });

        const participants = await ConversationParticipant.findAll({
          where: {
            conversationId,
            userId: { [Op.ne]: socket.userId },
            isActive: true
          }
        });

        const notificationController = require('../controllers/notificationController');
        for (const participant of participants) {
          await notificationController.createNotification(
            participant.userId,
            NOTIFICATION_TYPES.MESSAGE,
            'Tin nhắn mới',
            `Bạn có tin nhắn mới từ ${conversationId}`,
            { conversationId, messageId: message.id }
          );

          io.to(`user_${participant.userId}`).emit(SOCKET_EVENTS.NOTIFICATION, {
            type: NOTIFICATION_TYPES.MESSAGE,
            title: 'Tin nhắn mới',
            message: content.substring(0, 50),
            conversationId
          });
        }

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to send message' });
      }
    });

    socket.on(SOCKET_EVENTS.TYPING, (data) => {
      const { conversationId, isTyping } = data;
      socket.to(`conversation_${conversationId}`).emit(SOCKET_EVENTS.USER_TYPING, {
        userId: socket.userId,
        isTyping
      });
    });

    socket.on(SOCKET_EVENTS.MARK_AS_READ, async (data) => {
      try {
        const { conversationId } = data;

        await ConversationParticipant.update(
          { lastReadAt: new Date() },
          { where: { conversationId, userId: socket.userId } }
        );

        socket.to(`conversation_${conversationId}`).emit(SOCKET_EVENTS.MESSAGES_READ, {
          userId: socket.userId,
          conversationId
        });
      } catch (error) {
        console.error('Mark read error:', error);
      }
    });

    socket.on(SOCKET_EVENTS.GET_ONLINE_USERS, () => {
      const onlineUserIds = Array.from(onlineUsers.keys());
      socket.emit(SOCKET_EVENTS.ONLINE_USERS, { userIds: onlineUserIds });
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log(`User disconnected: ${socket.userId}`);

      onlineUsers.delete(socket.userId);

      io.emit(SOCKET_EVENTS.USER_STATUS_CHANGE, {
        userId: socket.userId,
        status: USER_STATUS.OFFLINE
      });
    });
  });

  io.getOnlineUsers = () => {
    return Array.from(onlineUsers.keys());
  };
};
